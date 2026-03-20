import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useToastStore } from "../../store/toastStore";
import { vendorMarketplaceAPI, vendorAPI } from "../../services/apis/index";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const daysUntilExpiry = (expiryDate) => {
  if (!expiryDate) return null;
  const diff = new Date(expiryDate) - new Date();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

const ExpiryBadge = ({ days }) => {
  if (days === null) return null;
  const color = days <= 0 ? "#ef4444" : days <= 30 ? "#ef4444" : days <= 90 ? "#f59e0b" : "#10b981";
  const label =
    days <= 0 ? "Expired" :
    days <= 7 ? `${days}d — URGENT` :
    days <= 30 ? `${days}d left` :
    `${days}d left`;
  return (
    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
      style={{ background: `${color}18`, color, border: `1px solid ${color}40` }}>
      ⏱ {label}
    </span>
  );
};

const CONDITIONS = {
  NEW: { label: "Brand New", color: "#10b981" },
  EXCELLENT: { label: "Excellent", color: "#3b82f6" },
  GOOD: { label: "Good", color: "#f59e0b" },
};

// ─── Create / List Product Modal ──────────────────────────────────────────────
function CreateListingModal({ onClose, onSuccess, vendorProducts }) {
  const [form, setForm] = useState({
    productId: "",
    listingType: "NEW",
    title: "",
    description: "",
    originalPrice: "",
    discountedPrice: "",
    stock: "",
    unit: "piece",
    expiryDate: "",
    manufacturingDate: "",
    reason: "",
    condition: "NEW",
    contactInfo: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [autoDiscount, setAutoDiscount] = useState(null);
  const showToast = useToastStore((s) => s.showToast);

  const handleProductSelect = (productId) => {
    const product = vendorProducts.find((p) => p._id === productId);
    if (product) {
      setForm((f) => ({
        ...f,
        productId,
        title: product.title || product.name || "",
        originalPrice: String(product.price || ""),
        stock: String(product.stock || ""),
      }));
    } else {
      setForm((f) => ({ ...f, productId }));
    }
  };

  useEffect(() => {
    if (form.listingType === "SURPLUS" && form.expiryDate && form.originalPrice) {
      const days = daysUntilExpiry(form.expiryDate);
      let pct = 0;
      if (days <= 0) pct = 80;
      else if (days <= 7) pct = 70;
      else if (days <= 14) pct = 55;
      else if (days <= 30) pct = 40;
      else if (days <= 60) pct = 25;
      else if (days <= 90) pct = 15;
      const suggested = pct > 0 ? Math.round(parseFloat(form.originalPrice) * (1 - pct / 100)) : null;
      setAutoDiscount(suggested ? { pct, price: suggested, days } : null);
    } else {
      setAutoDiscount(null);
    }
  }, [form.expiryDate, form.originalPrice, form.listingType]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.productId || !form.title || !form.originalPrice || !form.discountedPrice || !form.stock) {
      showToast({ message: "Please fill all required fields", type: "error" });
      return;
    }
    if (form.listingType === "SURPLUS" && !form.reason) {
      showToast({ message: "Reason is required for surplus listings", type: "error" });
      return;
    }
    setSubmitting(true);
    try {
      await vendorMarketplaceAPI.createListing({
        ...form,
        originalPrice: parseFloat(form.originalPrice),
        discountedPrice: parseFloat(form.discountedPrice),
        stock: parseInt(form.stock),
        expiryDate: form.expiryDate || undefined,
        manufacturingDate: form.manufacturingDate || undefined,
      });
      showToast({ message: "Product listed on Vendor Marketplace!", type: "success" });
      onSuccess();
    } catch (err) {
      showToast({ message: err?.message || "Failed to create listing", type: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
      style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden my-4">
        <div className="px-7 pt-7 pb-5 border-b border-ink-100">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-ink-900 font-display">List for Vendor Sale</h2>
              <p className="text-sm text-ink-400 mt-0.5">Sell stock to other verified vendors</p>
            </div>
            <button onClick={onClose} className="w-9 h-9 rounded-xl bg-ink-50 flex items-center justify-center text-ink-600 hover:bg-ink-100 transition-colors text-lg font-bold">x</button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-7 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Listing type */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-ink-400 mb-2">Listing Category *</label>
            <div className="grid grid-cols-2 gap-3">
              {[
                ["NEW", "New Product", "New products with optional discount"],
                ["SURPLUS", "Surplus / Near Expiry", "Excess stock or near-expiry with auto-discount"]
              ].map(([val, label, desc]) => (
                <button key={val} type="button" onClick={() => setForm(f => ({ ...f, listingType: val }))}
                  className="p-3 rounded-xl text-left border-2 transition-all"
                  style={{ borderColor: form.listingType === val ? "#f05f00" : "#e2e2e8", background: form.listingType === val ? "#fff8f5" : "white" }}>
                  <p className="text-sm font-bold text-ink-900">{label}</p>
                  <p className="text-[11px] text-ink-400 mt-0.5">{desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Product select */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-ink-400 mb-2">Select Your Product *</label>
            <select value={form.productId} onChange={e => handleProductSelect(e.target.value)} required
              className="w-full rounded-xl border-2 border-ink-200 bg-white px-4 py-3 text-sm text-ink-900 focus:outline-none focus:border-ink-900">
              <option value="">Choose from your products...</option>
              {vendorProducts.map(p => (
                <option key={p._id} value={p._id}>{p.title || p.name} — Rs.{p.price} ({p.stock} in stock)</option>
              ))}
              {vendorProducts.length === 0 && <option disabled>No approved products found</option>}
            </select>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-ink-400 mb-2">Listing Title *</label>
            <input type="text" required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="e.g. Premium Basmati Rice 25kg Bag"
              className="w-full rounded-xl border-2 border-ink-200 bg-white px-4 py-3 text-sm text-ink-900 focus:outline-none focus:border-ink-900" />
          </div>

          {/* Prices & Stock */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-ink-400 mb-2">Original Price *</label>
              <input type="number" min="0" step="0.01" required value={form.originalPrice}
                onChange={e => setForm(f => ({ ...f, originalPrice: e.target.value }))}
                placeholder="0.00"
                className="w-full rounded-xl border-2 border-ink-200 bg-white px-4 py-3 text-sm focus:outline-none focus:border-ink-900" />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-ink-400 mb-2">
                Sell Price *
                {autoDiscount && (
                  <span className="ml-1 text-orange-500 normal-case font-medium">(suggested: Rs.{autoDiscount.price})</span>
                )}
              </label>
              <input type="number" min="0" step="0.01" required value={form.discountedPrice}
                onChange={e => setForm(f => ({ ...f, discountedPrice: e.target.value }))}
                placeholder="0.00"
                className="w-full rounded-xl border-2 border-ink-200 bg-white px-4 py-3 text-sm focus:outline-none focus:border-ink-900" />
              {autoDiscount && (
                <button type="button"
                  onClick={() => setForm(f => ({ ...f, discountedPrice: String(autoDiscount.price) }))}
                  className="text-[10px] text-orange-500 font-semibold mt-1 hover:underline">
                  Apply -{autoDiscount.pct}% suggestion
                </button>
              )}
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-ink-400 mb-2">Units Available *</label>
              <input type="number" min="1" required value={form.stock}
                onChange={e => setForm(f => ({ ...f, stock: e.target.value }))}
                className="w-full rounded-xl border-2 border-ink-200 bg-white px-4 py-3 text-sm focus:outline-none focus:border-ink-900" />
            </div>
          </div>

          {/* Unit + Condition */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-ink-400 mb-2">Unit</label>
              <input type="text" value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))}
                placeholder="kg, piece, bag, tin..."
                className="w-full rounded-xl border-2 border-ink-200 bg-white px-4 py-3 text-sm focus:outline-none focus:border-ink-900" />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-ink-400 mb-2">Condition</label>
              <select value={form.condition} onChange={e => setForm(f => ({ ...f, condition: e.target.value }))}
                className="w-full rounded-xl border-2 border-ink-200 bg-white px-4 py-3 text-sm focus:outline-none focus:border-ink-900">
                <option value="NEW">Brand New</option>
                <option value="EXCELLENT">Excellent</option>
                <option value="GOOD">Good</option>
              </select>
            </div>
          </div>

          {/* Expiry + Mfg */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-ink-400 mb-2">
                Expiry Date {form.listingType === "SURPLUS" ? "(recommended)" : "(optional)"}
              </label>
              <input type="date" value={form.expiryDate} onChange={e => setForm(f => ({ ...f, expiryDate: e.target.value }))}
                className="w-full rounded-xl border-2 border-ink-200 bg-white px-4 py-3 text-sm focus:outline-none focus:border-ink-900" />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-ink-400 mb-2">Manufacturing Date</label>
              <input type="date" value={form.manufacturingDate} onChange={e => setForm(f => ({ ...f, manufacturingDate: e.target.value }))}
                className="w-full rounded-xl border-2 border-ink-200 bg-white px-4 py-3 text-sm focus:outline-none focus:border-ink-900" />
            </div>
          </div>

          {/* Reason (required for surplus) */}
          {form.listingType === "SURPLUS" && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-ink-400 mb-2">Reason for Selling *</label>
              <textarea rows={2} required value={form.reason} onChange={e => setForm(f => ({ ...f, reason: e.target.value }))}
                placeholder="e.g. Overstock from cancelled export, near expiry with deep discount..."
                className="w-full rounded-xl border-2 border-ink-200 bg-white px-4 py-3 text-sm resize-none focus:outline-none focus:border-ink-900" />
            </div>
          )}

          {/* Description */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-ink-400 mb-2">Description (optional)</label>
            <textarea rows={2} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Additional details about this listing..."
              className="w-full rounded-xl border-2 border-ink-200 bg-white px-4 py-3 text-sm resize-none focus:outline-none focus:border-ink-900" />
          </div>

          {/* Contact */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-ink-400 mb-2">Contact Info (optional)</label>
            <input type="text" value={form.contactInfo} onChange={e => setForm(f => ({ ...f, contactInfo: e.target.value }))}
              placeholder="Phone or WhatsApp for direct negotiation"
              className="w-full rounded-xl border-2 border-ink-200 bg-white px-4 py-3 text-sm focus:outline-none focus:border-ink-900" />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-3 rounded-xl text-sm font-semibold text-ink-600 border-2 border-ink-200 hover:border-ink-400 transition-all">
              Cancel
            </button>
            <button type="submit" disabled={submitting}
              className="flex-1 py-3 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-50"
              style={{ background: "linear-gradient(135deg,#131318,#3e3e48)" }}>
              {submitting ? "Listing..." : "List Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Contact Modal ────────────────────────────────────────────────────────────
function ContactModal({ item, onClose }) {
  const [message, setMessage] = useState(
    `Hi, I'm interested in ${item.stock} units of "${item.title}". Can we discuss pricing?`
  );
  const [sending, setSending] = useState(false);
  const showToast = useToastStore((s) => s.showToast);

  const handleSend = async () => {
    if (!message.trim()) {
      showToast({ message: "Message cannot be empty", type: "error" });
      return;
    }
    setSending(true);
    try {
      await vendorMarketplaceAPI.contactVendor(item._id, { message });
      showToast({ message: "Message sent to vendor!", type: "success" });
      onClose();
    } catch (err) {
      showToast({ message: err?.message || "Failed to send message", type: "error" });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-7">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-ink-900 font-display">Contact Vendor</h2>
          <button onClick={onClose}
            className="w-9 h-9 rounded-xl bg-ink-50 flex items-center justify-center text-ink-600 hover:bg-ink-100 transition-colors font-bold text-lg">
            x
          </button>
        </div>
        <div className="rounded-2xl p-4 mb-5" style={{ background: "#f7f7f8", border: "1px solid #e2e2e8" }}>
          <p className="text-sm font-bold text-ink-900">{item.title}</p>
          <p className="text-xs text-ink-500 mt-0.5">
            by {item.vendor?.shopName || "Vendor"} &middot; Rs.{item.discountedPrice?.toLocaleString()}/{item.unit}
          </p>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-ink-400 mb-2">Your Message</label>
            <textarea rows={4} value={message} onChange={e => setMessage(e.target.value)}
              className="w-full rounded-xl border-2 border-ink-200 bg-white px-4 py-3 text-sm text-ink-900 resize-none focus:outline-none focus:border-ink-900" />
          </div>
          <div className="flex gap-3">
            <button onClick={onClose}
              className="flex-1 py-3 rounded-xl text-sm font-semibold text-ink-600 border-2 border-ink-200 hover:border-ink-400 transition-all">
              Cancel
            </button>
            <button onClick={handleSend} disabled={sending}
              className="flex-1 py-3 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-50"
              style={{ background: "linear-gradient(135deg,#131318,#3e3e48)" }}>
              {sending ? "Sending..." : "Send Message"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Listing Card ─────────────────────────────────────────────────────────────
function ListingCard({ item, onContact, onGoToProduct }) {
  const days = item.daysUntilExpiry ?? daysUntilExpiry(item.expiryDate);
  const discount = item.discountPercent ||
    (item.originalPrice && item.originalPrice !== item.discountedPrice
      ? Math.round((1 - item.discountedPrice / item.originalPrice) * 100)
      : 0);
  const cond = CONDITIONS[item.condition] || CONDITIONS.NEW;
  const isNew = item.listingType === "NEW";
  const productId = item.productId?._id || item.productId;

  return (
    <div className="bg-white rounded-2xl border border-ink-100 hover:border-brand-200 hover:shadow-lg transition-all duration-300 overflow-hidden group flex flex-col">
      {/* Image */}
      <div className="h-36 flex items-center justify-center text-5xl relative flex-shrink-0 overflow-hidden"
        style={{ background: "linear-gradient(135deg,#f7f7f8,#efefef)" }}>
        {item.primaryImage?.imageUrl
          ? <img src={item.primaryImage.imageUrl} alt={item.title} className="w-full h-full object-cover" />
          : <span>📦</span>}

        {discount > 0 && (
          <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg text-xs font-bold text-white"
            style={{ background: isNew ? "linear-gradient(135deg,#10b981,#059669)" : "linear-gradient(135deg,#ef4444,#dc2626)" }}>
            -{discount}%
          </div>
        )}
        <div className="absolute top-3 right-3">
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white" style={{ background: cond.color }}>
            {cond.label}
          </span>
        </div>
        <div className="absolute bottom-3 left-3">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full text-white ${isNew ? "bg-emerald-500" : "bg-orange-500"}`}>
            {isNew ? "New Stock" : "Surplus"}
          </span>
        </div>
      </div>

      <div className="p-4 flex flex-col flex-1">
        <h3 className="text-sm font-bold text-ink-900 leading-snug line-clamp-2 mb-2">{item.title}</h3>

        {/* Vendor */}
        <div className="flex items-center gap-1.5 mb-3">
          <div className="w-5 h-5 rounded-md bg-brand-100 flex items-center justify-center text-[10px] font-bold text-brand-600">
            {(item.vendor?.shopName || "V")[0]}
          </div>
          <span className="text-xs text-ink-500 truncate">{item.vendor?.shopName || "Vendor"}</span>
        </div>

        {/* Expiry badge */}
        {days !== null && <div className="mb-3"><ExpiryBadge days={days} /></div>}

        {/* Reason */}
        {item.reason && (
          <p className="text-[11px] text-ink-400 line-clamp-2 mb-3 leading-relaxed">{item.reason}</p>
        )}

        {/* Price */}
        <div className="flex items-end justify-between gap-2 mb-3 mt-auto">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-bold text-ink-900">Rs.{item.discountedPrice?.toLocaleString()}</span>
              <span className="text-xs text-ink-400 font-medium">/{item.unit || "piece"}</span>
            </div>
            {item.originalPrice && item.originalPrice !== item.discountedPrice && (
              <span className="text-xs text-ink-400 line-through">Rs.{item.originalPrice?.toLocaleString()}</span>
            )}
          </div>
          <span className="text-xs text-ink-400">{item.stock} avail.</span>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          {productId && (
            <button
              onClick={() => onGoToProduct(productId)}
              title="View this product in your stock"
              className="flex-shrink-0 px-3 py-2.5 rounded-xl text-xs font-semibold border-2 border-ink-200 text-ink-600 hover:border-ink-400 hover:bg-ink-50 transition-all">
              View Product
            </button>
          )}
          <button
            onClick={() => onContact(item)}
            className="flex-1 py-2.5 rounded-xl text-xs font-bold transition-all group-hover:shadow-md active:scale-[0.97] text-white"
            style={{ background: "linear-gradient(135deg,#131318,#3e3e48)" }}>
            Contact Vendor
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function VendorMarketplace() {
  const navigate = useNavigate();
  const showToast = useToastStore((s) => s.showToast);

  const [listings, setListings] = useState([]);
  const [vendorProducts, setVendorProducts] = useState([]);
  const [stats, setStats] = useState({ totalListings: 0, expiringCount: 0, avgDiscount: 0, surplusCount: 0 });
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [contactItem, setContactItem] = useState(null);

  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("newest");

  const loadListings = useCallback(async () => {
    setLoading(true);
    try {
      const params = { sort };
      if (activeTab !== "all") params.listingType = activeTab;
      if (search) params.search = search;

      const [listingsRes, statsRes] = await Promise.allSettled([
        vendorMarketplaceAPI.getListings(params),
        vendorMarketplaceAPI.getStats(),
      ]);

      if (listingsRes.status === "fulfilled") {
        const d = listingsRes.value.data?.data;
        setListings(d?.listings || []);
      }
      if (statsRes.status === "fulfilled") {
        setStats(statsRes.value.data?.data || {});
      }
    } catch {
      // silently fail — no listings to show
    } finally {
      setLoading(false);
    }
  }, [activeTab, sort]); // search is applied client-side for responsiveness

  useEffect(() => {
    loadListings();
  }, [loadListings]);

  // Load vendor products for the create listing form
  useEffect(() => {
    vendorAPI.products()
      .then((r) => {
        const d = r.data?.data;
        setVendorProducts(Array.isArray(d) ? d : d?.products || []);
      })
      .catch(() => {});
  }, []);

  const handleGoToProduct = (productId) => {
    navigate(`/vendor/stock?highlight=${productId}`);
  };

  // Client-side search filter
  const filteredListings = listings.filter((item) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      item.title?.toLowerCase().includes(q) ||
      item.vendor?.shopName?.toLowerCase().includes(q)
    );
  });

  const newListings = filteredListings.filter((l) => l.listingType === "NEW");
  const surplusListings = filteredListings.filter((l) => l.listingType === "SURPLUS");

  const displayNew = activeTab === "all" || activeTab === "NEW";
  const displaySurplus = activeTab === "all" || activeTab === "SURPLUS";

  return (
    <div className="min-h-screen" style={{ background: "#f7f7f8" }}>
      {/* ── Header ── */}
      <div className="bg-ink-950 px-6 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-xl bg-brand-600 flex items-center justify-center text-sm">🏪</div>
                <span className="text-xs font-bold uppercase tracking-widest text-ink-400">Vendor Only</span>
              </div>
              <h1 className="text-3xl font-display font-bold text-white mb-1">Vendor Marketplace</h1>
              <p className="text-ink-400 text-sm max-w-xl">
                Buy new or surplus stock from fellow vendors at competitive prices. List your own excess inventory to minimise losses.
              </p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="flex-shrink-0 px-5 py-3 rounded-xl text-sm font-bold text-white transition-all active:scale-[0.97]"
              style={{ background: "linear-gradient(135deg,#f05f00,#ff7d07)", boxShadow: "0 4px 16px rgba(240,95,0,0.3)" }}>
              + List My Stock
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
            {[
              { label: "Active Listings", value: stats.totalListings || filteredListings.length, icon: "📦" },
              { label: "Expiring (90d)", value: stats.expiringCount || 0, icon: "⏱", urgent: true },
              { label: "Surplus Listings", value: stats.surplusCount || surplusListings.length, icon: "📉" },
              { label: "Avg Discount", value: `${stats.avgDiscount || 0}%`, icon: "💰" },
            ].map((s, i) => (
              <div key={i} className="rounded-2xl px-4 py-4"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">{s.icon}</span>
                  <span className="text-xs text-ink-400">{s.label}</span>
                </div>
                <p className={`text-2xl font-bold ${s.urgent ? "text-orange-400" : "text-white"}`}>{s.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Search + Sort */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400"
              viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search products or vendors..."
              className="w-full pl-11 pr-4 py-3 rounded-xl border-2 border-ink-200 bg-white text-sm text-ink-900 placeholder:text-ink-300 focus:outline-none focus:border-ink-900 transition-all" />
          </div>
          <select value={sort} onChange={e => setSort(e.target.value)}
            className="px-4 py-3 rounded-xl border-2 border-ink-200 bg-white text-sm text-ink-600 focus:outline-none focus:border-ink-900">
            <option value="newest">Newest First</option>
            <option value="discount">Highest Discount</option>
            <option value="expiry">Expiring Soonest</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
          </select>
        </div>

        {/* Tab bar */}
        <div className="flex gap-2 mb-8">
          {[
            ["all", "All Listings"],
            ["NEW", "New Products"],
            ["SURPLUS", "Surplus / Near Expiry"],
          ].map(([val, label]) => (
            <button key={val} onClick={() => setActiveTab(val)}
              className="px-4 py-2 rounded-xl text-sm font-semibold transition-all"
              style={{
                background: activeTab === val ? "#131318" : "white",
                color: activeTab === val ? "white" : "#70707e",
                border: `2px solid ${activeTab === val ? "#131318" : "#e2e2e8"}`,
              }}>
              {label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="h-80 rounded-2xl bg-white animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            {/* ── NEW PRODUCTS ── */}
            {displayNew && (
              <section className="mb-10">
                {activeTab === "all" && (
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center text-sm">🆕</div>
                    <div>
                      <h2 className="text-lg font-bold text-ink-900 font-display">New Products</h2>
                      <p className="text-xs text-ink-400">Fresh stock — with or without a discount</p>
                    </div>
                    <span className="ml-auto text-sm font-semibold text-ink-400">
                      {newListings.length} listing{newListings.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                )}

                {newListings.length === 0 ? (
                  <div className="text-center py-12 rounded-2xl bg-white border border-ink-100">
                    <div className="text-4xl mb-3">🆕</div>
                    <p className="font-semibold text-ink-600">No new product listings yet</p>
                    <p className="text-sm text-ink-400 mt-1">Be the first to list a new product!</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {newListings.map(item => (
                      <ListingCard key={item._id} item={item} onContact={setContactItem} onGoToProduct={handleGoToProduct} />
                    ))}
                  </div>
                )}
              </section>
            )}

            {/* ── SURPLUS / NEAR EXPIRY ── */}
            {displaySurplus && (
              <section>
                {activeTab === "all" && (
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-xl bg-orange-100 flex items-center justify-center text-sm">📦</div>
                    <div>
                      <h2 className="text-lg font-bold text-ink-900 font-display">Surplus &amp; Near-Expiry Stock</h2>
                      <p className="text-xs text-ink-400">Discount auto-increases as expiry approaches</p>
                    </div>
                    <span className="ml-auto text-sm font-semibold text-ink-400">
                      {surplusListings.length} listing{surplusListings.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                )}

                {/* Discount tier legend */}
                {surplusListings.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4 p-3 rounded-xl bg-orange-50 border border-orange-200">
                    <span className="text-xs font-bold text-orange-700 mr-1">Auto-discount tiers:</span>
                    {[["7d", "70%"], ["14d", "55%"], ["30d", "40%"], ["60d", "25%"], ["90d", "15%"]].map(([label, pct]) => (
                      <span key={label} className="text-[11px] bg-orange-100 text-orange-700 rounded-lg px-2 py-0.5 font-semibold">
                        &le;{label} &rarr; {pct} off
                      </span>
                    ))}
                  </div>
                )}

                {surplusListings.length === 0 ? (
                  <div className="text-center py-12 rounded-2xl bg-white border border-ink-100">
                    <div className="text-4xl mb-3">📦</div>
                    <p className="font-semibold text-ink-600">No surplus listings yet</p>
                    <p className="text-sm text-ink-400 mt-1">List your surplus or near-expiry stock to minimise losses.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {surplusListings.map(item => (
                      <ListingCard key={item._id} item={item} onContact={setContactItem} onGoToProduct={handleGoToProduct} />
                    ))}
                  </div>
                )}
              </section>
            )}

            {/* No results */}
            {filteredListings.length === 0 && (
              <div className="text-center py-20">
                <div className="text-5xl mb-4">🔍</div>
                <h3 className="font-display font-bold text-ink-900 text-lg">No listings found</h3>
                <p className="text-ink-500 text-sm mt-2">Try adjusting your search or be the first to list in this category.</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Create Listing Modal */}
      {showModal && (
        <CreateListingModal
          vendorProducts={vendorProducts}
          onClose={() => setShowModal(false)}
          onSuccess={() => { setShowModal(false); loadListings(); }}
        />
      )}

      {/* Contact Modal */}
      {contactItem && (
        <ContactModal item={contactItem} onClose={() => setContactItem(null)} />
      )}
    </div>
  );
}
