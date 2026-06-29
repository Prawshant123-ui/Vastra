import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { FiPlus, FiEdit2, FiTrash2, FiSearch } from "react-icons/fi";
import { productApi } from "../../api/endpoints.js";
import Loader from "../../components/Loader.jsx";
import Pagination from "../../components/Pagination.jsx";

export default function AdminProducts() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [data, setData] = useState({ data: [], totalPages: 1 });
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    productApi.list({ page, limit: 12, search })
      .then((r) => setData({ data: r.data.data || [], totalPages: r.data.totalPages || 1 }))
      .finally(() => setLoading(false));
  };
  useEffect(load, [page, search]);

  const remove = async (id) => {
    if (!confirm("Delete this product?")) return;
    try { await productApi.remove(id); toast.success("Product deleted"); load(); }
    catch (e) { toast.error(e?.response?.data?.message || "Failed"); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-3xl">Products</h1>
        <Link to="/admin/products/new" className="btn-primary"><FiPlus /> New product</Link>
      </div>
      <div className="card-base p-4 flex items-center gap-2">
        <FiSearch className="text-muted" />
        <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search products…" className="bg-transparent flex-1 outline-none text-sm" />
      </div>

      {loading ? <Loader /> : (
        <div className="card-base overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-section text-dark">
              <tr>
                <Th>Product</Th><Th>Category</Th><Th>Price</Th><Th>Stock</Th><Th>Status</Th><Th></Th>
              </tr>
            </thead>
            <tbody>
              {data.data.map((p, i) => (
                <motion.tr key={p.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }} className="border-t border-border">
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-section overflow-hidden shrink-0">
                        {p.images?.[0]?.imageUrl && <img src={p.images[0].imageUrl} alt="" className="w-full h-full object-cover" />}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-dark line-clamp-1">{p.name}</p>
                        <p className="text-xs text-muted">{p.sku}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-3">{p.category?.name}</td>
                  <td className="p-3">${Number(p.discountPrice ?? p.price).toFixed(2)}</td>
                  <td className="p-3">{p.stock}</td>
                  <td className="p-3"><span className="chip">{p.isActive ? "Active" : "Inactive"}</span></td>
                  <td className="p-3 text-right whitespace-nowrap">
                    <Link to={`/admin/products/${p.id}/edit`} className="btn-ghost !p-2 text-dark"><FiEdit2 /></Link>
                    <button onClick={() => remove(p.id)} className="btn-ghost !p-2 text-primary"><FiTrash2 /></button>
                  </td>
                </motion.tr>
              ))}
              {!data.data.length && <tr><td colSpan={6} className="p-8 text-center text-muted">No products found.</td></tr>}
            </tbody>
          </table>
        </div>
      )}
      <Pagination page={page} totalPages={data.totalPages} onChange={setPage} />
    </div>
  );
}

const Th = ({ children }) => <th className="text-left p-3 font-semibold">{children}</th>;
