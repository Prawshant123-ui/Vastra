import { createContext, useCallback, useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { wishlistApi } from "../api/endpoints.js";
import { useAuth } from "./AuthContext.jsx";

const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [wishlist, setWishlist] = useState({ items: [] });

  const refresh = useCallback(async () => {
    if (!isAuthenticated) return setWishlist({ items: [] });
    try {
      const { data } = await wishlistApi.get();
      setWishlist(data.data || { items: [] });
    } catch {
      /* ignore */
    }
  }, [isAuthenticated]);

  useEffect(() => { refresh(); }, [refresh]);

  const inWishlist = (productId) =>
    (wishlist.items || []).some((i) => i.productId === productId || i.product?.id === productId);

  const toggle = async (productId) => {
    if (!isAuthenticated) {
      toast.error("Please log in to use wishlist");
      return;
    }
    try {
      if (inWishlist(productId)) {
        await wishlistApi.remove(productId);
        toast.success("Removed from wishlist");
      } else {
        await wishlistApi.add(productId);
        toast.success("Added to wishlist");
      }
      await refresh();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Wishlist action failed");
    }
  };

  const remove = async (productId) => {
    try {
      await wishlistApi.remove(productId);
      await refresh();
    } catch {
      toast.error("Failed to remove");
    }
  };

  return (
    <WishlistContext.Provider value={{ wishlist, refresh, inWishlist, toggle, remove, count: (wishlist.items || []).length }}>
      {children}
    </WishlistContext.Provider>
  );
}

export const useWishlist = () => useContext(WishlistContext);
