import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { FiUser, FiMail, FiLock, FiPhone, FiEye, FiEyeOff } from "react-icons/fi";
import { useAuth } from "../context/AuthContext.jsx";
import { AuthShell, Field } from "./Login.jsx";

export default function Register() {
  const { register } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (form.password.length < 8) return toast.error("Password must be at least 8 characters");
    setBusy(true);
    try {
      await register(form);
      toast.success("Account created — check your email to verify.");
      nav("/login");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Registration failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell title="Create account" subtitle="Join the warm side of shopping.">
      <form onSubmit={submit} className="space-y-4">
        <Field icon={<FiUser />} placeholder="Full name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} required />
        <Field icon={<FiMail />} type="email" placeholder="Email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} required />
        <Field icon={<FiPhone />} placeholder="Phone" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} required />
        <Field
          icon={<FiLock />} type={show ? "text" : "password"} placeholder="Password (min 8)"
          value={form.password} onChange={(v) => setForm({ ...form, password: v })} required
          suffix={<button type="button" onClick={() => setShow(!show)} className="text-muted">{show ? <FiEyeOff /> : <FiEye />}</button>}
        />
        <button disabled={busy} className="btn-primary w-full">{busy ? "Creating…" : "Create account"}</button>
      </form>
      <p className="text-center text-sm text-body mt-6">
        Already have an account? <Link to="/login" className="text-primary font-semibold">Sign in</Link>
      </p>
    </AuthShell>
  );
}
