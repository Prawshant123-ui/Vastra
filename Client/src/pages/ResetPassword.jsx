import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { FiLock } from "react-icons/fi";
import { authApi } from "../api/endpoints.js";
import { AuthShell, Field } from "./Login.jsx";

export default function ResetPassword() {
  const [sp] = useSearchParams();
  const token = sp.get("token") || "";
  const [pw, setPw] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const nav = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    if (pw.length < 8) return toast.error("Password must be at least 8 characters");
    if (pw !== confirm) return toast.error("Passwords do not match");
    setBusy(true);
    try {
      await authApi.resetPassword({ token, password: pw });
      toast.success("Password reset. Please sign in.");
      nav("/login");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Reset failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell title="Set a new password">
      {!token ? (
        <div className="text-center text-body">
          <p>This link is missing a reset token.</p>
          <Link to="/forgot-password" className="btn-primary mt-5 inline-flex">Request a new link</Link>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <Field icon={<FiLock />} type="password" placeholder="New password" value={pw} onChange={setPw} required />
          <Field icon={<FiLock />} type="password" placeholder="Confirm new password" value={confirm} onChange={setConfirm} required />
          <button disabled={busy} className="btn-primary w-full">{busy ? "Saving…" : "Update password"}</button>
        </form>
      )}
    </AuthShell>
  );
}
