// src/components/ProductCard.jsx
import React from "react";

// ProductCard now accepts a 'product' object as a prop
const ProductCard = ({ product }) => {
  // Simple handler for the cart button placeholder
  const handleAddToCart = () => {
    console.log(`Adding ${product.name} to cart.`);
    // TODO: Implement actual cart logic later
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden transition transform hover:scale-[1.02] duration-300">
      {/* Placeholder Image */}
      <div className="w-full h-48 bg-gray-200 flex items-center justify-center text-gray-500 text-sm italic">
        {/* Using product.image for a placeholder. In a real app, this would be a proper image tag. */}
        <span className="p-4 text-center">
          {product.imagePlaceholder || "Artifact Image"}
        </span>
      </div>

      <div className="p-6">
        {/* Product Name */}
        <h3 className="text-xl font-semibold text-gray-800 mb-1 truncate">
          {product.name}
        </h3>

        {/* Product Price */}
        <p className="text-2xl font-bold text-indigo-600 mb-4">
          KES {product.price ? product.price.toLocaleString() : "N/A"}
        </p>

        {/* Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold shadow-md hover:bg-indigo-700 transition duration-150 active:bg-indigo-800"
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
