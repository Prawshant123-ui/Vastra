import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { authApi } from "../api/endpoints.js";
import { AuthShell } from "./Login.jsx";
import Loader from "../components/Loader.jsx";

export default function VerifyEmail() {
  const [sp] = useSearchParams();
  const [state, setState] = useState({ loading: true, ok: false, message: "" });

  useEffect(() => {
    const token = sp.get("token");
    if (!token) return setState({ loading: false, ok: false, message: "Missing verification token." });
    authApi.verifyEmail(token)
      .then((r) => setState({ loading: false, ok: true, message: r.data?.message || "Email verified." }))
      .catch((e) => setState({ loading: false, ok: false, message: e?.response?.data?.message || "Verification failed." }));
  }, [sp]);

  return (
    <AuthShell title="Email verification">
      {state.loading ? <Loader /> : (
        <div className="text-center">
          <p className={`text-${state.ok ? "dark" : "primary"} mb-4`}>{state.message}</p>
          <Link to="/login" className="btn-primary inline-flex">Go to sign in</Link>
        </div>
      )}
    </AuthShell>
  );
}
