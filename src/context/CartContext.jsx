// src/context/CartContext.jsx
import React, {
  createContext,
  useContext,
  useState,
  useMemo,
  useCallback,
} from "react";

// 1. Define the Context
const CartContext = createContext();

/**
 * Custom hook to use the cart context
 * @returns {object} The cart state and control functions
 */
export const useCart = () => {
  return useContext(CartContext);
};

// 2. Define the Provider Component
export const CartProvider = ({ children }) => {
  // State to hold the cart items
  // Format: { [artifactId]: { ...artifactData, quantity: N } }
  const [cartItems, setCartItems] = useState({});

  /**
   * Adds an item to the cart or increments its quantity if it already exists.
   * @param {object} product - The artifact object to add.
   */
  const addToCart = useCallback((product) => {
    setCartItems((prevItems) => {
      const { id } = product;
      const existingItem = prevItems[id];

      if (existingItem) {
        // If item exists, increment quantity
        return {
          ...prevItems,
          [id]: {
            ...existingItem,
            quantity: existingItem.quantity + 1,
          },
        };
      } else {
        // If new item, add with quantity 1
        return {
          ...prevItems,
          [id]: {
            ...product,
            quantity: 1,
          },
        };
      }
    });
  }, []);

  // --- NEW FUNCTIONS FOR CART PAGE CONTROL ---

  /**
   * Updates the quantity of a specific item in the cart.
   * If the newQuantity is 0 or less, the item is removed.
   * @param {string} id - The ID of the artifact.
   * @param {number} newQuantity - The new quantity.
   */
  const updateItemQuantity = useCallback((id, newQuantity) => {
    setCartItems((prevItems) => {
      // Ensure quantity is a valid number
      const quantity = Math.max(0, Number(newQuantity) || 0);

      if (quantity <= 0) {
        // If quantity is 0, remove the item
        const { [id]: _, ...rest } = prevItems;
        return rest;
      }

      // Otherwise, update the quantity
      const existingItem = prevItems[id];
      if (!existingItem) return prevItems; // Should not happen if UI is correct

      return {
        ...prevItems,
        [id]: {
          ...existingItem,
          quantity: quantity,
        },
      };
    });
  }, []);

  /**
   * Completely removes an item from the cart.
   * @param {string} id - The ID of the artifact to remove.
   */
  const removeItem = useCallback((id) => {
    setCartItems((prevItems) => {
      const { [id]: _, ...rest } = prevItems;
      return rest;
    });
  }, []);

  /**
   * Clears all items from the cart. Used after placeholder checkout.
   */
  const clearCart = useCallback(() => {
    console.log("Cart cleared after checkout simulation.");
    setCartItems({});
  }, []);

  // --- DERIVED STATE / MEMOIZED VALUES ---

  // Convert the cart object into an array for easier rendering
  const cartArray = useMemo(() => Object.values(cartItems), [cartItems]);

  // Calculate total number of items (not quantity)
  const itemCount = useMemo(() => cartArray.length, [cartArray]);

  // Calculate total cost
  const cartTotal = useMemo(() => {
    return cartArray.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  }, [cartArray]);

  // 3. Memoize the context value
  const contextValue = useMemo(
    () => ({
      cartItems: cartArray, // We expose the array format for easier iteration
      itemCount,
      cartTotal,
      addToCart,
      updateItemQuantity,
      removeItem,
      clearCart,
    }),
    [
      cartArray,
      itemCount,
      cartTotal,
      addToCart,
      updateItemQuantity,
      removeItem,
      clearCart,
    ]
  );

  // 4. Provide the value to children
  return (
    <CartContext.Provider value={contextValue}>{children}</CartContext.Provider>
  );
};

// Export the provider and the hook
export default CartContext;
