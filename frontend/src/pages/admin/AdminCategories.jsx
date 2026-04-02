import { useEffect, useState, useRef, useCallback } from "react";
import { categoryAPI } from "../../services/apis/index";
import { useToastStore } from "../../store/toastStore";

// ── Attribute Form ──────────────────────────────────────────────────────────
function AttributeForm({ categoryId, onCreated, onClose }) {
  const showToast = useToastStore((s) => s.showToast);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    code: "", label: "", dataType: "string",
    options: "", unit: "", required: false, isFilterable: true,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.code || !form.label || !form.dataType) {
      showToast({ message: "Code, label and type are required", type: "error" }); return;
    }
    const payload = {
      code: form.code.toLowerCase().replace(/\s+/g, "_"),
      label: form.label,
      dataType: form.dataType,
      unit: form.unit || undefined,
      required: form.required,
      isFilterable: form.isFilterable,
      options: form.dataType === "enum" ? form.options.split(",").map(s => s.trim()).filter(Boolean) : [],
    };
    setSaving(true);
    try {
      await categoryAPI.createAttribute(categoryId, payload);
      showToast({ message: "Attribute created!", type: "success" });
      onCreated();
      onClose();
    } catch (err) {
      showToast({ message: err?.response?.data?.message || "Failed to create attribute", type: "error" });
    } finally { setSaving(false); }
  };

  const ATTR_PRESETS = [
    { code: "brand", label: "Brand", dataType: "string" },
    { code: "color", label: "Color", dataType: "enum", options: "Red,Blue,Green,Black,White,Yellow,Orange,Pink,Purple,Brown" },
    { code: "size", label: "Size", dataType: "enum", options: "XS,S,M,L,XL,XXL,XXXL" },
    { code: "material", label: "Material", dataType: "string" },
    { code: "weight", label: "Weight", dataType: "number", unit: "kg" },
    { code: "warranty", label: "Warranty", dataType: "string" },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-4 p-4 bg-sand-50 rounded-xl border border-ink-200">
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold uppercase tracking-wider text-ink-500">New Attribute</p>
        <div className="flex flex-wrap gap-1.5">
          {ATTR_PRESETS.map(p => (
            <button key={p.code} type="button"
              onClick={() => setForm(f => ({ ...f, code: p.code, label: p.label, dataType: p.dataType, unit: p.unit || "", options: p.options || "" }))}
              className="text-[10px] bg-white border border-brand-200 text-brand-700 rounded-lg px-2 py-1 hover:bg-brand-50 font-semibold">
              {p.label}
            </button>
          ))}
        </div>
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-ink-700 mb-1">Attribute Code *</label>
          <input name="code" value={form.code} onChange={handleChange}
            placeholder="e.g. size, color, brand" className="input-base text-sm" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-ink-700 mb-1">Display Label *</label>
          <input name="label" value={form.label} onChange={handleChange}
            placeholder="e.g. Size, Color, Brand" className="input-base text-sm" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-ink-700 mb-1">Data Type *</label>
          <select name="dataType" value={form.dataType} onChange={handleChange} className="input-base text-sm">
            <option value="string">Text</option>
            <option value="number">Number</option>
            <option value="boolean">Yes/No</option>
            <option value="enum">Options (dropdown)</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-ink-700 mb-1">Unit <span className="text-ink-400 font-normal">(optional)</span></label>
          <input name="unit" value={form.unit} onChange={handleChange}
            placeholder="e.g. kg, cm, inches" className="input-base text-sm" />
        </div>
        {form.dataType === "enum" && (
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-ink-700 mb-1">Options * <span className="text-ink-400 font-normal">(comma-separated)</span></label>
            <input name="options" value={form.options} onChange={handleChange}
              placeholder="Small, Medium, Large, XL" className="input-base text-sm" />
          </div>
        )}
        <div className="flex items-center gap-4 sm:col-span-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" name="required" checked={form.required} onChange={handleChange} className="rounded" />
            <span className="text-sm font-medium text-ink-700">Required field</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" name="isFilterable" checked={form.isFilterable} onChange={handleChange} className="rounded" />
            <span className="text-sm font-medium text-ink-700">Show as filter</span>
          </label>
        </div>
      </div>
      <div className="flex gap-2">
        <button type="submit" disabled={saving} className="btn-primary text-sm px-4 py-2">
          {saving ? "Saving..." : "Add Attribute"}
        </button>
        <button type="button" onClick={onClose} className="px-4 py-2 text-sm rounded-xl border border-ink-200 text-ink-600 hover:bg-ink-50">
          Cancel
        </button>
      </div>
    </form>
  );
}

