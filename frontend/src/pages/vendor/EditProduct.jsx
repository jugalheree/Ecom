import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { vendorAPI } from "../../services/apis/index";
import api from "../../services/api";
import { useToastStore } from "../../store/toastStore";

export default function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const showToast = useToastStore((s) => s.showToast);

  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    stock: "",
    minDeliveryDays: "1",
    maxDeliveryDays: "5",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get(`/api/vendor/products/${id}`)
      .then((res) => {
        const p = res.data?.data?.product || res.data?.data;
        if (p) {
          setForm({
            title: p.title || "",
            description: p.description || "",
            price: p.price ?? "",
            stock: p.stock ?? 0,
            minDeliveryDays: p.minDeliveryDays ?? 1,
            maxDeliveryDays: p.maxDeliveryDays ?? 5,
          });
        } else {
          setError("Product not found.");
        }
      })
      .catch(() => setError("Failed to load product. Please try again."))
      .finally(() => setLoading(false));
  }, [id]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await vendorAPI.updateProduct(id, {
        title: form.title,
        description: form.description,
        price: Number(form.price),
        stock: Number(form.stock),
        minDeliveryDays: Number(form.minDeliveryDays),
        maxDeliveryDays: Number(form.maxDeliveryDays),
      });
      showToast({ message: "Product updated!", type: "success" });
      navigate("/vendor/products");
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || "Update failed";
      setError(msg);
      showToast({ message: msg, type: "error" });
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen bg-ink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-ink-200 border-t-ink-900 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-display font-semibold uppercase tracking-widest text-ink-400">Loading product...</p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-ink-50 p-6">
      <div className="max-w-xl mx-auto">
        <button
          onClick={() => navigate("/vendor/products")}
          className="flex items-center gap-2 text-sm text-ink-500 hover:text-ink-900 mb-6 transition-colors group"
        >
          <span className="group-hover:-translate-x-1 transition-transform">←</span>
          Back to Products
        </button>

        <div className="bg-white rounded-2xl border border-ink-200 overflow-hidden shadow-sm">
          <div className="px-8 py-6 border-b border-ink-100">
            <p className="text-[10px] font-display font-bold uppercase tracking-[0.15em] text-brand-600 mb-1">Edit</p>
            <h1 className="text-2xl font-display font-bold text-ink-900">Update Product</h1>
          </div>

          <div className="px-8 py-8">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl mb-6">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-ink-500 mb-2 block">Product Title *</label>
                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border-2 border-ink-200 bg-white px-4 py-3 text-ink-900 text-sm placeholder:text-ink-300 focus:outline-none focus:border-ink-900 focus:ring-4 focus:ring-ink-900/5 transition-all"
                  placeholder="Product title"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-ink-500 mb-2 block">Description</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={4}
                  className="w-full rounded-xl border-2 border-ink-200 bg-white px-4 py-3 text-ink-900 text-sm placeholder:text-ink-300 resize-none focus:outline-none focus:border-ink-900 focus:ring-4 focus:ring-ink-900/5 transition-all"
                  placeholder="Describe your product..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-ink-500 mb-2 block">Price (₹) *</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-400 text-sm font-semibold">₹</span>
                    <input
                      type="number"
                      name="price"
                      value={form.price}
                      onChange={handleChange}
                      min="0"
                      required
                      className="w-full rounded-xl border-2 border-ink-200 bg-white pl-8 pr-4 py-3 text-ink-900 text-sm focus:outline-none focus:border-ink-900 focus:ring-4 focus:ring-ink-900/5 transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-ink-500 mb-2 block">Stock (units) *</label>
                  <input
                    type="number"
                    name="stock"
                    value={form.stock}
                    onChange={handleChange}
                    min="0"
                    required
                    className="w-full rounded-xl border-2 border-ink-200 bg-white px-4 py-3 text-ink-900 text-sm focus:outline-none focus:border-ink-900 focus:ring-4 focus:ring-ink-900/5 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-ink-500 mb-2 block">Delivery Window (days)</label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-ink-400 mb-1.5">Minimum</div>
                    <input
                      type="number"
                      name="minDeliveryDays"
                      value={form.minDeliveryDays}
                      onChange={handleChange}
                      min="1"
                      className="w-full rounded-xl border-2 border-ink-200 bg-white px-4 py-3 text-ink-900 text-sm focus:outline-none focus:border-ink-900 focus:ring-4 focus:ring-ink-900/5 transition-all"
                    />
                  </div>
                  <div>
                    <div className="text-xs text-ink-400 mb-1.5">Maximum</div>
                    <input
                      type="number"
                      name="maxDeliveryDays"
                      value={form.maxDeliveryDays}
                      onChange={handleChange}
                      min="1"
                      className="w-full rounded-xl border-2 border-ink-200 bg-white px-4 py-3 text-ink-900 text-sm focus:outline-none focus:border-ink-900 focus:ring-4 focus:ring-ink-900/5 transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full py-3.5 px-6 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
                  style={{ background: saving ? "#8e8e9a" : "linear-gradient(135deg,#131318 0%,#3e3e48 100%)", boxShadow: saving ? "none" : "0 4px 20px rgba(19,19,24,0.25)" }}
                >
                  {saving ? "Saving changes..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
