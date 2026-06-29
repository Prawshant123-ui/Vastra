import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { FiMail, FiLock, FiEye, FiEyeOff } from "react-icons/fi";
import { useAuth } from "../context/AuthContext.jsx";

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [sp] = useSearchParams();
  const [form, setForm] = useState({ email: "", password: "" });
  const [busy, setBusy] = useState(false);
  const [show, setShow] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const user = await login(form.email, form.password);
      toast.success("Welcome back!");
      const from = sp.get("from");
      if (from) nav(from, { replace: true });
      else if (user.role === "ADMIN") nav("/admin");
      else nav("/");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Login failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell title="Welcome back" subtitle="Sign in to continue your story with us.">
      <form onSubmit={submit} className="space-y-4">
        <Field icon={<FiMail />} type="email" placeholder="Email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} />
        <Field
          icon={<FiLock />} type={show ? "text" : "password"} placeholder="Password"
          value={form.password} onChange={(v) => setForm({ ...form, password: v })}
          suffix={<button type="button" onClick={() => setShow(!show)} className="text-muted">{show ? <FiEyeOff /> : <FiEye />}</button>}
        />
        <div className="flex justify-end">
          <Link to="/forgot-password" className="text-sm text-primary hover:underline">Forgot password?</Link>
        </div>
        <button disabled={busy} className="btn-primary w-full">{busy ? "Signing in…" : "Sign in"}</button>
      </form>
      <p className="text-center text-sm text-body mt-6">
        New here? <Link to="/register" className="text-primary font-semibold">Create an account</Link>
      </p>
    </AuthShell>
  );
}

export function AuthShell({ title, subtitle, children }) {
  return (
    <div className="max-w-md mx-auto px-4 py-12 md:py-20">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="card-base p-8">
        <h1 className="text-3xl">{title}</h1>
        {subtitle && <p className="text-body mt-2 text-sm">{subtitle}</p>}
        <div className="mt-6">{children}</div>
      </motion.div>
    </div>
  );
}

export function Field({ icon, suffix, value, onChange, ...rest }) {
  return (
    <div className="relative">
      {icon && <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted">{icon}</span>}
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`input-base ${icon ? "pl-10" : ""} ${suffix ? "pr-10" : ""}`}
        {...rest}
      />
      {suffix && <span className="absolute right-3 top-1/2 -translate-y-1/2">{suffix}</span>}
    </div>
  );
}
