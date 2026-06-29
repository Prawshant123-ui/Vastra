import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { FiPlus, FiMapPin, FiCreditCard } from "react-icons/fi";
import { addressApi, orderApi, paymentApi } from "../api/endpoints.js";
import { useCart } from "../context/CartContext.jsx";
import Loader from "../components/Loader.jsx";

export default function Checkout() {
  const nav = useNavigate();
  const { cart, refresh } = useCart();
  const [addresses, setAddresses] = useState([]);
  const [selected, setSelected] = useState(null);
  const [notes, setNotes] = useState("");
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ label: "home", street: "", city: "", state: "", country: "", postalCode: "", isDefault: true });
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [payMethod, setPayMethod] = useState("cod");

  const loadAddresses = async () => {
    try {
      const { data } = await addressApi.list();
      setAddresses(data.data || []);
      const def = (data.data || []).find((a) => a.isDefault) || data.data?.[0];
      if (def) setSelected(def.id);
    } catch { /* ignore */ }
    setLoading(false);
  };

  useEffect(() => { loadAddresses(); }, []);

  useEffect(() => {
    if (!loading && (!cart.items || cart.items.length === 0)) nav("/cart");
  }, [loading, cart.items, nav]);

  const addAddress = async (e) => {
    e.preventDefault();
    try {
      const { data } = await addressApi.add(form);
      toast.success("Address added");
      setAdding(false);
      setForm({ label: "home", street: "", city: "", state: "", country: "", postalCode: "", isDefault: false });
      await loadAddresses();
      setSelected(data.data.id);
    } catch (e) { toast.error(e?.response?.data?.message || "Failed to add address"); }
  };

  const place = async () => {
    if (!selected) return toast.error("Please select a shipping address");
    setPlacing(true);
    try {
      const { data } = await orderApi.place({ shippingAddressId: selected, notes });
      const orderId = data.data?.id;
      await refresh();
      if (payMethod === "khalti") {
        try {
          const pay = await paymentApi.initiate(orderId);
          const url = pay.data?.data?.payment_url || pay.data?.payment_url;
          if (url) { window.location.href = url; return; }
        } catch { toast.error("Payment failed — you can pay from the order page."); }
      }
      nav(`/order-success/${orderId}`);
    } catch (e) {
      toast.error(e?.response?.data?.message || "Could not place order");
    } finally { setPlacing(false); }
  };

  if (loading) return <Loader full />;
  const items = cart.items || [];
  const subtotal = Number(cart.total) || 0;
  const shipping = subtotal >= 50 ? 0 : 5;
  const total = subtotal + shipping;

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-8 py-12">
      <h1 className="text-4xl mb-8">Checkout</h1>
      <div className="grid md:grid-cols-[1fr_360px] gap-8">
        <div className="space-y-6">
          {/* Addresses */}
          <section className="card-base p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg flex items-center gap-2"><FiMapPin /> Shipping address</h3>
              <button onClick={() => setAdding((v) => !v)} className="btn-outline !py-1.5 !px-3 text-sm"><FiPlus /> Add</button>
            </div>
            {addresses.length === 0 && !adding && <p className="text-sm text-body">No saved addresses yet.</p>}
            <div className="grid sm:grid-cols-2 gap-3">
              {addresses.map((a) => (
                <button
                  key={a.id}
                  onClick={() => setSelected(a.id)}
                  className={`text-left p-4 rounded-2xl border-2 transition ${selected === a.id ? "border-primary bg-section" : "border-border hover:border-primary/60"}`}
                >
                  <p className="text-xs uppercase tracking-wide text-muted">{a.label}{a.isDefault && " · Default"}</p>
                  <p className="text-sm text-dark mt-1">{a.street}</p>
                  <p className="text-sm text-body">{a.city}, {a.state} {a.postalCode}</p>
                  <p className="text-sm text-body">{a.country}</p>
                </button>
              ))}
            </div>
            {adding && (
              <motion.form initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} onSubmit={addAddress} className="mt-5 grid sm:grid-cols-2 gap-3">
                {[
                  ["label", "Label (home/work)"], ["street", "Street"], ["city", "City"], ["state", "State"], ["country", "Country"], ["postalCode", "Postal code"],
                ].map(([k, p]) => (
                  <input key={k} required={k !== "label"} placeholder={p} value={form[k]} onChange={(e) => setForm({ ...form, [k]: e.target.value })} className="input-base" />
                ))}
                <label className="flex items-center gap-2 text-sm text-body sm:col-span-2">
                  <input type="checkbox" checked={form.isDefault} onChange={(e) => setForm({ ...form, isDefault: e.target.checked })} /> Make default
                </label>
                <div className="sm:col-span-2 flex gap-2">
                  <button type="submit" className="btn-primary">Save address</button>
                  <button type="button" onClick={() => setAdding(false)} className="btn-ghost">Cancel</button>
                </div>
              </motion.form>
            )}
          </section>

          {/* Payment (modular) */}
          <section className="card-base p-6">
            <h3 className="text-lg flex items-center gap-2 mb-4"><FiCreditCard /> Payment method</h3>
            <div className="space-y-3">
              <PayOpt id="cod" value={payMethod} onChange={setPayMethod} title="Cash on delivery" desc="Pay when your order arrives." />
              <PayOpt id="khalti" value={payMethod} onChange={setPayMethod} title="Khalti" desc="Online payment via Khalti." />
              <PayOpt id="stripe" value={payMethod} onChange={setPayMethod} title="Stripe (coming soon)" desc="Will work once enabled in backend." disabled />
            </div>
          </section>

          {/* Notes */}
          <section className="card-base p-6">
            <h3 className="text-lg mb-3">Order notes</h3>
            <textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Anything we should know?" className="input-base resize-none" />
          </section>
        </div>

        <aside className="card-base p-6 h-fit sticky top-24">
          <h3 className="text-lg mb-4">Summary</h3>
          <div className="space-y-2 mb-3 max-h-64 overflow-auto">
            {items.map((it) => (
              <div key={it.id} className="flex items-center gap-2 text-sm">
                <span className="text-muted">{it.quantity}×</span>
                <span className="flex-1 truncate text-dark">{it.product.name}</span>
                <span className="text-dark">${(Number(it.product.discountPrice ?? it.product.price) * it.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="h-px bg-border my-3" />
          <Row label="Subtotal" value={`$${subtotal.toFixed(2)}`} />
          <Row label="Shipping" value={shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`} />
          <div className="h-px bg-border my-3" />
          <Row label="Total" value={`$${total.toFixed(2)}`} bold />
          <button onClick={place} disabled={placing || !selected} className="btn-primary w-full mt-5">{placing ? "Placing order…" : "Place order"}</button>
          <Link to="/cart" className="btn-ghost w-full text-center block mt-2">Back to cart</Link>
        </aside>
      </div>
    </div>
  );
}

function PayOpt({ id, value, onChange, title, desc, disabled }) {
  return (
    <label className={`flex items-start gap-3 p-4 rounded-2xl border-2 cursor-pointer transition ${value === id ? "border-primary bg-section" : "border-border"} ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}>
      <input type="radio" name="pay" value={id} checked={value === id} disabled={disabled} onChange={() => onChange(id)} className="mt-1" />
      <div>
        <p className="font-semibold text-dark">{title}</p>
        <p className="text-xs text-body">{desc}</p>
      </div>
    </label>
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
