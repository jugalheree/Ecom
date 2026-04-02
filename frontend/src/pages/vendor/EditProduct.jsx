import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { vendorAPI } from "../../services/apis/index";
import { vendorExtrasAPI } from "../../services/apis/index";
import api from "../../services/api";
import { useToastStore } from "../../store/toastStore";

const Field = ({ label, hint, children }) => (
  <div>
    <label className="text-xs font-bold uppercase tracking-widest text-ink-500 mb-2 block">
      {label} {hint && <span className="font-normal normal-case tracking-normal text-ink-400">({hint})</span>}
    </label>
    {children}
  </div>
);

const Input = (props) => (
  <input
    {...props}
    className={`w-full rounded-xl border-2 border-ink-200 bg-white px-4 py-3 text-ink-900 text-sm placeholder:text-ink-300 focus:outline-none focus:border-ink-900 focus:ring-4 focus:ring-ink-900/5 transition-all ${props.className || ""}`}
  />
);

export default function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const showToast = useToastStore((s) => s.showToast);

  const [form, setForm] = useState({
    title: "", description: "",
    price: "", stock: "",
    minDeliveryDays: "1", maxDeliveryDays: "5",
    vendorDiscountPercent: "0",
    minStockAlert: "5",
  });
  const [bulkTiers, setBulkTiers] = useState([]);
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
            vendorDiscountPercent: p.vendorDiscountPercent ?? 0,
            minStockAlert: p.minStockAlert ?? 5,
          });
          setBulkTiers(p.bulkPricingTiers || []);
        } else {
          setError("Product not found.");
        }
      })
      .catch(() => setError("Failed to load product. Please try again."))
      .finally(() => setLoading(false));
  }, [id]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const addTier = () => setBulkTiers([...bulkTiers, { minQty: "", discountPercent: "" }]);
  const removeTier = (i) => setBulkTiers(bulkTiers.filter((_, idx) => idx !== i));
  const updateTier = (i, field, val) => {
    const updated = [...bulkTiers];
    updated[i] = { ...updated[i], [field]: val };
    setBulkTiers(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      // Update core product fields
      await vendorAPI.updateProduct(id, {
        title: form.title,
        description: form.description,
        price: Number(form.price),
        stock: Number(form.stock),
        minDeliveryDays: Number(form.minDeliveryDays),
        maxDeliveryDays: Number(form.maxDeliveryDays),
      });

      // Update discount and bulk pricing
      const validTiers = bulkTiers.filter(t => t.minQty && t.discountPercent);
      await vendorExtrasAPI.updateDiscount(id, {
        vendorDiscountPercent: Number(form.vendorDiscountPercent) || 0,
        bulkPricingTiers: validTiers.map(t => ({
          minQty: Number(t.minQty),
          discountPercent: Number(t.discountPercent),
        })),
      });

      // Update min stock alert
      await vendorExtrasAPI.setMinStockAlert(id, Number(form.minStockAlert) || 5);

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

  if (loading) return (
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
        <button onClick={() => navigate("/vendor/products")}
          className="flex items-center gap-2 text-sm text-ink-500 hover:text-ink-900 mb-6 transition-colors group">
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
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl mb-6">{error}</div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Title */}
              <Field label="Product Title *">
                <Input type="text" name="title" value={form.title} onChange={handleChange} required placeholder="Product title" />
              </Field>

              {/* Description */}
              <Field label="Description">
                <textarea name="description" value={form.description} onChange={handleChange} rows={4}
                  className="w-full rounded-xl border-2 border-ink-200 bg-white px-4 py-3 text-ink-900 text-sm placeholder:text-ink-300 resize-none focus:outline-none focus:border-ink-900 focus:ring-4 focus:ring-ink-900/5 transition-all"
                  placeholder="Describe your product..." />
              </Field>

              {/* Price + Stock */}
              <div className="grid grid-cols-2 gap-4">
                <Field label="Price (₹) *">
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-400 text-sm font-semibold">₹</span>
                    <Input type="number" name="price" value={form.price} onChange={handleChange} min="0" required className="pl-8" />
                  </div>
                </Field>
                <Field label="Stock *">
                  <Input type="number" name="stock" value={form.stock} onChange={handleChange} min="0" required />
                </Field>
              </div>

              {/* Delivery */}
              <Field label="Delivery Window (days)">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-ink-400 mb-1.5">Minimum</div>
                    <Input type="number" name="minDeliveryDays" value={form.minDeliveryDays} onChange={handleChange} min="1" />
                  </div>
                  <div>
                    <div className="text-xs text-ink-400 mb-1.5">Maximum</div>
                    <Input type="number" name="maxDeliveryDays" value={form.maxDeliveryDays} onChange={handleChange} min="1" />
                  </div>
                </div>
              </Field>

              {/* Discount + Stock Alert */}
              <div className="grid grid-cols-2 gap-4">
                <Field label="Vendor Discount %" hint="0 = no discount">
                  <div className="relative">
                    <Input type="number" name="vendorDiscountPercent" value={form.vendorDiscountPercent} onChange={handleChange} min="0" max="100" placeholder="0" />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-ink-400 text-sm">%</span>
                  </div>
                </Field>
                <Field label="Low Stock Alert At" hint="units">
                  <Input type="number" name="minStockAlert" value={form.minStockAlert} onChange={handleChange} min="0" placeholder="5" />
                </Field>
              </div>

              {/* Bulk Pricing Tiers */}
              <Field label="Bulk Pricing Tiers" hint="optional">
                <div className="space-y-2">
                  {bulkTiers.map((tier, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="flex-1">
                        <Input type="number" placeholder="Min qty" value={tier.minQty}
                          onChange={(e) => updateTier(i, "minQty", e.target.value)} min="1" />
                      </div>
                      <span className="text-ink-400 text-sm">→</span>
                      <div className="flex-1 relative">
                        <Input type="number" placeholder="Discount %" value={tier.discountPercent}
                          onChange={(e) => updateTier(i, "discountPercent", e.target.value)} min="1" max="100" />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-ink-400 text-sm">%</span>
                      </div>
                      <button type="button" onClick={() => removeTier(i)}
                        className="w-9 h-9 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 flex items-center justify-center text-sm transition-colors">✕</button>
                    </div>
                  ))}
                  <button type="button" onClick={addTier}
                    className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1.5 mt-1">
                    <span className="w-5 h-5 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 font-bold">+</span>
                    Add tier (e.g. buy 10+, get 5% off)
                  </button>
                </div>
              </Field>

              <div className="pt-2">
                <button type="submit" disabled={saving}
                  className="w-full py-3.5 px-6 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
                  style={{ background: saving ? "#8e8e9a" : "linear-gradient(135deg,#131318 0%,#3e3e48 100%)", boxShadow: saving ? "none" : "0 4px 20px rgba(19,19,24,0.25)" }}>
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
