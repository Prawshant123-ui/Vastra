import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FiPackage, FiArrowRight } from "react-icons/fi";
import { orderApi } from "../api/endpoints.js";
import Loader from "../components/Loader.jsx";
import EmptyState from "../components/EmptyState.jsx";

const STATUS_COLOR = {
  PENDING: "bg-yellow-100 text-yellow-800",
  CONFIRMED: "bg-blue-100 text-blue-800",
  PROCESSING: "bg-indigo-100 text-indigo-800",
  SHIPPED: "bg-purple-100 text-purple-800",
  DELIVERED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
  REFUNDED: "bg-gray-200 text-gray-700",
};

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orderApi.mine()
      .then((r) => setOrders(r.data.data || []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader full />;

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-8 py-12">
      <h1 className="text-4xl mb-8">My orders</h1>
      {orders.length === 0 ? (
        <EmptyState
          icon={<FiPackage />}
          title="No orders yet"
          description="When you place an order, it will show up here."
          action={<Link to="/shop" className="btn-primary">Start shopping</Link>}
        />
      ) : (
        <div className="space-y-4">
          {orders.map((o, i) => (
            <motion.div
              key={o.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="card-base p-5 flex flex-col sm:flex-row gap-4 items-start sm:items-center"
            >
              <div className="flex-1">
                <p className="text-sm text-muted">Order</p>
                <p className="font-semibold text-dark">{o.orderNumber}</p>
                <p className="text-xs text-muted mt-1">{new Date(o.createdAt).toLocaleString()}</p>
              </div>
              <div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${STATUS_COLOR[o.status] || ""}`}>{o.status}</span>
              </div>
              <div className="text-right">
                <p className="font-display text-xl text-dark">${Number(o.total).toFixed(2)}</p>
                <p className="text-xs text-muted">{o.items?.length || 0} items</p>
              </div>
              <Link to={`/orders/${o.id}`} className="btn-outline">View <FiArrowRight /></Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
