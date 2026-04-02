import { useEffect, useState } from "react";
import { couponAPI } from "../../services/apis/index";
import { useToastStore } from "../../store/toastStore";

const EMPTY = { code: "", description: "", discountType: "PERCENT", discountValue: "", minOrderValue: "", maxDiscount: "", usageLimit: "", expiresAt: "" };

export default function AdminCoupons() {
  const showToast = useToastStore((s) => s.showToast);
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [creating, setCreating] = useState(false);

  const load = () => {
    setLoading(true);
    couponAPI.list()
      .then((r) => setCoupons(r.data?.data || []))
      .catch(() => showToast({ message: "Failed to load coupons", type: "error" }))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.code || !form.discountValue) {
      showToast({ message: "Code and discount value are required", type: "error" }); return;
    }
    setCreating(true);
    try {
      await couponAPI.create({
        code: form.code,
        description: form.description,
        discountType: form.discountType,
        discountValue: Number(form.discountValue),
        minOrderValue: form.minOrderValue ? Number(form.minOrderValue) : 0,
        maxDiscount:   form.maxDiscount   ? Number(form.maxDiscount)   : null,
        usageLimit:    form.usageLimit    ? Number(form.usageLimit)    : null,
        expiresAt:     form.expiresAt     || null,
      });
      showToast({ message: "Coupon created!", type: "success" });
      setForm(EMPTY);
      setShowForm(false);
      load();
    } catch (err) {
      showToast({ message: err?.response?.data?.message || "Failed to create coupon", type: "error" });
    } finally { setCreating(false); }
  };

  const handleToggle = async (id) => {
    try {
      const res = await couponAPI.toggle(id);
      setCoupons((prev) => prev.map((c) => c._id === id ? { ...c, isActive: res.data?.data?.isActive } : c));
    } catch {
      showToast({ message: "Failed to update coupon", type: "error" });
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this coupon? This cannot be undone.")) return;
    try {
      await couponAPI.remove(id);
      setCoupons((prev) => prev.filter((c) => c._id !== id));
      showToast({ message: "Coupon deleted", type: "success" });
    } catch {
      showToast({ message: "Failed to delete coupon", type: "error" });
    }
  };

  return (
    <div className="min-h-screen bg-sand-50 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="section-label">Admin</p>
          <h1 className="text-2xl font-display font-bold text-ink-900 mt-1">Coupons</h1>
          <p className="text-ink-400 text-sm mt-0.5">{coupons.length} coupon{coupons.length !== 1 ? "s" : ""} total</p>
        </div>
        <button onClick={() => setShowForm((s) => !s)} className="btn-primary px-5 py-2.5 text-sm">
          {showForm ? "Cancel" : "+ New Coupon"}
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <div className="card p-6 mb-6">
          <h2 className="font-display font-bold text-ink-900 mb-5">Create Coupon</h2>
          <form onSubmit={handleCreate} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-ink-500 mb-1.5">Code *</label>
              <input value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
                placeholder="e.g. SAVE20" className="input-base" />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-ink-500 mb-1.5">Type *</label>
              <select value={form.discountType} onChange={(e) => setForm((f) => ({ ...f, discountType: e.target.value }))}
                className="input-base">
                <option value="PERCENT">Percentage (%)</option>
                <option value="FLAT">Flat Amount (₹)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-ink-500 mb-1.5">
                Value * {form.discountType === "PERCENT" ? "(%)" : "(₹)"}
              </label>
              <input type="number" min="1" value={form.discountValue} onChange={(e) => setForm((f) => ({ ...f, discountValue: e.target.value }))}
                placeholder={form.discountType === "PERCENT" ? "e.g. 20" : "e.g. 100"} className="input-base" />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-ink-500 mb-1.5">Min Order (₹)</label>
              <input type="number" min="0" value={form.minOrderValue} onChange={(e) => setForm((f) => ({ ...f, minOrderValue: e.target.value }))}
                placeholder="0 = no minimum" className="input-base" />
            </div>
            {form.discountType === "PERCENT" && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-ink-500 mb-1.5">Max Discount (₹)</label>
                <input type="number" min="0" value={form.maxDiscount} onChange={(e) => setForm((f) => ({ ...f, maxDiscount: e.target.value }))}
                  placeholder="No cap" className="input-base" />
              </div>
            )}
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-ink-500 mb-1.5">Usage Limit</label>
              <input type="number" min="1" value={form.usageLimit} onChange={(e) => setForm((f) => ({ ...f, usageLimit: e.target.value }))}
                placeholder="Unlimited" className="input-base" />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-ink-500 mb-1.5">Expires At</label>
              <input type="datetime-local" value={form.expiresAt} onChange={(e) => setForm((f) => ({ ...f, expiresAt: e.target.value }))}
                className="input-base" />
            </div>
            <div className="sm:col-span-2 lg:col-span-3">
              <label className="block text-xs font-bold uppercase tracking-widest text-ink-500 mb-1.5">Description</label>
              <input value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="e.g. 20% off on orders above ₹500" className="input-base" />
            </div>
            <div className="sm:col-span-2 lg:col-span-3 flex gap-3">
              <button type="submit" disabled={creating} className="btn-primary px-8 py-2.5 text-sm disabled:opacity-50">
                {creating ? "Creating..." : "Create Coupon"}
              </button>
              <button type="button" onClick={() => { setForm(EMPTY); setShowForm(false); }}
                className="px-6 py-2.5 rounded-xl border-2 border-ink-200 text-sm font-semibold text-ink-600 hover:border-ink-400 transition-all">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-ink-200 border-t-ink-900 rounded-full animate-spin" />
        </div>
      ) : coupons.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="text-5xl mb-3">🏷️</div>
          <h2 className="text-lg font-display font-bold text-ink-900">No coupons yet</h2>
          <p className="text-ink-500 text-sm mt-1">Create your first promo code above.</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-sand-50 border-b border-ink-100">
                <tr>
                  {["Code", "Type", "Value", "Min Order", "Used / Limit", "Expires", "Status", "Actions"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-bold uppercase tracking-widest text-ink-400">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-50">
                {coupons.map((c) => {
                  const expired = c.expiresAt && new Date(c.expiresAt) < new Date();
                  return (
                    <tr key={c._id} className="hover:bg-sand-50 transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-ink-900">{c.code}</td>
                      <td className="px-4 py-3 text-ink-600">{c.discountType}</td>
                      <td className="px-4 py-3 font-semibold text-ink-900">
                        {c.discountType === "PERCENT" ? `${c.discountValue}%` : `₹${c.discountValue}`}
                        {c.maxDiscount ? <span className="text-xs text-ink-400 ml-1">(max ₹{c.maxDiscount})</span> : null}
                      </td>
                      <td className="px-4 py-3 text-ink-600">₹{c.minOrderValue || 0}</td>
                      <td className="px-4 py-3 text-ink-600">{c.usedCount} / {c.usageLimit ?? "∞"}</td>
                      <td className="px-4 py-3 text-ink-600">
                        {c.expiresAt ? (
                          <span className={expired ? "text-red-500 font-semibold" : ""}>
                            {new Date(c.expiresAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                            {expired && " (expired)"}
                          </span>
                        ) : "Never"}
                      </td>
                      <td className="px-4 py-3">
                        <button onClick={() => handleToggle(c._id)}
                          className={`text-xs font-bold px-2.5 py-1 rounded-full border ${c.isActive && !expired ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-600 border-red-200"}`}>
                          {c.isActive && !expired ? "Active" : "Inactive"}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <button onClick={() => handleDelete(c._id)}
                          className="text-xs text-red-400 hover:text-red-600 font-semibold transition-colors">
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
