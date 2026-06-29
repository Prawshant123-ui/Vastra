import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FiHeart, FiShoppingBag } from "react-icons/fi";
import { useWishlist } from "../context/WishlistContext.jsx";
import { useCart } from "../context/CartContext.jsx";

export default function ProductCard({ product, index = 0 }) {
  const { inWishlist, toggle } = useWishlist();
  const { addItem } = useCart();
  const img = product.images?.[0]?.imageUrl;
  const price = Number(product.discountPrice ?? product.price);
  const original = product.discountPrice ? Number(product.price) : null;
  const wished = inWishlist(product.id);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: Math.min(index, 8) * 0.04 }}
      whileHover={{ y: -4 }}
      className="card-base overflow-hidden group flex flex-col"
    >
      <Link to={`/product/${product.slug}`} className="block relative aspect-square bg-section overflow-hidden">
        {img ? (
          <img
            src={img}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full grid place-items-center text-muted text-sm">No image</div>
        )}
        {original && (
          <span className="absolute top-3 left-3 chip !bg-primary !text-white">
            -{Math.round(((original - price) / original) * 100)}%
          </span>
        )}
        <button
          onClick={(e) => { e.preventDefault(); toggle(product.id); }}
          className={`absolute top-3 right-3 w-9 h-9 grid place-items-center rounded-full transition ${
            wished ? "bg-primary text-white" : "bg-white/90 text-dark hover:bg-white"
          }`}
          aria-label="Toggle wishlist"
        >
          <FiHeart className={wished ? "fill-current" : ""} />
        </button>
      </Link>
      <div className="p-4 flex-1 flex flex-col">
        <p className="text-xs uppercase tracking-wider text-muted">{product.category?.name}</p>
        <Link to={`/product/${product.slug}`} className="font-medium text-dark mt-1 line-clamp-2 hover:text-primary transition">
          {product.name}
        </Link>
        <div className="mt-auto pt-3 flex items-end justify-between gap-2">
          <div>
            <p className="font-semibold text-dark">${price.toFixed(2)}</p>
            {original && <p className="text-xs text-muted line-through">${original.toFixed(2)}</p>}
          </div>
          <button
            onClick={() => addItem(product.id, 1)}
            disabled={product.stock === 0}
            className="btn-primary !py-2 !px-3 text-sm"
            aria-label="Add to cart"
          >
            <FiShoppingBag />
          </button>
        </div>
        {product.stock === 0 && <p className="text-xs text-primary mt-2">Out of stock</p>}
      </div>
    </motion.div>
  );
}
