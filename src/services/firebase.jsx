// src/services/firebase.js

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"; // <-- Ensure this is imported

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCCzWnoxwwPfmMYxEK-1kH2YEssrTw5KBA",
  authDomain: "makindu-artifacts.firebaseapp.com",
  projectId: "makindu-artifacts",
  storageBucket: "makindu-artifacts.firebasestorage.app",
  messagingSenderId: "674681786999",
  appId: "1:674681786999:web:2d5f01caf3a05fe5fdec72"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);

// Export the database reference to be used by other parts of the application
export { db };
