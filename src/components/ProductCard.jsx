// src/components/ProductCard.jsx
import React, { useState } from "react";
// FIX: Changed '../App.jsx' to '../../App.jsx' to correctly resolve the path
// since ProductCard.jsx is in src/components and App.jsx is in src/.
import { useCart } from "../../App.jsx";
import { Loader2, Trash2, ShoppingCart } from "lucide-react";

/**
 * Renders a single product artifact card.
 * @param {object} artifact - The artifact data object.
 * @param {boolean} isAdmin - If the current user has admin privileges.
 * @param {function} onDelete - Callback for deleting the artifact.
 */
const ProductCard = ({ artifact, isAdmin, onDelete }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const { handleAddToCart, cartItems } = useCart();

  const isAdded = cartItems.some((item) => item.id === artifact.id);

  const handleDelete = async () => {
    // IMPORTANT: Replace window.confirm with a custom modal in production apps
    if (
      onDelete &&
      window.confirm(
        `Are you sure you want to delete the artifact: ${artifact.name}?`
      )
    ) {
      setIsDeleting(true);
      try {
        await onDelete(artifact.id);
      } catch (e) {
        console.error("Deletion failed:", e);
        // The actual error handling happens in the parent component/service layer
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handleAdd = async () => {
    setIsAdding(true);
    try {
      // Add 1 to the cart (the logic handles new addition or increment)
      await handleAddToCart(artifact.id, 1);
    } catch (e) {
      console.error("Failed to add to cart:", e);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden flex flex-col border border-gray-100">
      <div className="w-full h-48 bg-purple-600 flex items-center justify-center p-4">
        <img
          src={
            artifact.imageUrl ||
            `https://placehold.co/400x300/6366f1/ffffff?text=${artifact.name.substring(
              0,
              15
            )}`
          }
          alt={artifact.name}
          className="w-full h-full object-cover rounded-md"
          onError={(e) => {
            e.target.onerror = null; // Prevent infinite loop
            e.target.src = `https://placehold.co/400x300/6366f1/ffffff?text=TEST ITEM`;
          }}
        />
      </div>

      <div className="p-4 flex flex-col flex-grow">
        <h3 className="text-xl font-bold text-gray-900 truncate">
          {artifact.name}
        </h3>
        <p className="text-sm text-gray-500 mt-1 flex-grow overflow-hidden line-clamp-2">
          {artifact.description}
        </p>
        <div className="mt-3">
          <p className="text-2xl font-extrabold text-purple-600">
            KES {Number(artifact.price).toLocaleString()}
          </p>
        </div>

        <div className="flex space-x-2 mt-4">
          {/* Add to Cart Button */}
          <button
            onClick={handleAdd}
            disabled={isAdding}
            className={`flex-grow flex items-center justify-center px-4 py-2 text-sm font-semibold rounded-lg transition duration-300 shadow-md 
                            ${
                              isAdded
                                ? "bg-purple-100 text-purple-700"
                                : "bg-purple-600 text-white hover:bg-purple-700"
                            } 
                            ${isAdding ? "opacity-70 cursor-wait" : ""}`}
          >
            {isAdding ? (
              <Loader2 className="animate-spin mr-2" size={20} />
            ) : (
              <ShoppingCart className="mr-2" size={20} />
            )}
            {isAdded ? "Item Added!" : "Add to Cart"}
          </button>

          {/* Admin Delete Button */}
          {isAdmin && (
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className={`p-3 rounded-lg text-white transition duration-300 shadow-md flex items-center justify-center
                                ${
                                  isDeleting
                                    ? "bg-red-400 cursor-wait"
                                    : "bg-red-500 hover:bg-red-600"
                                }`}
              aria-label="Delete Artifact"
            >
              {isDeleting ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <Trash2 size={20} />
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
