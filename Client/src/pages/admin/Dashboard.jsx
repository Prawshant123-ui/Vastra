import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FiUsers, FiPackage, FiShoppingBag, FiDollarSign, FiArrowRight } from "react-icons/fi";
import { Line, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Tooltip, Legend, Filler,
} from "chart.js";
import { analyticsApi } from "../../api/endpoints.js";
import Loader from "../../components/Loader.jsx";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Tooltip, Legend, Filler);

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => { analyticsApi.get().then((r) => setData(r.data.data)).finally(() => setLoading(false)); }, []);

  if (loading) return <Loader full />;
  if (!data) return <p>Could not load analytics.</p>;

  const totals = data.totals;
  const stats = [
    { icon: <FiDollarSign />, label: "Revenue", value: `NPR ${Number(totals.revenue).toFixed(2)}`, color: "bg-primary" },
    { icon: <FiShoppingBag />, label: "Orders", value: totals.orders, color: "bg-accent" },
    { icon: <FiPackage />, label: "Products", value: totals.products, color: "bg-dark" },
    { icon: <FiUsers />, label: "Customers", value: totals.users, color: "bg-body" },
  ];
 
  const months = data.revenueByMonth || [];
  const lineData = {
    labels: months.map((m) => m.month),
    datasets: [{
      label: "Revenue",
      data: months.map((m) => m.revenue),
      borderColor: "#E8631A", backgroundColor: "rgba(232,99,26,0.18)",
      fill: true, tension: 0.35, pointRadius: 4, pointBackgroundColor: "#E8631A",
    }],
  };

  const status = data.ordersByStatus || {};
  const doughnut = {
    labels: Object.keys(status),
    datasets: [{
      data: Object.values(status),
      backgroundColor: ["#F5A623", "#E8631A", "#7A4A2A", "#C49A7A", "#3D1F0A", "#FDECD5", "#F0D8C0"],
      borderWidth: 0,
    }],
  };

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl md:text-4xl">Dashboard</h1>
        <p className="text-body mt-1">A warm look at how the shop is doing.</p>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="card-base p-5">
            <div className={`w-11 h-11 rounded-xl ${s.color} text-white grid place-items-center text-xl mb-3`}>{s.icon}</div>
            <p className="text-xs text-muted uppercase tracking-wide">{s.label}</p>
            <p className="text-2xl font-display text-dark mt-1">{s.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="card-base p-6 lg:col-span-2">
          <h3 className="text-lg mb-4">Revenue, last 6 months</h3>
          <div className="h-72"><Line data={lineData} options={chartOpts} /></div>
        </div>
        <div className="card-base p-6">
          <h3 className="text-lg mb-4">Orders by status</h3>
          {Object.keys(status).length === 0 ? <p className="text-sm text-muted">No data yet.</p> : <div className="h-72"><Doughnut data={doughnut} options={{ plugins: { legend: { position: "bottom" } }, maintainAspectRatio: false }} /></div>}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card-base p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg">Recent orders</h3>
            <Link to="/admin/orders" className="text-sm text-primary font-semibold inline-flex items-center gap-1">All <FiArrowRight /></Link>
          </div>
          <div className="divide-y divide-border">
            {(data.recentOrders || []).map((o) => (
              <div key={o.id} className="py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-dark">{o.orderNumber}</p>
                  <p className="text-xs text-muted">{o.user?.name} · {o.user?.email}</p>
                </div>
                <div className="text-right">
                  <p className="font-display text-dark">${Number(o.total).toFixed(2)}</p>
                  <span className="chip">{o.status}</span>
                </div>
              </div>
            ))}
            {!data.recentOrders?.length && <p className="text-sm text-muted py-4">No recent orders.</p>}
          </div>
        </div>

        <div className="card-base p-6">
          <h3 className="text-lg mb-4">Best sellers</h3>
          <div className="divide-y divide-border">
            {(data.topProducts || []).map((p) => (
              <div key={p.productId} className="py-3 flex items-center justify-between gap-3">
                <p className="text-sm text-dark line-clamp-1 flex-1">{p.productName}</p>
                <p className="text-xs text-muted">{p.totalSold} sold</p>
                <p className="font-display text-dark">${Number(p.totalRevenue).toFixed(2)}</p>
              </div>
            ))}
            {!data.topProducts?.length && <p className="text-sm text-muted py-4">No sales yet.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

const chartOpts = {
  responsive: true, maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: { y: { grid: { color: "#F0D8C0" } }, x: { grid: { display: false } } },
};
