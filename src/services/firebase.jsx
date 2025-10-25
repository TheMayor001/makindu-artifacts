// src/services/firebase.js

import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithCustomToken,
  signInAnonymously,
  onAuthStateChanged,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  setDoc,
  collection,
  query,
  onSnapshot,
  serverTimestamp,
  deleteDoc,
} from "firebase/firestore";

// Global variables provided by the environment
const appId = typeof __app_id !== "undefined" ? __app_id : "default-app-id";
const firebaseConfig =
  typeof __firebase_config !== "undefined"
    ? JSON.parse(__firebase_config)
    : null;
const initialAuthToken =
  typeof __initial_auth_token !== "undefined" ? __initial_auth_token : null;

// --- Firebase Initialization and Global Objects ---
let app;
let db;
let auth;

if (firebaseConfig) {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  auth = getAuth(app);
} else {
  console.error("Firebase config is missing. Cannot initialize database.");
}

// Global state variables for readiness
let isAuthReady = false;
let userId = null;

// --- Authentication Setup ---
/**
 * Initializes authentication and sets up the auth state listener.
 * @param {function(string | null): void} setUserIdCallback - Callback to set the user ID state.
 */
export const initializeAuth = async (setUserIdCallback) => {
  if (!auth || isAuthReady) return;

  // Use onAuthStateChanged to handle both initial sign-in and subsequent state changes
  onAuthStateChanged(auth, (user) => {
    if (user) {
      userId = user.uid;
      setUserIdCallback(userId);
      console.log("Auth State Changed: Signed in as", userId);
    } else {
      // User is signed out or initial token check failed
      userId = null;
      setUserIdCallback(null);
      console.log("Auth State Changed: User signed out or not authenticated.");

      // Attempt to sign in anonymously if no token is available for custom sign-in
      if (!initialAuthToken) {
        signInAnonymously(auth).catch((error) => {
          console.error("Error signing in anonymously:", error);
        });
      }
    }
    isAuthReady = true;
  });

  // Attempt to sign in using the provided custom token if available
  if (initialAuthToken) {
    try {
      await signInWithCustomToken(auth, initialAuthToken);
      console.log("Signed in with custom token.");
    } catch (error) {
      console.error("Error signing in with custom token:", error);
      // Fallback: If custom token fails, try anonymous sign-in
      try {
        await signInAnonymously(auth);
        console.log("Custom token failed, signed in anonymously.");
      } catch (anonError) {
        console.error(
          "Error signing in anonymously after token failure:",
          anonError
        );
      }
    }
  } else if (!isAuthReady) {
    // If no token and auth listener hasn't run, trigger anonymous sign-in
    // (onAuthStateChanged handles the state update afterwards)
    try {
      await signInAnonymously(auth);
      console.log("No token, signed in anonymously.");
    } catch (anonError) {
      console.error("Error during initial anonymous sign-in:", anonError);
    }
  }
};

// --- Firestore Paths and References ---

/** Gets the path to the public artifacts collection. */
const getPublicArtifactsCollectionPath = () =>
  `artifacts/${appId}/public/data/artifacts`;

/** Gets the path to the user's private cart collection. */
const getUserCartCollectionPath = (uid) => {
  if (!uid) {
    // Fallback for unauthenticated users (though cart should be handled by auth listener)
    console.warn("Attempted to get cart path without a valid user ID.");
    return null;
  }
  return `artifacts/${appId}/users/${uid}/cart`;
};

// --- Cart Operations ---

/**
 * Adds or updates an item in the user's cart in Firestore.
 * @param {string} userId - The current user's ID.
 * @param {object} item - The item object (must include id, quantity, price, name).
 */
export const addToCart = async (item) => {
  if (!userId) {
    console.error("Cannot add to cart: User not authenticated.");
    return;
  }
  const cartCollectionPath = getUserCartCollectionPath(userId);
  if (!cartCollectionPath) return;

  try {
    // Use the artifact ID as the document ID for easy reference/update
    const cartItemRef = doc(db, cartCollectionPath, item.id);

    await setDoc(
      cartItemRef,
      {
        ...item,
        timestamp: serverTimestamp(), // Record when the item was added/updated
      },
      { merge: true }
    ); // Use merge to only update the fields provided (like quantity)

    console.log(`Cart item ${item.id} added/updated successfully.`);
  } catch (error) {
    console.error("Error adding/updating cart item:", error);
    throw new Error("Failed to update cart.");
  }
};

