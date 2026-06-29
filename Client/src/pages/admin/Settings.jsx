import { useState } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import api from "../../api/axios";
import toast from "react-hot-toast";

export default function Settings() {
  const { user } = useAuth();

  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [pwLoading, setPwLoading] = useState(false);

  const handlePasswordChange = async () => {
    if (passwords.newPassword.length < 8) {
      return toast.error("New password must be at least 8 characters");
    }
    if (passwords.newPassword !== passwords.confirmPassword) {
      return toast.error("Passwords do not match");
    }
    setPwLoading(true);
    try {
      await api.patch("/auth/change-password", {
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      });
      toast.success("Password updated successfully");
      setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update password");
    } finally {
      setPwLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl">Settings</h1>

      {/* Store Admin Info */}
      <div className="card-base p-6">
        <h3 className="text-lg mb-3">Store admin</h3>
        <p className="text-sm text-body">
          Logged in as <strong className="text-dark">{user?.name}</strong> ({user?.email})
        </p>
      </div>

      {/* Change Password */}
      <div className="card-base p-6">
        <h3 className="text-lg mb-1">Change password</h3>
        <p className="text-xs text-muted mb-4">Update your admin account password.</p>
        <div className="space-y-3 max-w-sm">
          {[
            { key: "currentPassword", label: "Current password" },
            { key: "newPassword",     label: "New password" },
            { key: "confirmPassword", label: "Confirm new password" },
          ].map(({ key, label }) => (
            <div key={key}>
              <label className="text-xs text-muted block mb-1">{label}</label>
              <input
                type="password"
                value={passwords[key]}
                onChange={e => setPasswords(prev => ({ ...prev, [key]: e.target.value }))}
                className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-transparent focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          ))}
          <button
            onClick={handlePasswordChange}
            disabled={pwLoading || !passwords.currentPassword || !passwords.newPassword || !passwords.confirmPassword}
            className="mt-1 px-5 py-2 bg-primary text-white text-sm rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {pwLoading ? "Updating…" : "Update password"}
          </button>
        </div>
      </div>

      {/* API Info */}
      <div className="card-base p-6">
        <h3 className="text-lg mb-3">API</h3>
        <p className="text-sm text-body">
          Base URL:{" "}
          <code className="bg-section px-1 rounded text-primary">
            {import.meta.env.VITE_API_URL || "http://localhost:5000/api"}
          </code>
        </p>
        <p className="text-xs text-muted mt-2">
          Override at build time with <code>VITE_API_URL</code>.
        </p>
      </div>
    </div>
  );
}