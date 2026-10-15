import React, { createContext, useContext, useState, useEffect } from "react";
import {
  getCart,
  addToCart as apiAddToCart,
  updateCartQuantity as apiUpdateCartQuantity,
  removeFromCart as apiRemoveFromCart,
} from "../services/api";

// Create React Context for global Cart state
const CartContext = createContext();

// Custom hook for easy access to CartContext across all components
export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch user's persistent cart from MongoDB backend on mount
  const fetchCart = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getCart();
      if (response.success && Array.isArray(response.cart)) {
        setCart(response.cart);
      } else if (Array.isArray(response)) {
        setCart(response);
      } else {
        setCart([]);
      }
    } catch (err) {
      console.error("CartContext fetch error:", err);
      // If error is not auth-related, set error message
      if (!err.message?.toLowerCase().includes("auth")) {
        setError("Unable to load your cart.");
      }
      setCart([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  // Derived state calculations (not stored in DB to prevent stale values)
  // Total units count across all cart rows (e.g. Keyboard x 2 + Mouse x 1 = 3)
  const totalItems = cart.reduce((total, item) => total + (item.quantity || 0), 0);

  // Total subtotal amount calculation (sum of price * quantity)
  const subtotal = cart.reduce(
    (total, item) => total + (item.product?.price || 0) * (item.quantity || 0),
    0
  );

  // Add product to cart action
  const addToCartAction = async (productId, quantity = 1) => {
    setError(null);
    try {
      const response = await apiAddToCart(productId, quantity);
      if (response.success && Array.isArray(response.cart)) {
        setCart(response.cart);
      } else {
        await fetchCart();
      }
      return response;
    } catch (err) {
      console.error("Error adding to cart:", err);
      throw err;
    }
  };

  // Update item quantity action
  const updateQuantityAction = async (productId, newQuantity) => {
    setError(null);
    try {
      const response = await apiUpdateCartQuantity(productId, newQuantity);
      if (response.success && Array.isArray(response.cart)) {
        setCart(response.cart);
      } else {
        await fetchCart();
      }
      return response;
    } catch (err) {
      console.error("Error updating cart quantity:", err);
      throw err;
    }
  };

  // Remove item from cart action
  const removeFromCartAction = async (productId) => {
    setError(null);
    try {
      const response = await apiRemoveFromCart(productId);
      if (response.success && Array.isArray(response.cart)) {
        setCart(response.cart);
      } else {
        await fetchCart();
      }
      return response;
    } catch (err) {
      console.error("Error removing from cart:", err);
      throw err;
    }
  };

  // Lab 06: Clear cart state after successful payment verification
  const clearCart = () => {
    setCart([]);
  };

  const value = {
    cart,
    loading,
    error,
    totalItems,
    subtotal,
    fetchCart,
    addToCart: addToCartAction,
    updateQuantity: updateQuantityAction,
    removeFromCart: removeFromCartAction,
    clearCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