// ── Category Row ────────────────────────────────────────────────────────────
function CategoryRow({ cat, subCategories, allCategories, onRefresh }) {
  const [expanded, setExpanded] = useState(false);
  const [showAttrForm, setShowAttrForm] = useState(false);
  const [attributes, setAttributes] = useState([]);
  const [loadingAttrs, setLoadingAttrs] = useState(false);
  const showToast = useToastStore((s) => s.showToast);

  const subs = subCategories(cat._id);

  const loadAttrs = useCallback(async () => {
    if (!cat.isLeaf) return;
    setLoadingAttrs(true);
    try {
      const res = await categoryAPI.getAttributes(cat._id);
      setAttributes(res.data?.data || []);
    } catch {}
    finally { setLoadingAttrs(false); }
  }, [cat._id, cat.isLeaf]);

  useEffect(() => {
    if (expanded && cat.isLeaf) loadAttrs();
  }, [expanded, loadAttrs]);

  return (
    <div className="card overflow-hidden">
      {/* Category header */}
      <div
        className="flex items-center gap-3 px-5 py-4 cursor-pointer hover:bg-sand-50 transition-colors"
        onClick={() => setExpanded(e => !e)}
      >
        <div className="w-8 h-8 rounded-lg bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-sm flex-shrink-0">
          {cat.name[0]}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-semibold text-ink-900 text-sm">{cat.name}</p>
            {cat.isLeaf && (
              <span className="text-[10px] font-bold bg-green-50 text-green-700 border border-green-200 px-1.5 py-0.5 rounded-full">LEAF</span>
            )}
            {!cat.isLeaf && subs.length > 0 && (
              <span className="text-[10px] text-ink-400 bg-ink-100 px-1.5 py-0.5 rounded-full">{subs.length} subcategories</span>
            )}
          </div>
          {cat.description && <p className="text-xs text-ink-400 mt-0.5 truncate">{cat.description}</p>}
        </div>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
          className={`text-ink-400 transition-transform flex-shrink-0 ${expanded ? "rotate-180" : ""}`}>
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </div>

      {expanded && (
        <div className="border-t border-ink-100">
          {/* Subcategories */}
          {subs.length > 0 && (
            <div className="divide-y divide-ink-50">
              {subs.map((sub) => (
                <div key={sub._id} className="flex items-center gap-3 px-5 py-3 pl-14">
                  <span className="text-ink-300 text-sm flex-shrink-0">└</span>
                  <div className="flex items-center gap-2 flex-1">
                    <p className="text-sm text-ink-700 font-medium">{sub.name}</p>
                    {sub.isLeaf && (
                      <span className="text-[10px] font-bold bg-green-50 text-green-700 border border-green-200 px-1.5 py-0.5 rounded-full">LEAF</span>
                    )}
                  </div>
                  {sub.description && <p className="text-xs text-ink-400 hidden sm:block truncate max-w-xs">{sub.description}</p>}
                </div>
              ))}
            </div>
          )}

          {/* Attributes section — only for leaf categories */}
          {cat.isLeaf && (
            <div className="px-5 pb-5 pt-3">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-bold text-ink-500 uppercase tracking-wider">
                  Product Attributes {loadingAttrs ? "(loading...)" : `(${attributes.length})`}
                </p>
                <button
                  onClick={(e) => { e.stopPropagation(); setShowAttrForm(v => !v); }}
                  className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  Add Attribute
                </button>
              </div>

              {attributes.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {attributes.map((attr) => (
                    <div key={attr._id} className="flex items-center gap-1.5 bg-white border border-ink-200 rounded-xl px-3 py-1.5">
                      <span className="text-xs font-semibold text-ink-700">{attr.label}</span>
                      <span className="text-[10px] text-ink-400">({attr.dataType})</span>
                      {attr.required && <span className="text-[10px] text-red-500 font-bold">*</span>}
                      {attr.isFilterable && <span className="text-[10px] text-blue-500">🔍</span>}
                    </div>
                  ))}
                </div>
              ) : !loadingAttrs && (
                <p className="text-xs text-ink-400 italic">No attributes yet. Add them to let vendors fill product specs.</p>
              )}

              {showAttrForm && (
                <AttributeForm
                  categoryId={cat._id}
                  onCreated={loadAttrs}
                  onClose={() => setShowAttrForm(false)}
                />
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main Component ──────────────────────────────────────────────────────────
export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const showToast = useToastStore((s) => s.showToast);

  // Use separate refs to avoid focus loss — never inline onChange recreating parent
  const nameRef = useRef("");
  const descRef = useRef("");
  const parentRef = useRef("");
  const isLeafRef = useRef(false);

  // Controlled form state that doesn't cause full re-renders on every keystroke
  const [formKey, setFormKey] = useState(0); // force reset
  const [creating, setCreating] = useState(false);

  const load = useCallback(() => {
    categoryAPI.getAll()
      .then((r) => setCategories(r.data?.data || []))
      .catch(() => showToast({ message: "Failed to load categories", type: "error" }))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const rootCategories = categories.filter((c) => !c.parentCategory);
  const subCategories = (parentId) => categories.filter(
    (c) => c.parentCategory === parentId || c.parentCategory?._id === parentId || c.parentCategory?.toString() === parentId?.toString()
  );

  const handleCreate = async (e) => {
    e.preventDefault();
    const name = nameRef.current.value?.trim();
    const description = descRef.current.value?.trim();
    const parentCategory = parentRef.current.value;
    const isLeaf = isLeafRef.current.checked;

    if (!name) { showToast({ message: "Category name is required", type: "error" }); return; }

    setCreating(true);
    try {
      await categoryAPI.create({
        name,
        description: description || undefined,
        parentCategory: parentCategory || undefined,
        isLeaf,
      });
      showToast({ message: "Category created! Vendors can now see it in Add Product.", type: "success" });
      setShowForm(false);
      setFormKey(k => k + 1); // reset form
      load();
    } catch (err) {
      showToast({ message: err?.response?.data?.message || "Failed to create category", type: "error" });
    } finally { setCreating(false); }
  };

  return (
    <div className="min-h-screen bg-sand-50 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="section-label">Admin</p>
          <h1 className="text-2xl font-display font-bold text-ink-900 mt-1">Categories</h1>
          <p className="text-ink-400 text-sm mt-0.5">{categories.length} categories total</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary px-5 py-2.5 text-sm">
          {showForm ? "✕ Cancel" : "+ New Category"}
        </button>
      </div>

      {/* Quick-add preset categories */}
      {showForm && (
        <div className="mb-4 p-4 bg-white rounded-2xl border border-ink-200">
          <p className="text-xs font-bold uppercase tracking-widest text-ink-400 mb-3">Quick Add Common Categories</p>
          <div className="flex flex-wrap gap-2">
            {[
              { name: "Electronics", isLeaf: false },
              { name: "Mobiles", isLeaf: true, parent: "Electronics" },
              { name: "Laptops", isLeaf: true, parent: "Electronics" },
              { name: "Fashion", isLeaf: false },
              { name: "Groceries", isLeaf: true },
              { name: "Home & Living", isLeaf: false },
              { name: "Beauty", isLeaf: true },
              { name: "Sports", isLeaf: true },
              { name: "Books", isLeaf: true },
              { name: "Automotive", isLeaf: true },
            ].map((preset) => {
              const exists = categories.some(c => c.name.toLowerCase() === preset.name.toLowerCase());
              return (
                <button
                  key={preset.name}
                  disabled={exists || creating}
                  onClick={async () => {
                    if (exists) return;
                    setCreating(true);
                    try {
                      const parentCat = preset.parent ? categories.find(c => c.name === preset.parent) : null;
                      await categoryAPI.create({
                        name: preset.name,
                        isLeaf: preset.isLeaf,
                        parentCategory: parentCat?._id || undefined,
                      });
                      showToast({ message: `"${preset.name}" created!`, type: "success" });
                      load();
                    } catch (err) {
                      showToast({ message: err?.response?.data?.message || "Failed", type: "error" });
                    } finally { setCreating(false); }
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border-2 transition-all ${
                    exists
                      ? "bg-green-50 text-green-600 border-green-200 cursor-default"
                      : "bg-white text-ink-600 border-ink-200 hover:border-brand-400 hover:text-brand-700 hover:bg-brand-50"
                  }`}
                >
                  {exists ? "✓" : "+"} {preset.name}
                  {preset.isLeaf && <span className="text-[9px] opacity-60">LEAF</span>}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Create form — uses uncontrolled inputs via refs to prevent focus loss */}
      {showForm && (
        <div className="card p-6 mb-6 border-2 border-brand-200 bg-brand-50">
          <h2 className="font-display font-bold text-ink-900 text-lg mb-5">Create Category</h2>
          <form key={formKey} onSubmit={handleCreate} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-ink-700 mb-1.5">Category Name *</label>
                <input
                  ref={nameRef}
                  defaultValue=""
                  placeholder="e.g. Electronics, T-Shirts"
                  className="input-base"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-ink-700 mb-1.5">Parent Category <span className="text-ink-400 font-normal">(optional)</span></label>
                <select ref={parentRef} defaultValue="" className="input-base">
                  <option value="">Root category (top-level)</option>
                  {rootCategories.map((c) => (
                    <optgroup key={c._id} label={c.name}>
                      <option value={c._id}>{c.name}</option>
                      {subCategories(c._id).map((sub) => (
                        <option key={sub._id} value={sub._id}>↳ {sub.name}</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-ink-700 mb-1.5">Description <span className="text-ink-400 font-normal">(optional)</span></label>
                <input ref={descRef} defaultValue="" placeholder="Brief description" className="input-base" />
              </div>
            </div>

            <label className="flex items-center gap-3 p-4 bg-white rounded-xl border-2 border-ink-200 cursor-pointer hover:border-green-400 transition-colors w-fit">
              <input type="checkbox" ref={isLeafRef} defaultChecked={false} className="rounded accent-green-500" />
              <div>
                <p className="text-sm font-semibold text-ink-900">This is a leaf (product) category</p>
                <p className="text-xs text-ink-500 mt-0.5">Vendors can add products directly to leaf categories. Attributes can only be added to leaf categories.</p>
              </div>
            </label>

            <div className="flex gap-3">
              <button type="submit" disabled={creating} className="btn-primary px-6 py-2.5 text-sm">
                {creating ? "Creating..." : "Create Category"}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="px-6 py-2.5 text-sm rounded-xl border border-ink-200 text-ink-600 hover:bg-ink-50">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="card p-5"><div className="skeleton h-10 rounded-xl" /></div>)}</div>
      ) : categories.length === 0 ? (
        <div className="card p-16 text-center">
          <div className="text-5xl mb-4">🗂️</div>
          <h3 className="font-display font-bold text-ink-900 text-lg">No categories yet</h3>
          <p className="text-ink-500 text-sm mt-2">Create your first category to let vendors list products.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {rootCategories.map((cat) => (
            <CategoryRow
              key={cat._id}
              cat={cat}
              subCategories={subCategories}
              allCategories={categories}
              onRefresh={load}
            />
          ))}
        </div>
      )}

      {/* Instructions */}
      <div className="mt-8 p-5 bg-blue-50 border border-blue-200 rounded-2xl">
        <p className="text-sm font-semibold text-blue-800 mb-2">📌 How categories work</p>
        <ul className="text-xs text-blue-700 space-y-1">
          <li>• Root categories (e.g. <strong>Electronics</strong>) are top-level groupings</li>
          <li>• Subcategories (e.g. <strong>Mobiles</strong>) belong to a root category</li>
          <li>• Mark a category as <strong>Leaf</strong> to allow vendors to list products in it</li>
          <li>• Add <strong>Attributes</strong> to leaf categories so vendors fill in product specs (size, color, etc.)</li>
        </ul>
      </div>
    </div>
  );
}
