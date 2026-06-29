import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FiUser, FiMail, FiPhone, FiEdit2, FiShoppingBag, FiHeart, FiMapPin } from "react-icons/fi";
import { useAuth } from "../context/AuthContext.jsx";
import { useCart } from "../context/CartContext.jsx";
import { useWishlist } from "../context/WishlistContext.jsx";

export default function Profile() {
  const { user } = useAuth();
  const { itemCount } = useCart();
  const { count } = useWishlist();

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-8 py-12">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="card-base p-8 flex flex-col sm:flex-row items-start gap-6">
        <div className="w-20 h-20 rounded-full bg-section grid place-items-center text-3xl text-primary">
          <FiUser />
        </div>
        <div className="flex-1">
          <h1 className="text-3xl">{user?.name}</h1>
          <p className="text-body text-sm mt-1 flex items-center gap-2"><FiMail /> {user?.email}</p>
          {user?.phone && <p className="text-body text-sm mt-1 flex items-center gap-2"><FiPhone /> {user.phone}</p>}
        </div>
        <Link to="/profile/edit" className="btn-outline"><FiEdit2 /> Edit</Link>
      </motion.div>

      <div className="grid sm:grid-cols-3 gap-4 mt-6">
        <Tile to="/orders" icon={<FiShoppingBag />} label="Orders" />
        <Tile to="/wishlist" icon={<FiHeart />} label={`Wishlist (${count})`} />
        <Tile to="/cart" icon={<FiMapPin />} label={`Cart (${itemCount})`} />
      </div>
    </div>
  );
}

function Tile({ to, icon, label }) {
  return (
    <Link to={to} className="card-base p-6 hover:border-primary transition flex items-center gap-3">
      <span className="w-11 h-11 rounded-xl bg-section grid place-items-center text-primary text-xl">{icon}</span>
      <span className="font-semibold text-dark">{label}</span>
    </Link>
  );
}
