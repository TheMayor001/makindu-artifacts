// src/pages/CartPage.jsx
import React from "react";
import { useCart } from "../context/CartContext.jsx";
import { Trash2, Plus, Minus, ShoppingCart } from "lucide-react";

/**
 * CartItem Component: Renders a single item row in the shopping cart.
 */
const CartItem = ({ item }) => {
  // Access cart functions from the context
  const { updateItemQuantity, removeItem } = useCart();

  const handleQuantityChange = (delta) => {
    const newQuantity = item.quantity + delta;
    updateItemQuantity(item.id, newQuantity);
  };

  const handleRemove = () => {
    removeItem(item.id);
  };

  return (
    <div className="flex items-center justify-between p-4 border-b hover:bg-indigo-50 transition duration-150">
      {/* Product Info */}
      <div className="flex items-center space-x-4 flex-grow">
        {/* Placeholder Image/Icon */}
        <div className="w-12 h-12 bg-indigo-200 rounded-lg flex items-center justify-center text-indigo-800">
          <ShoppingCart size={20} />
        </div>
        <div>
          <h4 className="font-semibold text-gray-800">{item.name}</h4>
          <p className="text-sm text-gray-500">
            KES {item.price.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Quantity Controls */}
      <div className="flex items-center space-x-2">
        <div className="flex items-center border border-gray-300 rounded-lg">
          {/* Decrement Button */}
          <button
            onClick={() => handleQuantityChange(-1)}
            className="p-2 text-indigo-600 hover:bg-indigo-100 rounded-l-lg disabled:opacity-50"
            disabled={item.quantity <= 1}
          >
            <Minus size={16} />
          </button>

          {/* Quantity Display */}
          <span className="w-8 text-center font-medium text-gray-800">
            {item.quantity}
          </span>

          {/* Increment Button */}
          <button
            onClick={() => handleQuantityChange(1)}
            className="p-2 text-indigo-600 hover:bg-indigo-100 rounded-r-lg"
          >
            <Plus size={16} />
          </button>
        </div>

        {/* Remove Button (Trash) */}
        <button
          onClick={handleRemove}
          className="p-2 text-red-500 hover:bg-red-100 rounded-full transition duration-150"
          title="Remove Item"
        >
          <Trash2 size={20} />
        </button>
      </div>

      {/* Total Price for this item */}
      <span className="font-bold text-lg w-20 text-right text-indigo-700 hidden sm:block">
        KES {(item.price * item.quantity).toLocaleString()}
      </span>
    </div>
  );
};

/**
 * CartPage Component: Renders the full shopping cart interface.
 */
const CartPage = ({ onClose }) => {
  // Destructure everything needed from the context
  const { cartItems, cartTotal, itemCount, clearCart } = useCart();

  const handleCheckout = () => {
    if (itemCount === 0) return;

    // Placeholder for a real checkout process
    console.log(
      `Processing order for KES ${cartTotal.toLocaleString()} with ${itemCount} items.`
    );

    // Show success message and clear the cart
    alert("Thank you! Your order has been successfully placed (simulation).");
    clearCart();
    onClose(); // Close the modal after checkout
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col transform transition-all duration-300"
        onClick={(e) => e.stopPropagation()} // Stop click propagation inside the modal
      >
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b bg-indigo-50">
          <h2 className="text-3xl font-extrabold text-indigo-900">
            Your Shopping Cart ({itemCount} Item{itemCount !== 1 ? "s" : ""})
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:bg-gray-200 rounded-full transition duration-150"
            aria-label="Close Cart"
          >
            <Trash2 size={24} />
          </button>
        </div>

        {/* Cart Content */}
        <div className="flex-grow overflow-y-auto p-6 space-y-4">
          {cartItems.length === 0 ? (
            <div className="text-center p-12 text-gray-500">
              <ShoppingCart
                size={48}
                className="mx-auto text-indigo-300 mb-4"
              />
              <p className="text-xl font-medium">Your cart is empty.</p>
              <p className="mt-2 text-sm">
                Add some beautiful Kenyan handcrafts!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {cartItems.map((item) => (
                <CartItem key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>

        {/* Footer / Order Summary */}
        <div className="p-6 border-t bg-gray-50">
          <div className="flex justify-between items-center text-2xl font-bold mb-4">
            <span>Grand Total:</span>
            <span className="text-indigo-700">
              KES {cartTotal.toLocaleString()}
            </span>
          </div>

          <button
            onClick={handleCheckout}
            className="w-full py-4 bg-green-600 text-white font-semibold rounded-lg text-lg shadow-xl hover:bg-green-700 transition duration-200 disabled:bg-green-300"
            disabled={itemCount === 0}
          >
            Proceed to Checkout (Simulation)
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
