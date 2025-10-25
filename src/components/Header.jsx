// src/components/Header.jsx
import React from "react";
import { ShoppingCart, Heart } from "lucide-react"; // Placeholder icons for future use

const Header = () => {
  return (
    <header className="bg-white shadow-md sticky top-0 z-10">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        {/* Logo/Site Title */}
        <div className="flex items-center space-x-2">
          <span className="text-indigo-600 text-3xl font-extrabold tracking-tight">
            M.A.
          </span>
          <span className="hidden sm:inline text-xl font-bold text-gray-800">
            Makindu Artifacts
          </span>
        </div>

        {/* Navigation/Actions */}
        <nav className="flex items-center space-x-6">
          {/* Search Placeholder */}
          <div className="relative hidden md:block">
            <input
              type="text"
              placeholder="Search artifacts..."
              className="px-4 py-2 w-64 border border-gray-300 rounded-full focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
            />
          </div>

          {/* Icons */}
          <button
            className="p-2 text-gray-600 hover:text-indigo-600 transition duration-150 rounded-full hover:bg-indigo-50"
            aria-label="Wishlist"
          >
            <Heart size={24} />
          </button>

          <button
            className="p-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition duration-150 relative shadow-lg"
            aria-label="Shopping Cart"
          >
            <ShoppingCart size={24} />
            <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
              0
            </span>
          </button>
        </nav>
      </div>
    </header>
  );
};

export default Header;
