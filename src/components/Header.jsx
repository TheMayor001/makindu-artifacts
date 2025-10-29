// src/components/Header.jsx
import React from "react";
// Added User icon back for completeness, alongside ShoppingCart and Heart
import { ShoppingCart, Heart, User } from "lucide-react";

const Header = () => {
  return (
    <header className="bg-white shadow-md sticky top-0 z-10">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        {/* Logo/Site Title */}
        <div className="flex items-center space-x-2">
          {/* Logo icon for visual interest */}
          <svg
            className="w-6 h-6 text-indigo-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0v-4a1 1 0 011-1h2a1 1 0 011 1v4m-6 0h6"
            ></path>
          </svg>
          <span className="text-xl font-bold text-gray-800 hidden sm:inline">
            Makindu Handcrafts
          </span>
          {/* Mobile logo */}
          <span className="text-indigo-600 text-3xl font-extrabold tracking-tight sm:hidden">
            M.H.
          </span>
        </div>

        {/* Navigation/Actions */}
        <nav className="flex items-center space-x-3 md:space-x-6">
          {/* User Account */}
          <button
            className="p-2 text-gray-600 hover:text-indigo-600 transition duration-150 rounded-full hover:bg-indigo-50"
            aria-label="User Account"
          >
            <User size={24} />
          </button>

          {/* Wishlist */}
          <button
            className="p-2 text-gray-600 hover:text-indigo-600 transition duration-150 rounded-full hover:bg-indigo-50"
            aria-label="Wishlist"
          >
            <Heart size={24} />
          </button>

          {/* Shopping Cart */}
          <button
            className="p-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition duration-150 relative shadow-lg"
            aria-label="Shopping Cart"
          >
            <ShoppingCart size={24} />
            <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
              0 {/* Cart Count Placeholder */}
            </span>
          </button>
        </nav>
      </div>
    </header>
  );
};

export default Header;
