import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { orderApi } from "../../api/endpoints.js";
import Loader from "../../components/Loader.jsx";
import Pagination from "../../components/Pagination.jsx";

const STATUSES = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED"];

export default function AdminOrders() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const [data, setData] = useState({ data: [], totalPages: 1 });
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    const params = { page, limit: 15 };
    if (status) params.status = status;
    orderApi.adminList(params)
      .then((r) => setData({ data: r.data.data || [], totalPages: r.data.totalPages || 1 }))
      .finally(() => setLoading(false));
  };
  useEffect(load, [page, status]);

  const updateStatus = async (id, s) => {
    try { await orderApi.adminUpdateStatus(id, s); toast.success("Status updated"); load(); }
    catch (e) { toast.error(e?.response?.data?.message || "Failed"); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-3xl">Orders</h1>
        <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className="input-base !w-auto !py-2">
          <option value="">All statuses</option>
          {STATUSES.map((s) => <option key={s}>{s}</option>)}
        </select>
      </div>
      {loading ? <Loader /> : (
        <div className="card-base overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-section">
              <tr>
                <Th>Order</Th><Th>Customer</Th><Th>Items</Th><Th>Total</Th><Th>Date</Th><Th>Status</Th>
              </tr>
            </thead>
            <tbody>
              {data.data.map((o, i) => (
                <motion.tr key={o.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }} className="border-t border-border">
                  <td className="p-3 font-semibold text-dark">{o.orderNumber}</td>
                  <td className="p-3"><p className="text-dark">{o.user?.name}</p><p className="text-xs text-muted">{o.user?.email}</p></td>
                  <td className="p-3">{o.items?.length || 0}</td>
                  <td className="p-3 font-display text-dark">${Number(o.total).toFixed(2)}</td>
                  <td className="p-3 text-muted">{new Date(o.createdAt).toLocaleDateString()}</td>
                  <td className="p-3">
                    <select value={o.status} onChange={(e) => updateStatus(o.id, e.target.value)} className="input-base !py-1.5 !px-2 text-xs !w-auto">
                      {STATUSES.map((s) => <option key={s}>{s}</option>)}
                    </select>
                  </td>
                </motion.tr>
              ))}
              {!data.data.length && <tr><td colSpan={6} className="p-8 text-center text-muted">No orders.</td></tr>}
            </tbody>
          </table>
        </div>
      )}
      <Pagination page={page} totalPages={data.totalPages} onChange={setPage} />
    </div>
  );
}

const Th = ({ children }) => <th className="text-left p-3 font-semibold text-dark">{children}</th>;
