// src/App.jsx
import React, { useEffect, useState, useMemo, useCallback } from "react";
// Import CartContext components
import { CartProvider, useCart } from "./context/CartContext.jsx";
import CartPage from "./pages/CartPage.jsx"; // Import the new CartPage

import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInAnonymously,
  signInWithCustomToken,
  onAuthStateChanged,
  setPersistence,
  browserSessionPersistence,
} from "firebase/auth";
import {
  getFirestore,
  collection,
  query,
  onSnapshot,
  addDoc,
  deleteDoc,
  doc,
  setLogLevel,
} from "firebase/firestore";
import {
  Heart,
  Search,
  ShoppingCart,
  X,
  Trash2,
  Plus,
  AlertTriangle,
  Loader,
  CheckCircle,
} from "lucide-react";

// Initialize logging for better debugging (optional, but helpful)
setLogLevel("debug");

// ----------------------------------------------------------------------
// 🚨 CRITICAL: LOCAL FALLBACK CONFIGURATION (UPDATED)
// ----------------------------------------------------------------------
const LOCAL_FIREBASE_CONFIG = {
  apiKey: "AIzaSyCCzWnoxwwPfmMYxEK-1kH2YEssrTw5KBA",
  authDomain: "makindu-artifacts.firebaseapp.com",
  projectId: "makindu-artifacts",
  storageBucket: "makindu-artifacts.firebasestorage.app",
  messagingSenderId: "674681786999",
  appId: "1:674681786999:web:2d5f01caf3a05fe5fdec72",
};
// ----------------------------------------------------------------------

// --- Main Application Component ---

