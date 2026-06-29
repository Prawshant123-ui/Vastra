import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { FiUpload, FiTrash2, FiArrowLeft } from "react-icons/fi";
import { productApi, categoryApi } from "../../api/endpoints.js";
import Loader from "../../components/Loader.jsx";

export default function ProductForm() {
  const { id } = useParams();
  const isEdit = !!id;
  const nav = useNavigate();
  const [cats, setCats] = useState([]);
  const [loading, setLoading] = useState(isEdit);
  const [busy, setBusy] = useState(false);
  const [files, setFiles] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [form, setForm] = useState({
    name: "", description: "", price: "", discountPrice: "", stock: "", categoryId: "", brand: "", weight: "", isFeatured: false, isActive: true,
  });

  useEffect(() => { categoryApi.list().then((r) => setCats(r.data.data || r.data || [])); }, []);
  useEffect(() => {
    if (!isEdit) return;
    productApi.byId(id).then((r) => {
      const p = r.data.data;
      setForm({
        name: p.name, description: p.description, price: String(p.price), discountPrice: p.discountPrice ?? "",
        stock: String(p.stock), categoryId: String(p.categoryId), brand: p.brand || "", weight: p.weight ?? "",
        isFeatured: p.isFeatured, isActive: p.isActive,
      });
      setExistingImages(p.images || []);
    }).finally(() => setLoading(false));
  }, [id, isEdit]);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      files.forEach((f) => fd.append("images", f));
      if (isEdit) await productApi.update(id, fd); else await productApi.create(fd);
      toast.success(isEdit ? "Product updated" : "Product created");
      nav("/admin/products");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to save");
    } finally { setBusy(false); }
  };

  const removeImg = async (imageId) => {
    if (!confirm("Delete this image?")) return;
    try { await productApi.removeImage(id, imageId); setExistingImages((arr) => arr.filter((i) => i.id !== imageId)); }
    catch { toast.error("Failed to delete image"); }
  };

  if (loading) return <Loader full />;

  return (
    <div>
      <Link to="/admin/products" className="text-sm text-primary inline-flex items-center gap-1 mb-4"><FiArrowLeft /> Back</Link>
      <h1 className="text-3xl mb-6">{isEdit ? "Edit product" : "New product"}</h1>
      <form onSubmit={submit} className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Section title="Basics">
            <Input label="Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} required />
            <Textarea label="Description" value={form.description} onChange={(v) => setForm({ ...form, description: v })} required />
            <div className="grid sm:grid-cols-2 gap-4">
              <Input label="Brand" value={form.brand} onChange={(v) => setForm({ ...form, brand: v })} />
              <Input label="Weight (kg)" type="number" step="0.01" value={form.weight} onChange={(v) => setForm({ ...form, weight: v })} />
            </div>
          </Section>
          <Section title="Pricing & stock">
            <div className="grid sm:grid-cols-3 gap-4">
              <Input label="Price" type="number" step="0.01" value={form.price} onChange={(v) => setForm({ ...form, price: v })} required />
              <Input label="Discount price" type="number" step="0.01" value={form.discountPrice} onChange={(v) => setForm({ ...form, discountPrice: v })} />
              <Input label="Stock" type="number" value={form.stock} onChange={(v) => setForm({ ...form, stock: v })} required />
            </div>
          </Section>
          <Section title="Images">
            <label className="block">
              <div className="border-2 border-dashed border-border rounded-2xl p-8 text-center hover:border-primary transition cursor-pointer">
                <FiUpload className="text-3xl text-primary mx-auto mb-2" />
                <p className="text-sm text-body">Click to upload up to 5 images</p>
                <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => setFiles(Array.from(e.target.files).slice(0, 5))} />
              </div>
            </label>
            {files.length > 0 && (
              <div className="mt-4 grid grid-cols-3 sm:grid-cols-5 gap-2">
                {files.map((f, i) => <img key={i} src={URL.createObjectURL(f)} alt="" className="aspect-square w-full rounded-xl object-cover" />)}
              </div>
            )}
            {existingImages.length > 0 && (
              <div className="mt-4">
                <p className="text-sm text-muted mb-2">Existing images</p>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {existingImages.map((img) => (
                    <div key={img.id} className="relative group">
                      <img src={img.imageUrl} alt="" className="aspect-square w-full rounded-xl object-cover" />
                      <button type="button" onClick={() => removeImg(img.id)} className="absolute top-1 right-1 bg-white rounded-full p-1.5 text-primary opacity-0 group-hover:opacity-100 transition"><FiTrash2 /></button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Section>
        </div>

        <aside className="space-y-6">
          <Section title="Category">
            <select required value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} className="input-base">
              <option value="">Select category…</option>
              {cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </Section>
          <Section title="Status">
            <Toggle label="Active" value={form.isActive} onChange={(v) => setForm({ ...form, isActive: v })} />
            <Toggle label="Featured" value={form.isFeatured} onChange={(v) => setForm({ ...form, isFeatured: v })} />
          </Section>
          <button disabled={busy} className="btn-primary w-full">{busy ? "Saving…" : (isEdit ? "Update product" : "Create product")}</button>
        </aside>
      </form>
    </div>
  );
}

const Section = ({ title, children }) => (
  <div className="card-base p-6">
    <h3 className="text-lg mb-4">{title}</h3>
    <div className="space-y-4">{children}</div>
  </div>
);
const Input = ({ label, value, onChange, ...rest }) => (
  <div><label className="text-sm font-semibold text-dark mb-1.5 block">{label}</label><input value={value} onChange={(e) => onChange(e.target.value)} className="input-base" {...rest} /></div>
);
const Textarea = ({ label, value, onChange, ...rest }) => (
  <div><label className="text-sm font-semibold text-dark mb-1.5 block">{label}</label><textarea rows={5} value={value} onChange={(e) => onChange(e.target.value)} className="input-base resize-none" {...rest} /></div>
);
const Toggle = ({ label, value, onChange }) => (
  <label className="flex items-center justify-between"><span className="text-sm text-dark">{label}</span>
    <button type="button" onClick={() => onChange(!value)} className={`w-11 h-6 rounded-full p-0.5 transition ${value ? "bg-primary" : "bg-border"}`}>
      <span className={`block w-5 h-5 rounded-full bg-white transition ${value ? "translate-x-5" : ""}`} />
    </button>
  </label>
);
