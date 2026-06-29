import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import Loader from "./Loader.jsx";

export default function AdminRoute() {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  if (loading) return <Loader full />;
  if (!isAuthenticated) return <Navigate to="/login?from=/admin" replace />;
  if (!isAdmin) return <Navigate to="/unauthorized" replace />;
  return <Outlet />;
}
