

import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  FiGrid, FiBarChart2, FiPackage, FiTag, FiShoppingBag,
  FiUsers, FiSettings, FiLogOut, FiArrowLeft, FiMenu, FiX,
} from "react-icons/fi";
import { useAuth } from "../context/AuthContext.jsx";

const links = [
  { to: "/admin",            icon: <FiGrid />,        label: "Dashboard", end: true },
  { to: "/admin/analytics",  icon: <FiBarChart2 />,   label: "Analytics" },
  { to: "/admin/products",   icon: <FiPackage />,     label: "Products" },
  { to: "/admin/categories", icon: <FiTag />,         label: "Categories" },
  { to: "/admin/orders",     icon: <FiShoppingBag />, label: "Orders" },
  { to: "/admin/users",      icon: <FiUsers />,       label: "Users" },
  { to: "/admin/settings",   icon: <FiSettings />,    label: "Settings" },
];

function SidebarContent({ user, onClose }) {
  const navigate = useNavigate();
  const { logout } = useAuth();

  return (
    <div className="flex flex-col h-full p-5">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="font-display text-xl text-dark">Admin</p>
          <p className="text-xs text-muted truncate">{user?.email}</p>
        </div>
        <button className="lg:hidden btn-ghost !p-2" onClick={onClose}>
          <FiX />
        </button>
      </div>

      <nav className="flex-1 space-y-1">
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            end={l.end}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors duration-150 ${
                isActive
                  ? "bg-primary text-white shadow-soft"
                  : "text-dark hover:bg-section"
              }`
            }
          >
            <span className="text-base">{l.icon}</span>
            {l.label}
          </NavLink>
        ))}
      </nav>

      <div className="pt-4 border-t border-border space-y-1">
        <button
          onClick={() => { navigate("/"); onClose(); }}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-dark hover:bg-section transition-colors duration-150"
        >
          <FiArrowLeft /> Back to store
        </button>
        <button
          onClick={() => { logout(); navigate("/"); }}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-dark hover:bg-section transition-colors duration-150"
        >
          <FiLogOut /> Sign out
        </button>
      </div>
    </div>
  );
}

export default function AdminLayout() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-bg">

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 flex-col bg-card border-r border-border h-screen sticky top-0">
        <SidebarContent user={user} onClose={() => {}} />
      </aside>

      {/* Mobile sidebar */}
      {open && (
        <>
          <div
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          />
          <aside className="fixed inset-y-0 left-0 z-40 w-64 bg-card border-r border-border lg:hidden">
            <SidebarContent user={user} onClose={() => setOpen(false)} />
          </aside>
        </>
      )}

      {/* Main content */}
      <div className="flex-1 min-w-0">
        <header className="lg:hidden sticky top-0 z-30 bg-bg/85 backdrop-blur-md border-b border-border h-14 flex items-center px-4">
          <button className="btn-ghost !p-2" onClick={() => setOpen(true)}>
            <FiMenu />
          </button>
          <p className="ml-2 font-display text-lg">Admin</p>
        </header>

        <main className="p-4 md:p-8 max-w-7xl mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}