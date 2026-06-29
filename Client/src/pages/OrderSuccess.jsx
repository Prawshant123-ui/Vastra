import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { FiCheckCircle } from "react-icons/fi";

export default function OrderSuccess() {
  const { id } = useParams();
  return (
    <div className="max-w-xl mx-auto px-4 py-20 text-center">
      <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring" }} className="text-6xl text-primary inline-block">
        <FiCheckCircle />
      </motion.div>
      <h1 className="text-4xl mt-4">Thank you!</h1>
      <p className="mt-3 text-body">Your order has been placed. We'll let you know as soon as it ships.</p>
      <div className="mt-8 flex flex-wrap gap-3 justify-center">
        <Link to={`/orders/${id}`} className="btn-primary">View order</Link>
        <Link to="/shop" className="btn-outline">Keep shopping</Link>
      </div>
    </div>
  );
}
