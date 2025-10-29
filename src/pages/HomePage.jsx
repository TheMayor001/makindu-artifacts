// src/pages/HomePage.jsx

import React, { useEffect, useState, useMemo } from "react";
import { collection, query, onSnapshot } from "firebase/firestore";
import { Search } from "lucide-react"; // Import the search icon
import { db } from "../services/firebase";
import Header from "../components/Header";
import ProductCard from "../components/ProductCard";

// Define the structure for product data
const ARTIFACTS_COLLECTION = "artifacts";
// CRITICAL FIX: Use the global variable if available, otherwise use a default
const APP_ID = typeof __app_id !== "undefined" ? __app_id : "default-app-id";

const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState(""); // State for the search input
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // 1. Define the Firestore path for public artifacts
    // Path: /artifacts/{appId}/public/data/artifacts
    const artifactsRef = collection(
      db,
      "artifacts",
      APP_ID,
      "public",
      "data",
      ARTIFACTS_COLLECTION
    );

    // Create a query
    const q = query(artifactsRef);

    // 2. Set up the real-time listener (onSnapshot)
    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        try {
          const artifactsList = [];
          querySnapshot.forEach((doc) => {
            // Extract data and include the Firestore document ID
            artifactsList.push({ id: doc.id, ...doc.data() });
          });

          setProducts(artifactsList);
          setIsLoading(false);
        } catch (e) {
          console.error("Error fetching documents: ", e);
          setError("Failed to load products. Check console for details.");
          setIsLoading(false);
        }
      },
      (e) => {
        console.error("Snapshot listener failed: ", e);
        setError("Connection error to database.");
        setIsLoading(false);
      }
    );

    // 3. Clean up the listener when the component unmounts
    return () => unsubscribe();
  }, []); // Empty dependency array means this runs once on mount

  // Use useMemo to filter products efficiently whenever 'products' or 'searchTerm' changes
  const filteredProducts = useMemo(() => {
    if (!searchTerm) {
      return products;
    }
    const lowerCaseSearch = searchTerm.toLowerCase();

    return products.filter(
      (product) =>
        // Filter based on product name
        product.name && product.name.toLowerCase().includes(lowerCaseSearch)
    );
  }, [products, searchTerm]);

  // --- Render Logic ---
  const renderContent = () => {
    if (isLoading) {
      return (
        <p className="text-center py-10 text-xl text-gray-600">
          Loading authentic Kenyan Handcrafts...
        </p>
      );
    }

    if (error) {
      return <p className="text-center py-10 text-xl text-red-600">{error}</p>;
    }

    if (products.length === 0) {
      return (
        <div className="text-center py-10">
          <p className="text-xl text-gray-600 mb-4">
            No artifacts found in the database yet.
          </p>
          <p className="text-gray-500">
            Please add some documents to the 'artifacts/{APP_ID}
            /public/data/artifacts' collection in Firestore.
          </p>
        </div>
      );
    }

    if (filteredProducts.length === 0 && searchTerm) {
      return (
        <div className="text-center py-10">
          <p className="text-xl text-gray-600 mb-4">
            No results found for "
            <span className="font-semibold text-indigo-600">{searchTerm}</span>
            ".
          </p>
          <p className="text-gray-500">Try refining your search terms.</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {filteredProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 font-sans">
      <Header />
      <main className="container mx-auto p-4 md:p-8 flex-grow">
        {/* Hero Section */}
        <div className="text-center bg-white p-8 md:p-16 rounded-3xl shadow-lg mb-12">
          <h1 className="text-4xl md:text-6xl font-extrabold text-indigo-800 mb-4 tracking-tight">
            Discover Kenyan Artistry
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
            Handcrafted treasures, rich in story and culture, delivered to you.
          </p>
        </div>

        {/* Search Input Section */}
        <div className="max-w-xl mx-auto mb-10">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search for masks, carvings, jewelry..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full py-4 pl-12 pr-4 border-2 border-indigo-300 focus:border-indigo-600 rounded-full text-lg text-gray-700 placeholder-gray-500 transition duration-300 ease-in-out shadow-lg focus:outline-none focus:ring-4 focus:ring-indigo-600/20"
            />
          </div>
        </div>

        {/* Featured Artifacts Section */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-800 border-b-2 border-indigo-200 pb-2 mb-8">
            {/* Conditional title based on search state */}
            {searchTerm ? `Results for "${searchTerm}"` : "Featured Artifacts"}
          </h2>
          {renderContent()}
        </section>
      </main>

      {/* Simple Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12 py-4">
        <div className="container mx-auto text-center text-gray-500 text-sm">
          © 2025 Makindu Handcrafts. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