/**
 * Removes an item from the user's cart in Firestore.
 * @param {string} userId - The current user's ID.
 * @param {string} artifactId - The ID of the item to remove.
 */
export const removeFromCart = async (artifactId) => {
  if (!userId) {
    console.error("Cannot remove from cart: User not authenticated.");
    return;
  }
  const cartCollectionPath = getUserCartCollectionPath(userId);
  if (!cartCollectionPath) return;

  try {
    const cartItemRef = doc(db, cartCollectionPath, artifactId);
    await deleteDoc(cartItemRef);
    console.log(`Cart item ${artifactId} removed successfully.`);
  } catch (error) {
    console.error("Error removing cart item:", error);
    throw new Error("Failed to remove item from cart.");
  }
};

/**
 * Sets up a real-time listener for the user's cart.
 * @param {function(Array<object>): void} callback - Function to handle cart updates.
 * @returns {function(): void} - Unsubscribe function.
 */
export const subscribeToUserCart = (callback) => {
  // Only subscribe if Firebase and a userId are available
  if (!db || !userId) {
    console.warn("Cannot subscribe to cart: Database or User ID is missing.");
    return () => {}; // Return a dummy unsubscribe function
  }

  const cartCollectionPath = getUserCartCollectionPath(userId);
  if (!cartCollectionPath) return () => {};

  const cartQuery = query(collection(db, cartCollectionPath));

  const unsubscribe = onSnapshot(
    cartQuery,
    (snapshot) => {
      const cartItems = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      // Sort the cart by timestamp to maintain order, most recent last
      cartItems.sort(
        (a, b) => a.timestamp?.toMillis() - b.timestamp?.toMillis()
      );
      callback(cartItems);
    },
    (error) => {
      console.error("Error subscribing to user cart:", error);
    }
  );

  console.log("Subscribed to user cart for:", userId);
  return unsubscribe;
};

// --- Artifacts Operations (Existing functions, kept for context) ---

/**
 * Saves a new artifact to the public collection.
 * @param {object} artifactData - The data for the new artifact.
 */
export const saveArtifact = async (artifactData) => {
  if (!db) {
    console.error("Database not initialized.");
    return;
  }

  const artifactsCollectionPath = getPublicArtifactsCollectionPath();
  const newArtifactRef = doc(collection(db, artifactsCollectionPath));

  try {
    await setDoc(newArtifactRef, {
      ...artifactData,
      timestamp: serverTimestamp(),
      id: newArtifactRef.id, // Ensure ID is saved within the document
    });
    console.log("Artifact saved with ID:", newArtifactRef.id);
  } catch (error) {
    console.error("Error saving artifact:", error);
  }
};

/**
 * Subscribes to the public artifacts collection.
 * @param {function(Array<object>): void} setArtifacts - Callback function to update artifact state.
 * @returns {function(): void} - Unsubscribe function.
 */
export const subscribeToArtifacts = (setArtifacts) => {
  if (!db) return () => {};

  const artifactsCollectionPath = getPublicArtifactsCollectionPath();
  const artifactsQuery = query(collection(db, artifactsCollectionPath));

  const unsubscribe = onSnapshot(
    artifactsQuery,
    (snapshot) => {
      const artifacts = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      // Sort by timestamp, newest first
      artifacts.sort(
        (a, b) => b.timestamp?.toMillis() - a.timestamp?.toMillis()
      );
      setArtifacts(artifacts);
    },
    (error) => {
      console.error("Error fetching artifacts:", error);
    }
  );

  return unsubscribe;
};

/**
 * Deletes an artifact from the public collection.
 * @param {string} artifactId - The ID of the artifact to delete.
 */
export const deleteArtifact = async (artifactId) => {
  if (!db) {
    console.error("Database not initialized.");
    return;
  }

  const artifactsCollectionPath = getPublicArtifactsCollectionPath();
  const artifactRef = doc(db, artifactsCollectionPath, artifactId);

  try {
    await deleteDoc(artifactRef);
    console.log("Artifact deleted:", artifactId);
  } catch (error) {
    console.error("Error deleting artifact:", error);
    throw new Error("Failed to delete artifact.");
  }
};

// --- Exports ---
export { db, auth, userId, appId, firebaseConfig };
