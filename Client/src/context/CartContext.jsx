import { createContext, useCallback, useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { cartApi } from "../api/endpoints.js";
import { useAuth } from "./AuthContext.jsx";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState({ items: [], total: 0 });
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!isAuthenticated) {
      setCart({ items: [], total: 0 });
      return;
    }
    setLoading(true);
    try {
      const { data } = await cartApi.get();
      setCart(data.data || { items: [], total: 0 });
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addItem = async (productId, qty = 1) => {
    if (!isAuthenticated) {
      toast.error("Please log in to add to cart");
      return false;
    }
    try {
      await cartApi.add(productId, qty);
      toast.success("Added to cart");
      await refresh();
      return true;
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to add to cart");
      return false;
    }
  };

  const updateItem = async (itemId, qty) => {
    try {
      await cartApi.update(itemId, qty);
      await refresh();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to update cart");
    }
  };

  const removeItem = async (itemId) => {
    try {
      await cartApi.remove(itemId);
      toast.success("Removed from cart");
      await refresh();
    } catch {
      toast.error("Failed to remove item");
    }
  };

  const clear = async () => {
    try {
      await cartApi.clear();
      toast.success("Cart cleared");
      await refresh();
    } catch {
      toast.error("Failed to clear cart");
    }
  };

  const itemCount = (cart.items || []).reduce((s, i) => s + i.quantity, 0);

  return (
    <CartContext.Provider value={{ cart, loading, refresh, addItem, updateItem, removeItem, clear, itemCount }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
