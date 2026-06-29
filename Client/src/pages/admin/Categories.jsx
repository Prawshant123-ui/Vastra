import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { FiPlus, FiEdit2, FiTrash2 } from "react-icons/fi";
import { categoryApi } from "../../api/endpoints.js";
import Loader from "../../components/Loader.jsx";
import Modal from "../../components/Modal.jsx";

export default function Categories() {
  const [cats, setCats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [name, setName] = useState("");

  const load = () => { setLoading(true); categoryApi.list().then((r) => setCats(r.data.data || r.data || [])).finally(() => setLoading(false)); };
  useEffect(load, []);

  const save = async () => {
    if (!name.trim()) return;
    try {
      if (editing) await categoryApi.update(editing.id, { name });
      else await categoryApi.create({ name });
      toast.success(editing ? "Category updated" : "Category created");
      setOpen(false); setName(""); setEditing(null); load();
    } catch (e) { toast.error(e?.response?.data?.message || "Failed"); }
  };

  const remove = async (id) => {
    if (!confirm("Delete this category?")) return;
    try { await categoryApi.remove(id); toast.success("Deleted"); load(); }
    catch (e) { toast.error(e?.response?.data?.message || "Failed"); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl">Categories</h1>
        <button onClick={() => { setEditing(null); setName(""); setOpen(true); }} className="btn-primary"><FiPlus /> New</button>
      </div>
      {loading ? <Loader /> : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {cats.map((c, i) => (
            <motion.div key={c.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} className="card-base p-5 flex items-center justify-between">
              <div>
                <p className="font-semibold text-dark">{c.name}</p>
                <p className="text-xs text-muted">{c.slug}</p>
              </div>
              <div className="flex gap-1">
                <button onClick={() => { setEditing(c); setName(c.name); setOpen(true); }} className="btn-ghost !p-2"><FiEdit2 /></button>
                <button onClick={() => remove(c.id)} className="btn-ghost !p-2 text-primary"><FiTrash2 /></button>
              </div>
            </motion.div>
          ))}
          {!cats.length && <p className="text-sm text-muted">No categories yet.</p>}
        </div>
      )}
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? "Edit category" : "New category"}
        footer={<><button onClick={() => setOpen(false)} className="btn-ghost">Cancel</button><button onClick={save} className="btn-primary">Save</button></>}
      >
        <input autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="Category name" className="input-base" />
      </Modal>
    </div>
  );
}
