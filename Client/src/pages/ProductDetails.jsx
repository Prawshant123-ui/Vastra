import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FiHeart, FiShoppingBag, FiMinus, FiPlus, FiShield, FiTruck, FiRefreshCw } from "react-icons/fi";
import { productApi } from "../api/endpoints.js";
import { useCart } from "../context/CartContext.jsx";
import { useWishlist } from "../context/WishlistContext.jsx";
import Loader from "../components/Loader.jsx";
import Breadcrumb from "../components/Breadcrumb.jsx";
import ProductCard from "../components/ProductCard.jsx";
import EmptyState from "../components/EmptyState.jsx";

export default function ProductDetails() {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(0);
  const [related, setRelated] = useState([]);

  const { addItem } = useCart();
  const { inWishlist, toggle } = useWishlist();

  useEffect(() => {
    setLoading(true);
    setActiveImg(0);
    setQty(1);
    productApi.bySlug(slug)
      .then(async (r) => {
        const p = r.data.data;
        setProduct(p);
        if (p?.category?.id) {
          try {
            const rel = await productApi.list({ category: p.category.id, limit: 4 });
            setRelated((rel.data.data || []).filter((x) => x.id !== p.id).slice(0, 4));
          } catch { /* ignore */ }
        }
      })
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <Loader full />;
  if (!product) return <div className="max-w-3xl mx-auto py-20"><EmptyState title="Product not found" /></div>;

  const price = Number(product.discountPrice ?? product.price);
  const original = product.discountPrice ? Number(product.price) : null;
  const wished = inWishlist(product.id);

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12">
      <Breadcrumb items={[
        { to: "/", label: "Home" }, { to: "/shop", label: "Shop" },
        { label: product.category?.name }, { label: product.name },
      ]} />
      <div className="grid md:grid-cols-2 gap-10 mt-8">
        {/* Gallery */}
        <div>
          <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="aspect-square rounded-3xl overflow-hidden bg-section card-base !p-0">
            {product.images?.[activeImg] ? (
              <img src={product.images[activeImg].imageUrl} alt={product.name} className="w-full h-full object-cover" />
            ) : <div className="w-full h-full grid place-items-center text-muted">No image</div>}
          </motion.div>
          {product.images?.length > 1 && (
            <div className="mt-4 grid grid-cols-5 gap-2">
              {product.images.map((img, i) => (
                <button
                  key={img.id}
                  onClick={() => setActiveImg(i)}
                  className={`aspect-square rounded-xl overflow-hidden border-2 transition ${i === activeImg ? "border-primary" : "border-border hover:border-primary/60"}`}
                >
                  <img src={img.imageUrl} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <p className="chip">{product.category?.name}</p>
          <h1 className="text-3xl md:text-4xl mt-3">{product.name}</h1>
          {product.brand && <p className="text-sm text-muted mt-1">by {product.brand}</p>}

          <div className="flex items-baseline gap-3 mt-5">
            <p className="text-3xl font-display text-dark">${price.toFixed(2)}</p>
            {original && <p className="text-lg text-muted line-through">${original.toFixed(2)}</p>}
            {original && <span className="chip !bg-primary !text-white">Save {Math.round(((original - price) / original) * 100)}%</span>}
          </div>

          <p className="mt-6 text-body leading-relaxed whitespace-pre-line">{product.description}</p>

          <div className="mt-6 flex items-center gap-2">
            <span className="text-sm text-muted">SKU:</span>
            <span className="text-sm text-dark font-mono">{product.sku}</span>
          </div>

          <div className={`mt-2 text-sm font-medium ${product.stock > 0 ? "text-green-700" : "text-primary"}`}>
            {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
          </div>

          {/* Qty + actions */}
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <div className="flex items-center border-2 border-border rounded-full overflow-hidden">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="p-3 hover:bg-section"><FiMinus /></button>
              <span className="px-4 font-semibold text-dark min-w-[2.5rem] text-center">{qty}</span>
              <button onClick={() => setQty((q) => Math.min(product.stock || 999, q + 1))} className="p-3 hover:bg-section"><FiPlus /></button>
            </div>
            <button
              disabled={product.stock === 0}
              onClick={() => addItem(product.id, qty)}
              className="btn-primary flex-1 min-w-[160px]"
            >
              <FiShoppingBag /> Add to cart
            </button>
            <button
              onClick={() => toggle(product.id)}
              className={`btn-outline !p-3 ${wished ? "!border-primary !text-primary" : ""}`}
              aria-label="Wishlist"
            >
              <FiHeart className={wished ? "fill-current" : ""} />
            </button>
          </div>

          {/* Trust badges */}
          <div className="mt-8 grid grid-cols-3 gap-3">
            <Badge icon={<FiTruck />} title="Free over $50" />
            <Badge icon={<FiRefreshCw />} title="30-day returns" />
            <Badge icon={<FiShield />} title="Secure checkout" />
          </div>
        </motion.div>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <section className="mt-20">
          <h2 className="text-2xl md:text-3xl">You might also love</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mt-6">
            {related.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
          </div>
        </section>
      )}
    </div>
  );
}

function Badge({ icon, title }) {
  return (
    <div className="card-base p-3 text-center">
      <div className="text-primary text-xl mx-auto mb-1 grid place-items-center">{icon}</div>
      <p className="text-xs text-body">{title}</p>
    </div>
  );
}
