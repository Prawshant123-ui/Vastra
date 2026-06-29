import { Link } from "react-router-dom";
import { FiInstagram, FiTwitter, FiFacebook, FiMail } from "react-icons/fi";

export default function Footer() {
  return (
    <footer className="bg-section mt-16 border-t border-border">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 grid gap-10 md:grid-cols-4">
        <div>
          <Link
  to="/"
  className="flex items-center gap-2 font-display text-2xl font-semibold text-dark"
>
  <span className="text-primary">✦</span>
  <span>Vastra</span>
</Link>
          <p className="mt-3 text-sm text-body">
            Timeless garments, made with care.
          </p>
        </div>
        <FooterCol title="Shop">
          <Link to="/shop">All Products</Link>
          <Link to="/shop?sort=createdAt&order=desc">New Arrivals</Link>
          <Link to="/wishlist">Wishlist</Link>
          <Link to="/cart">Cart</Link>
        </FooterCol>
        <FooterCol title="Company">
          <Link to="/about">About</Link>
          <Link to="/contact">Contact</Link>
          <Link to="/orders">Orders</Link>
          <Link to="/profile">Profile</Link>
        </FooterCol>
        <div>
          <h4 className="text-sm font-semibold mb-3 text-dark">Stay in touch</h4>
          <p className="text-sm text-body mb-3">Soft inbox, sweet finds. No spam.</p>
          <form className="flex gap-2" onSubmit={(e) => e.preventDefault()}>
            <input type="email" placeholder="you@example.com" className="input-base !py-2" />
            <button className="btn-primary !py-2 !px-3"><FiMail /></button>
          </form>
          <div className="flex gap-3 mt-4 text-dark">
            <a href="#"><FiInstagram /></a>
            <a href="#"><FiTwitter /></a>
            <a href="#"><FiFacebook /></a>
          </div>
        </div>
      </div>
      <div className="border-t border-border py-4 text-center text-xs text-muted">
        © {new Date().getFullYear()} Vastra. All rights reserved.
      </div>
    </footer>
  );
}

function FooterCol({ title, children }) {
  return (
    <div>
      <h4 className="text-sm font-semibold mb-3 text-dark">{title}</h4>
      <ul className="space-y-2 text-sm text-body [&_a:hover]:text-primary">
        {Array.isArray(children) ? children.map((c, i) => <li key={i}>{c}</li>) : <li>{children}</li>}
      </ul>
    </div>
  );
}
