import { useState } from "react";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { FiMail, FiPhone, FiMapPin } from "react-icons/fi";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    await new Promise((r) => setTimeout(r, 700));
    toast.success("Thanks! We'll reply within a day or two.");
    setForm({ name: "", email: "", message: "" });
    setBusy(false);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-8 py-16 grid md:grid-cols-2 gap-12">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        
        <h1 className="text-4xl md:text-5xl mt-3">Get in touch</h1>
        <p className="mt-3 text-body">We answer everything personally, usually within 24 hours.</p>
        <div className="mt-8 space-y-4 text-sm text-body">
          <Row icon={<FiMail />}>vastraheritage@shop.com</Row>
          <Row icon={<FiPhone />}>+977-9864436694</Row>
          <Row icon={<FiMapPin />}>Kailashnagar, Bharatpur-05, Chitwan, Nepal</Row>
        </div>
      </motion.div>
      <motion.form initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} onSubmit={submit} className="card-base p-6 md:p-8 space-y-4">
        <div>
          <label className="text-sm font-semibold text-dark">Name</label>
          <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-base mt-1.5" />
        </div>
        <div>
          <label className="text-sm font-semibold text-dark">Email</label>
          <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input-base mt-1.5" />
        </div>
        <div>
          <label className="text-sm font-semibold text-dark">Message</label>
          <textarea required rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="input-base mt-1.5 resize-none" />
        </div>
        <button disabled={busy} className="btn-primary w-full">{busy ? "Sending…" : "Send message"}</button>
      </motion.form>
    </div>
  );
}

function Row({ icon, children }) {
  return <div className="flex items-center gap-3"><span className="w-10 h-10 rounded-full bg-section grid place-items-center text-primary">{icon}</span>{children}</div>;
}
