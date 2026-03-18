import { useEffect, useState } from "react";
import { categoryAPI } from "../../services/apis/index";
import { useToastStore } from "../../store/toastStore";

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", parentCategory: "" });
  const [creating, setCreating] = useState(false);
  const showToast = useToastStore((s) => s.showToast);

  const load = () => {
    categoryAPI.getAll()
      .then((r) => setCategories(r.data?.data || []))
      .catch(() => showToast({ message: "Failed to load categories", type: "error" }))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.name) return;
    setCreating(true);
    try {
      await categoryAPI.create({ name: form.name, description: form.description, parentCategory: form.parentCategory || undefined });
      showToast({ message: "Category created!", type: "success" });
      setForm({ name: "", description: "", parentCategory: "" });
      setShowForm(false);
      load();
    } catch { showToast({ message: "Failed to create category", type: "error" }); }
    finally { setCreating(false); }
  };

  const rootCategories = categories.filter((c) => !c.parentCategory);
  const subCategories = (parentId) => categories.filter((c) => c.parentCategory === parentId || c.parentCategory?._id === parentId);

  return (
    <div className="min-h-screen bg-sand-50 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="section-label">Admin</p>
          <h1 className="text-2xl font-display font-bold text-ink-900 mt-1">Categories</h1>
          <p className="text-ink-400 text-sm mt-0.5">{categories.length} categories total</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary px-5 py-2.5 text-sm">
          {showForm ? "Cancel" : "+ New Category"}
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <div className="card p-6 mb-6 border-2 border-brand-200 bg-brand-50 animate-fade-up">
          <h2 className="font-display font-bold text-ink-900 text-lg mb-5">Create Category</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-ink-700 mb-1.5">Category Name *</label>
                <input value={form.name} onChange={(e) => setForm({...form, name: e.target.value})}
                  placeholder="e.g. Electronics" className="input-base" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-ink-700 mb-1.5">Parent Category <span className="text-ink-400 font-normal">(optional)</span></label>
                <select value={form.parentCategory} onChange={(e) => setForm({...form, parentCategory: e.target.value})} className="input-base">
                  <option value="">Root category</option>
                  {rootCategories.map((c) => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-ink-700 mb-1.5">Description</label>
                <input value={form.description} onChange={(e) => setForm({...form, description: e.target.value})}
                  placeholder="Brief description of this category" className="input-base" />
              </div>
            </div>
            <button type="submit" disabled={creating || !form.name} className="btn-primary px-6 py-2.5 text-sm">
              {creating ? "Creating..." : "Create Category"}
            </button>
          </form>
        </div>
      )}

      {loading ? (
        <div className="space-y-3">{[1,2,3,4].map(i => <div key={i} className="card p-5"><div className="skeleton h-10 rounded-xl" /></div>)}</div>
      ) : categories.length === 0 ? (
        <div className="card p-16 text-center">
          <div className="text-5xl mb-4">🗂️</div>
          <h3 className="font-display font-bold text-ink-900 text-lg">No categories yet</h3>
          <p className="text-ink-500 text-sm mt-2">Create your first product category to get started.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {rootCategories.map((cat) => {
            const subs = subCategories(cat._id);
            return (
              <div key={cat._id} className="card overflow-hidden">
                <div className="flex items-center gap-3 px-5 py-4 border-b border-ink-100 bg-sand-50">
                  <div className="w-8 h-8 rounded-lg bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-sm">{cat.name[0]}</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-ink-900 text-sm">{cat.name}</p>
                    {cat.description && <p className="text-xs text-ink-400 mt-0.5 truncate">{cat.description}</p>}
                  </div>
                  <span className="badge bg-ink-100 text-ink-500 border border-ink-200 text-[10px]">{subs.length} sub</span>
                </div>
                {subs.length > 0 && (
                  <div className="divide-y divide-ink-50">
                    {subs.map((sub) => (
                      <div key={sub._id} className="flex items-center gap-3 px-5 py-3 pl-12">
                        <span className="text-ink-300 text-sm">└</span>
                        <p className="text-sm text-ink-700 font-medium">{sub.name}</p>
                        {sub.description && <p className="text-xs text-ink-400 truncate hidden sm:block">{sub.description}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
