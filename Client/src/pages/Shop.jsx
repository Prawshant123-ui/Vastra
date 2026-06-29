import { useEffect, useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { FiFilter, FiX, FiSearch } from "react-icons/fi";
import { productApi, categoryApi } from "../api/endpoints.js";
import ProductCard from "../components/ProductCard.jsx";
import { ProductCardSkeleton } from "../components/Skeleton.jsx";
import EmptyState from "../components/EmptyState.jsx";
import Pagination from "../components/Pagination.jsx";

const SORTS = [
  { v: "createdAt:desc", label: "Newest" },
  { v: "createdAt:asc", label: "Oldest" },
  { v: "price:asc", label: "Price ↑" },
  { v: "price:desc", label: "Price ↓" },
  { v: "name:asc", label: "Name A–Z" },
];

export default function Shop() {
  const [sp, setSp] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [meta, setMeta] = useState({ totalPages: 1, page: 1, total: 0 });
  const [cats, setCats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  const params = useMemo(() => {
    const page = Number(sp.get("page") || 1);
    const search = sp.get("search") || "";
    const category = sp.get("category") || "";
    const minPrice = sp.get("minPrice") || "";
    const maxPrice = sp.get("maxPrice") || "";
    const [sort, order] = (sp.get("sortKey") || "createdAt:desc").split(":");
    return { page, limit: 12, search, category, minPrice, maxPrice, sort, order };
  }, [sp]);

  useEffect(() => { categoryApi.list().then((r) => setCats(r.data.data || r.data || [])).catch(() => {}); }, []);

  useEffect(() => {
    setLoading(true);
    const clean = Object.fromEntries(Object.entries(params).filter(([, v]) => v !== "" && v != null));
    productApi.list(clean)
      .then((r) => {
        setProducts(r.data.data || []);
        setMeta({ totalPages: r.data.totalPages || 1, page: r.data.page || 1, total: r.data.total || 0 });
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [params]);

  const update = (patch) => {
    const next = new URLSearchParams(sp);
    Object.entries(patch).forEach(([k, v]) => {
      if (v === "" || v == null) next.delete(k); else next.set(k, v);
    });
    if (!("page" in patch)) next.set("page", "1");
    setSp(next);
  };

  const Filters = (
    <div className="space-y-6">
      <div>
        <label className="text-sm font-semibold text-dark mb-2 block">Search</label>
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            defaultValue={params.search}
            onKeyDown={(e) => e.key === "Enter" && update({ search: e.target.value })}
            placeholder="What are you after?"
            className="input-base pl-9"
          />
        </div>
      </div>
      <div>
        <label className="text-sm font-semibold text-dark mb-2 block">Category</label>
        <div className="space-y-1.5">
          <button onClick={() => update({ category: "" })} className={`block w-full text-left text-sm px-3 py-2 rounded-lg transition ${!params.category ? "bg-primary text-white" : "hover:bg-section text-body"}`}>All</button>
          {cats.map((c) => (
            <button key={c.id} onClick={() => update({ category: String(c.id) })} className={`block w-full text-left text-sm px-3 py-2 rounded-lg transition ${String(params.category) === String(c.id) ? "bg-primary text-white" : "hover:bg-section text-body"}`}>
              {c.name}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="text-sm font-semibold text-dark mb-2 block">Price</label>
        <div className="flex items-center gap-2">
          <input type="number" defaultValue={params.minPrice} placeholder="Min" onBlur={(e) => update({ minPrice: e.target.value })} className="input-base !py-2" />
          <span className="text-muted">—</span>
          <input type="number" defaultValue={params.maxPrice} placeholder="Max" onBlur={(e) => update({ maxPrice: e.target.value })} className="input-base !py-2" />
        </div>
      </div>
      <button onClick={() => setSp(new URLSearchParams())} className="btn-outline w-full">Clear filters</button>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-10">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-4xl md:text-5xl">The Shop</h1>
        <p className="text-body mt-2">{meta.total} pieces, ready for their next home.</p>
      </motion.div>

      <div className="flex items-center justify-between gap-3 mb-6">
        <button onClick={() => setOpen(true)} className="lg:hidden btn-outline !py-2"><FiFilter /> Filters</button>
        <select
          value={`${params.sort}:${params.order}`}
          onChange={(e) => update({ sortKey: e.target.value })}
          className="input-base !w-auto !py-2 ml-auto"
        >
          {SORTS.map((s) => <option key={s.v} value={s.v}>{s.label}</option>)}
        </select>
      </div>

      <div className="grid lg:grid-cols-[260px_1fr] gap-8">
        <aside className="hidden lg:block card-base p-5 h-fit sticky top-24">{Filters}</aside>

        <div>
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
              {Array.from({ length: 6 }).map((_, i) => <ProductCardSkeleton key={i} />)}
            </div>
          ) : products.length === 0 ? (
            <EmptyState title="No products found" description="Try adjusting your filters or search." />
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
              {products.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
            </div>
          )}
          <Pagination page={meta.page} totalPages={meta.totalPages} onChange={(p) => update({ page: p })} />
        </div>
      </div>

      {/* Mobile filters drawer */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-dark/40" onClick={() => setOpen(false)} />
          <motion.aside
            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
            className="absolute right-0 top-0 bottom-0 w-80 max-w-[85vw] bg-card p-5 overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg">Filters</h3>
              <button onClick={() => setOpen(false)} className="btn-ghost !p-2"><FiX /></button>
            </div>
            {Filters}
          </motion.aside>
        </div>
      )}
    </div>
  );
}
