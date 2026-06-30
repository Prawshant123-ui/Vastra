import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FiShoppingBag, FiMinus, FiPlus, FiTrash2 } from "react-icons/fi";
import { useCart } from "../context/CartContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import EmptyState from "../components/EmptyState.jsx";
import Loader from "../components/Loader.jsx";

export default function Cart() {
  const { cart, loading, updateItem, removeItem, clear } = useCart();
  const { isAuthenticated } = useAuth();
  const nav = useNavigate();

  if (!isAuthenticated) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16">
        <EmptyState
          icon={<FiShoppingBag />}
          title="Sign in to view your cart"
          action={<Link to="/login?from=/cart" className="btn-primary">Sign in</Link>}
        />
      </div>
    );
  }

  if (loading) return <Loader full />;
  const items = cart.items || [];
  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16">
        <EmptyState
          icon={<FiShoppingBag />}
          title="Your cart is empty"
          description="A good story starts somewhere."
          action={<Link to="/shop" className="btn-primary">Find something lovely</Link>}
        />
      </div>
    );
  }

  const subtotal = Number(cart.total) || 0;
  const shipping = subtotal >= 50 ? 0 : 5;
  const total = subtotal + shipping;

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-8 py-12">
      <h1 className="text-4xl mb-8">Your cart</h1>
      <div className="grid md:grid-cols-[1fr_360px] gap-8">
        <div className="space-y-3">
          {items.map((it, i) => {
            const p = it.product;
            const price = Number(p.discountPrice ?? p.price);
            return (
              <motion.div key={it.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} className="card-base p-4 flex gap-4">
                <Link to={`/product/${p.slug}`} className="w-24 h-24 rounded-xl bg-section overflow-hidden shrink-0">
                  {p.images?.[0]?.imageUrl && <img src={p.images[0].imageUrl} alt={p.name} className="w-full h-full object-cover" />}
                </Link>
                <div className="flex-1 min-w-0">
                  <Link to={`/product/${p.slug}`} className="font-medium text-dark hover:text-primary line-clamp-2">{p.name}</Link>
                  <p className="text-sm text-muted mt-1">${price.toFixed(2)} each</p>
                  <div className="mt-3 flex items-center gap-2">
                    <div className="flex items-center border border-border rounded-full">
                      <button onClick={() => updateItem(it.id, Math.max(1, it.quantity - 1))} className="p-2 hover:bg-section rounded-l-full"><FiMinus /></button>
                      <span className="px-3 text-dark font-semibold min-w-[2rem] text-center">{it.quantity}</span>
                      <button onClick={() => updateItem(it.id, it.quantity + 1)} className="p-2 hover:bg-section rounded-r-full"><FiPlus /></button>
                    </div>
                    <button onClick={() => removeItem(it.id)} className="btn-ghost !p-2 ml-auto text-primary"><FiTrash2 /></button>
                  </div>
                </div>
                <p className="font-display text-lg text-dark">Rs{(price * it.quantity).toFixed(2)}</p>
              </motion.div>
            );
          })}
          <button onClick={clear} className="btn-outline mt-2">Clear cart</button>
        </div>

        <aside className="card-base p-6 h-fit sticky top-24">
          <h3 className="text-lg mb-4">Order summary</h3>
          <Row label="Subtotal" value={`$${subtotal.toFixed(2)}`} />
          <Row label="Shipping" value={shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`} />
          <div className="h-px bg-border my-3" />
          <Row label="Total" value={`$${total.toFixed(2)}`} bold />
          <button onClick={() => nav("/checkout")} className="btn-primary w-full mt-5">Proceed to checkout</button>
          <p className="text-xs text-muted mt-3 text-center">Free shipping on orders over Rs 50.</p>
        </aside>
      </div>
    </div>
  );
}

function Row({ label, value, bold }) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-sm text-body">{label}</span>
      <span className={bold ? "text-xl font-display text-dark" : "text-sm font-medium text-dark"}>{value}</span>
    </div>
  );
}
