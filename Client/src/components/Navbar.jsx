import { Link, NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import { FiSearch, FiShoppingBag, FiHeart, FiUser, FiMenu, FiX, FiLogOut, FiSettings } from "react-icons/fi";
import { useAuth } from "../context/AuthContext.jsx";
import { useCart } from "../context/CartContext.jsx";
import { useWishlist } from "../context/WishlistContext.jsx";

const nav = [
  { to: "/",        label: "Home" },
  { to: "/shop",    label: "Shop" },
  { to: "/about",   label: "About" },
  { to: "/contact", label: "Contact" },
];

export default function Navbar() {
  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  const { itemCount }      = useCart();
  const { count: wishCount } = useWishlist();
  const [open, setOpen]    = useState(false);
  const [menu, setMenu]    = useState(false);
  const [q, setQ]          = useState("");
  const navigate           = useNavigate();

  const submitSearch = (e) => {
    e.preventDefault();
    navigate(`/shop?search=${encodeURIComponent(q.trim())}`);
    setOpen(false);
  };

  const linkClass = ({ isActive }) =>
    `relative px-1 py-2 text-sm font-medium transition-colors ${
      isActive ? "text-primary" : "text-dark hover:text-primary"
    }`;

  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-bg/85 border-b border-border">
      <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center gap-4">

        {/* Logo */}
     <Link
  to="/"
  className="flex items-center gap-2 font-display text-2xl font-semibold text-dark"
>
  <span className="text-primary">✦</span>
  <span>Vastra</span>
</Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6 ml-6">
          {nav.map((n) => (
            <NavLink key={n.to} to={n.to} end={n.to === "/"} className={linkClass}>
              {n.label}
            </NavLink>
          ))}
        </nav>

        {/* Search */}
        <form onSubmit={submitSearch} className="hidden lg:flex items-center flex-1 max-w-md ml-auto">
          <div className="relative w-full">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search products..."
              className="input-base pl-11"
            />
          </div>
        </form>

        {/* Icons */}
        <div className="flex items-center gap-1 ml-auto lg:ml-3">
          <Link to="/wishlist" className="relative btn-ghost p-2.5" aria-label="Wishlist">
            <FiHeart className="text-xl" />
            {wishCount > 0 && <Badge>{wishCount}</Badge>}
          </Link>
          <Link to="/cart" className="relative btn-ghost p-2.5" aria-label="Cart">
            <FiShoppingBag className="text-xl" />
            {itemCount > 0 && <Badge>{itemCount}</Badge>}
          </Link>

          {/* User menu */}
          {isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setMenu((v) => !v)}
                className="btn-ghost p-2.5"
                aria-label="Account"
              >
                <FiUser className="text-xl" />
              </button>

              {menu && (
                <div
                  className="absolute right-0 mt-2 w-56 card-base p-2 z-50"
                  onMouseLeave={() => setMenu(false)}
                >
                  <div className="px-3 py-2">
                    <p className="text-sm font-semibold text-dark truncate">{user?.name}</p>
                    <p className="text-xs text-muted truncate">{user?.email}</p>
                  </div>
                  <div className="h-px bg-border my-1" />
                  <MenuItem to="/profile"  onClick={() => setMenu(false)}>Profile</MenuItem>
                  <MenuItem to="/orders"   onClick={() => setMenu(false)}>My Orders</MenuItem>
                  <MenuItem to="/wishlist" onClick={() => setMenu(false)}>Wishlist</MenuItem>
                  {isAdmin && (
                    <>
                      <div className="h-px bg-border my-1" />
                      <MenuItem to="/admin" onClick={() => setMenu(false)} icon={<FiSettings />}>
                        Admin Panel
                      </MenuItem>
                    </>
                  )}
                  <div className="h-px bg-border my-1" />
                  <button
                    onClick={() => { setMenu(false); logout(); navigate("/"); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-dark hover:bg-section rounded-lg transition-colors duration-150"
                  >
                    <FiLogOut /> Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="hidden sm:inline-flex btn-primary !py-2 !px-4 text-sm">
              Sign in
            </Link>
          )}

          {/* Mobile menu toggle */}
          <button
            className="md:hidden btn-ghost p-2.5"
            onClick={() => setOpen((v) => !v)}
            aria-label="Menu"
          >
            {open ? <FiX className="text-xl" /> : <FiMenu className="text-xl" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-border bg-bg">
          <div className="px-4 py-4 space-y-3">
            <form onSubmit={submitSearch} className="relative">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search..."
                className="input-base pl-11"
              />
            </form>
            {nav.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                end={n.to === "/"}
                onClick={() => setOpen(false)}
                className={linkClass}
              >
                {n.label}
              </NavLink>
            ))}
            {!isAuthenticated && (
              <Link to="/login" onClick={() => setOpen(false)} className="btn-primary w-full">
                Sign in
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

function Badge({ children }) {
  return (
    <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-primary text-white text-[10px] font-bold grid place-items-center">
      {children}
    </span>
  );
}

function MenuItem({ to, children, onClick, icon }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="flex items-center gap-2 px-3 py-2 text-sm text-dark hover:bg-section rounded-lg transition-colors duration-150"
    >
      {icon}{children}
    </Link>
  );
}