const App = () => {
  // State for Firebase instances and ID
  const [db, setDb] = useState(null);
  const [auth, setAuth] = useState(null);
  const [appId, setAppId] = useState("default-app-id");
  const [dbError, setDbError] = useState(null);

  // State for user session and data
  const [artifacts, setArtifacts] = useState([]);
  const [userId, setUserId] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  // We keep this state to control the modal visibility
  const [showCartModal, setShowCartModal] = useState(false);

  // ----------------------------------------------------------------------
  // 1. Firebase Initialization and Authentication
  // ----------------------------------------------------------------------
  useEffect(() => {
    // This function encapsulates all initialization logic
    const initializeFirebase = async () => {
      let firebaseConfig = null;
      let initialAuthToken = null;
      let currentAppId = "default-app-id";
      let isLocalRun = false;

      // --- STEP 1: Check Global Variables ---
      try {
        currentAppId =
          typeof __app_id !== "undefined" ? __app_id : "default-app-id";

        firebaseConfig =
          typeof __firebase_config !== "undefined"
            ? JSON.parse(__firebase_config)
            : null;

        initialAuthToken =
          typeof __initial_auth_token !== "undefined"
            ? __initial_auth_token
            : null;

        // --- FALLBACK CHECK ---
        if (!firebaseConfig) {
          firebaseConfig = LOCAL_FIREBASE_CONFIG;
          isLocalRun = true;
          console.warn(
            "FIREBASE INIT: Using LOCAL_FIREBASE_CONFIG fallback for local testing."
          );
        }

        if (
          !firebaseConfig ||
          !firebaseConfig.apiKey ||
          firebaseConfig.apiKey.includes("YOUR_API_KEY")
        ) {
          throw new Error(
            "Missing or invalid Firebase Configuration. Please provide your actual config object."
          );
        }

        console.log(
          `FIREBASE INIT: Config loaded (Local Fallback: ${isLocalRun}).`
        );
        console.log(`FIREBASE INIT: App ID: ${currentAppId}`);
        console.log(`FIREBASE INIT: Auth Token present: ${!!initialAuthToken}`);

        // --- STEP 2: Initialize App and Services ---
        const app = initializeApp(firebaseConfig);
        const newAuth = getAuth(app);
        const newDb = getFirestore(app);

        setDb(newDb);
        setAuth(newAuth);
        setAppId(currentAppId);
        setDbError(null); // Clear any previous error

        // --- STEP 3: Auth State and Sign In ---
        await setPersistence(newAuth, browserSessionPersistence);

        let signInMethod = "Anonymous";
        if (!isLocalRun && initialAuthToken) {
          // Only use token if we are in the hosted environment
          await signInWithCustomToken(newAuth, initialAuthToken);
          signInMethod = "Custom Token";
        } else {
          // Fallback to anonymous sign-in for local environment
          await signInAnonymously(newAuth);
        }
        console.log(`FIREBASE AUTH: Signed in using ${signInMethod}.`);

        // --- STEP 4: Set up the Auth listener ---
        const unsubscribeAuth = onAuthStateChanged(newAuth, (user) => {
          if (user) {
            setUserId(user.uid);
            console.log(`FIREBASE AUTH: Current User ID set: ${user.uid}`);
          } else {
            setUserId("unauthenticated");
            console.log(
              "FIREBASE AUTH: User is unauthenticated (signed out/anonymous)."
            );
          }
          setIsAuthReady(true);
        });

        // Cleanup function
        return () => unsubscribeAuth();
      } catch (error) {
        console.error(
          "Firebase Initialization Failed (CRITICAL ERROR):",
          error
        );
        // Set the specific error message to be displayed in the UI
        setDbError(`Initialization Failed: ${error.message}`);
        setIsAuthReady(true); // Still mark as ready to display the error state
      }
    };

    initializeFirebase();
  }, []); // Run only once on mount

  // --- Utility Functions ---

  // Constructs the public artifacts collection path, dependent on initialized state
  const getArtifactsCollectionRef = useMemo(() => {
    if (!db) return null;
    return collection(db, "artifacts", appId, "public", "data", "artifacts");
  }, [db, appId]);

  // ----------------------------------------------------------------------
  // 2. Real-time Data Listener for Artifacts
  // ----------------------------------------------------------------------
  useEffect(() => {
    // Wait until auth is ready, we have a database instance, and no critical error
    if (!isAuthReady || !db || dbError) return;

    const collectionRef = getArtifactsCollectionRef;
    if (!collectionRef) return;

    const artifactsQuery = query(collectionRef);

    console.log(
      `FIRESTORE: Listening to path: /artifacts/${appId}/public/data/artifacts`
    );

    const unsubscribe = onSnapshot(
      artifactsQuery,
      (snapshot) => {
        const fetchedArtifacts = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          // Ensure price is parsed and defaults to 0 if invalid
          price: parseFloat(doc.data().price) || 0,
        }));
        setArtifacts(fetchedArtifacts);
        console.log(
          `FIRESTORE: Successfully fetched ${fetchedArtifacts.length} artifacts.`
        );
      },
      (error) => {
        console.error(
          "Firestore Snapshot Error (Check Security Rules):",
          error
        );
        // This usually means a Security Rule violation, or the database is not set up.
        setDbError(
          `Failed to fetch artifacts (Security or Setup Issue): ${error.message}.`
        );
      }
    );

    return () => unsubscribe();
  }, [isAuthReady, db, dbError, getArtifactsCollectionRef]); // Dependencies on state variables

  // --- CRUD Operations (Admin Functionality) ---

  // Function to add a new artifact
  const handleAddArtifact = async (newArtifact) => {
    const collectionRef = getArtifactsCollectionRef;
    if (!collectionRef) {
      console.error(
        "Database connection error. Cannot add artifact. (Collection Ref is null)"
      );
      return false;
    }

    const artifactData = {
      ...newArtifact,
      // Convert price to number immediately
      price: parseFloat(newArtifact.price) || 0,
      createdAt: new Date().toISOString(),
      addedBy: userId || "unknown",
    };
    console.log("Adding artifact data:", artifactData);

    try {
      const docRef = await addDoc(collectionRef, artifactData);
      console.log(`Artifact added successfully with ID: ${docRef.id}`);
      return true; // Indicate success
    } catch (error) {
      console.error("Error adding artifact:", error);
      // Display the specific error message, often points to security rules
      setDbError(
        `Add Error: ${error.message}. Please check your Firestore Security Rules to ensure authenticated users can write to the public collection.`
      );
      return false; // Indicate failure
    }
  };

  // Function to delete an artifact
  const handleDeleteArtifact = async (id) => {
    const collectionRef = getArtifactsCollectionRef;
    if (!collectionRef) return;

    // MANDATORY FIX: Replacing window.confirm() with a console log/message
    // as confirm() is forbidden in this environment. A real app would use a custom modal.
    console.log(`Attempting to delete artifact ${id}.`);

    // NOTE: For now, we allow the delete to proceed without user confirmation
    // to comply with the no-alert/no-confirm rule.

    try {
      const artifactDocRef = doc(collectionRef, id);
      await deleteDoc(artifactDocRef);
      console.log(`Artifact ${id} deleted successfully.`);
    } catch (error) {
      console.error("Error deleting artifact:", error);
      setDbError(`Delete Error: ${error.message}. Check Security Rules.`);
    }
  };

  // --- Header Component (Updated to use useCart) ---

  const Header = () => {
    // Get item count from the new Cart Context
    const { itemCount } = useCart();

    const displayUserId = (id) => {
      if (id === "unauthenticated") return "Anonymous";
      // MANDATORY FIX: Display the full userId string
      return id || "Loading...";
    };

    return (
      <header className="fixed top-0 left-0 right-0 z-30 bg-white shadow-md">
        <div className="max-w-7xl mx-auto p-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Heart className="h-7 w-7 text-indigo-600" />
            <h1 className="text-2xl font-extrabold text-indigo-900 tracking-tight">
              M.A. Makindu Artifacts
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="hidden sm:flex relative">
              <input
                type="text"
                placeholder="Search artifacts..."
                className="p-2 pl-4 pr-10 rounded-full border border-gray-200 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
              />
              <Search className="h-5 w-5 text-gray-400 absolute right-3 top-1/2 transform -translate-y-1/2" />
            </div>

            <button
              onClick={() => setShowAdminModal(true)}
              className="flex items-center bg-green-500 text-white font-semibold py-2 px-4 rounded-full hover:bg-green-600 transition duration-150 shadow-lg"
            >
              <Plus className="h-5 w-5 mr-1" />
              Admin
            </button>

            <div className="text-gray-600 font-semibold text-sm">
              User:{" "}
              {isAuthReady ? (
                displayUserId(userId)
              ) : (
                <span className="text-yellow-600">Authenticating...</span>
              )}
            </div>

            <button
              onClick={() => setShowCartModal(true)}
              className="relative p-2 text-indigo-600 hover:text-indigo-800 transition duration-150"
            >
              <ShoppingCart className="h-7 w-7" />
              {itemCount > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                  {itemCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>
    );
  };

  const Hero = () => (
    <div className="mt-20 pt-16 pb-12 bg-indigo-50 rounded-xl text-center shadow-inner">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-5xl font-extrabold text-indigo-900 mb-4">
          Discover Kenyan Artistry
        </h2>
        <p className="text-xl text-indigo-700 mb-8">
          Handcrafted treasures, rich in story and culture, delivered to you.
        </p>
        <button className="bg-indigo-600 text-white font-bold py-3 px-8 rounded-full text-lg hover:bg-indigo-700 transition duration-300 shadow-xl">
          Shop All Collections
        </button>
      </div>
    </div>
  );

  // --- ProductCard Component (Updated to use useCart) ---
  const ProductCard = ({ artifact }) => {
    // Use the context's addToCart function directly
    const { addToCart } = useCart();

    return (
      <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden flex flex-col">
        {/* Image/Placeholder */}
        <div className="w-full h-48 bg-gray-100 flex items-center justify-center overflow-hidden">
          {artifact.imageUrl ? (
            <img
              src={artifact.imageUrl}
              alt={artifact.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src =
                  "https://placehold.co/400x300/e9d5ff/4c1d95?text=Image+Missing";
              }}
            />
          ) : (
            <div className="text-gray-400 text-sm p-4 text-center">
              {artifact.name || "No Image URL Provided"}
            </div>
          )}
        </div>

        <div className="p-5 flex flex-col flex-grow">
          <h3 className="text-xl font-bold text-indigo-900 mb-2">
            {artifact.name}
          </h3>
          <p className="text-sm text-gray-600 flex-grow mb-3 line-clamp-2">
            {artifact.description}
          </p>
          <p className="text-2xl font-extrabold text-indigo-600 mb-4">
            KES {artifact.price.toLocaleString("en-KE")}
          </p>
          <div className="flex justify-between items-center mt-auto">
            <button
              onClick={() => addToCart(artifact)} // Using context function
              className="bg-indigo-500 text-white font-semibold py-2 px-4 rounded-full hover:bg-indigo-600 transition duration-150 shadow-md flex-grow mr-2"
            >
              Add to Cart
            </button>
            <button
              onClick={() => handleDeleteArtifact(artifact.id)}
              className="p-2 text-red-500 hover:text-red-700 rounded-full transition duration-150"
              title="Delete Artifact"
            >
              <Trash2 className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  const AdminPanel = ({ isOpen, onClose }) => {
    const [formData, setFormData] = useState({
      name: "",
      description: "",
      price: "",
      imageUrl: "", // Text input for URL
    });
    const [status, setStatus] = useState(null); // 'success', 'error', 'loading'

    const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
      setStatus(null);
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      setStatus("loading");

      // Basic validation
      if (
        !formData.name ||
        !formData.price ||
        isNaN(parseFloat(formData.price))
      ) {
        setStatus("error");
        console.error("Validation failed: Name and valid Price are required.");
        return;
      }

      const success = await handleAddArtifact(formData);

      if (success) {
        setStatus("success");
        setFormData({ name: "", description: "", price: "", imageUrl: "" }); // Reset form
        setTimeout(() => setStatus(null), 3000);
      } else {
        setStatus("error");
      }
    };

    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-8 transform transition-all duration-300 scale-100">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-indigo-900">
              Add New Artifact (Admin)
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition duration-150"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Artifact Name
              </label>
              <input
                type="text"
                name="name"
                id="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full border border-gray-300 p-3 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Description
              </label>
              <textarea
                name="description"
                id="description"
                value={formData.description}
                onChange={handleChange}
                rows="3"
                className="w-full border border-gray-300 p-3 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                required
              ></textarea>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="price"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Price (KES)
                </label>
                <input
                  type="number"
                  name="price"
                  id="price"
                  value={formData.price}
                  onChange={handleChange}
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                  step="0.01"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="imageUrl"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Product Image URL
                </label>
                <input
                  type="url"
                  name="imageUrl"
                  id="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleChange}
                  placeholder="e.g., https://example.com/image.jpg"
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-lg font-medium text-white transition duration-200 ${
                  status === "loading"
                    ? "bg-indigo-400 cursor-not-allowed"
                    : "bg-indigo-600 hover:bg-indigo-700"
                }`}
                disabled={status === "loading"}
              >
                {status === "loading" ? (
                  <>
                    <Loader className="h-5 w-5 mr-3 animate-spin" />
                    Adding...
                  </>
                ) : status === "success" ? (
                  <>
                    <CheckCircle className="h-5 w-5 mr-3" />
                    Added Successfully!
                  </>
                ) : (
                  "Add Artifact to Store"
                )}
              </button>
            </div>
            {status === "error" && (
              <p className="mt-3 text-red-600 text-sm text-center font-medium flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 mr-2" />
                Failed to add. Check console for error details.
              </p>
            )}
          </form>
        </div>
      </div>
    );
  };

  // --- Main Render Logic ---

  if (!isAuthReady || (!db && !dbError)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-8">
        <Loader className="h-10 w-10 animate-spin text-indigo-500 mb-4" />
        <p className="text-xl font-medium text-indigo-800 mb-2">
          Connecting to Makindu Artifacts Database...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* The entire application is now wrapped in the CartProvider,
        giving all children access to cart state and functions.
      */}
      <CartProvider>
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
          <Hero />

          {dbError && (
            <div className="mt-8 bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-xl relative shadow-md">
              <p className="font-bold text-lg flex items-center">
                <AlertTriangle className="h-6 w-6 mr-3" />
                Database Error: Configuration/Auth
              </p>
              <p className="text-sm mt-2 font-mono break-words">{dbError}</p>
              <p className="text-xs mt-3 italic">
                **Action:** Please check the browser console for specific
                errors. If you are using a local fallback config, ensure your
                **Firebase Security Rules** permit read/write access for
                authenticated or anonymous users.
              </p>
            </div>
          )}

          <div className="mt-16">
            <h2 className="text-4xl font-extrabold text-indigo-900 mb-8">
              Featured Artifacts
            </h2>

            {/* Conditional Rendering based on artifacts length */}
            {artifacts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {artifacts.map((artifact) => (
                  <ProductCard key={artifact.id} artifact={artifact} />
                ))}
              </div>
            ) : (
              <div className="bg-white p-12 rounded-xl text-center shadow-lg border border-gray-200">
                <p className="text-2xl font-medium text-gray-700">
                  No artifacts found in the database yet.
                </p>
                <p className="mt-4 text-gray-500">
                  Please use the **+ Admin** button to add the first product to
                  the
                  <code className="bg-gray-100 p-1 rounded text-sm text-indigo-600">
                    /artifacts/{appId}/public/data/artifacts
                  </code>{" "}
                  collection in Firestore.
                </p>
              </div>
            )}
          </div>
        </main>

        {/* Admin Modal */}
        <AdminPanel
          isOpen={showAdminModal}
          onClose={() => setShowAdminModal(false)}
        />

        {/* Full Cart Page Modal */}
        {showCartModal && <CartPage onClose={() => setShowCartModal(false)} />}
      </CartProvider>
    </div>
  );
};

export default App;
