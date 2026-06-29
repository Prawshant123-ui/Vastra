import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FiHeart, FiShoppingBag, FiTrash2 } from "react-icons/fi";
import { useWishlist } from "../context/WishlistContext.jsx";
import { useCart } from "../context/CartContext.jsx";
import EmptyState from "../components/EmptyState.jsx";

export default function Wishlist() {
  const { wishlist, remove } = useWishlist();
  const { addItem } = useCart();
  const items = wishlist.items || [];

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16">
        <EmptyState
          icon={<FiHeart />}
          title="Your wishlist is empty"
          description="Save the pieces you love for later."
          action={<Link to="/shop" className="btn-primary">Browse shop</Link>}
        />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-8 py-12">
      <h1 className="text-4xl mb-8">Wishlist</h1>
      <div className="grid sm:grid-cols-2 gap-4">
        {items.map((it, i) => {
          const p = it.product;
          const price = Number(p.discountPrice ?? p.price);
          return (
            <motion.div key={it.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} className="card-base p-4 flex gap-4">
              <Link to={`/product/${p.slug}`} className="w-24 h-24 rounded-xl bg-section overflow-hidden shrink-0">
                {p.images?.[0]?.imageUrl && <img src={p.images[0].imageUrl} alt={p.name} className="w-full h-full object-cover" />}
              </Link>
              <div className="flex-1 min-w-0">
                <Link to={`/product/${p.slug}`} className="font-medium text-dark hover:text-primary line-clamp-2">{p.name}</Link>
                <p className="font-semibold text-dark mt-1">${price.toFixed(2)}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button onClick={async () => { const ok = await addItem(p.id, 1); if (ok) remove(p.id); }} className="btn-primary !py-2 !px-3 text-sm"><FiShoppingBag /> Move to cart</button>
                  <button onClick={() => remove(p.id)} className="btn-outline !py-2 !px-3 text-sm"><FiTrash2 /></button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
