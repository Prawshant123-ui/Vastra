import { useState } from "react";
import toast from "react-hot-toast";
import { FiMail } from "react-icons/fi";
import { authApi } from "../api/endpoints.js";
import { AuthShell, Field } from "./Login.jsx";
import { Link } from "react-router-dom";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await authApi.forgotPassword(email);
      setSent(true);
      toast.success("If that email exists, a reset link is on its way.");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Request failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell title="Forgot password?" subtitle="We'll email you a reset link.">
      {sent ? (
        <div className="text-center">
          <p className="text-body">Check your inbox for a reset link.</p>
          <Link to="/login" className="btn-primary mt-5 inline-flex">Back to sign in</Link>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <Field icon={<FiMail />} type="email" placeholder="Your email" value={email} onChange={setEmail} required />
          <button disabled={busy} className="btn-primary w-full">{busy ? "Sending…" : "Send reset link"}</button>
        </form>
      )}
    </AuthShell>
  );
}
