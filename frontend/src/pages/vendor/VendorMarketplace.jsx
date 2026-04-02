import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useToastStore } from "../../store/toastStore";
import { vendorMarketplaceAPI, vendorAPI, dealAPI, marketplaceAPI } from "../../services/apis/index";

// ─── Product Preview Modal ─────────────────────────────────────────────────────
function ProductPreviewModal({ productId, item, onClose, onMakeDeal }) {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!productId) return;
    marketplaceAPI.getProductDetails(productId)
      .then((r) => setDetail(r.data?.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [productId]);

  const product = detail?.product;
  const vendor  = detail?.vendor;
  const images  = detail?.images || [];
  const attrs   = detail?.attributes || [];
  const primaryImg = detail?.primaryImage?.imageUrl || images[0]?.imageUrl;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full sm:max-w-2xl rounded-t-3xl sm:rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-ink-100 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="font-display font-bold text-ink-900">Product Details</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-ink-50">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-ink-200 border-t-brand-500 rounded-full animate-spin" />
          </div>
        ) : !product ? (
          <div className="text-center py-20 text-ink-500">Product not found</div>
        ) : (
          <div className="p-6 space-y-6">
            <div className="flex gap-5">
              {/* Image */}
              <div className="w-32 h-32 rounded-2xl bg-sand-100 flex-shrink-0 overflow-hidden">
                {primaryImg
                  ? <img src={primaryImg} alt={product.title} className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center text-4xl">📦</div>}
              </div>
              {/* Core info */}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold uppercase tracking-wider text-brand-600 mb-1">{item?.vendor?.shopName || vendor?.shopName || "Vendor"}</p>
                <h3 className="font-display font-bold text-ink-900 text-xl leading-snug">{product.title}</h3>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-2xl font-bold text-ink-900">₹{(item?.discountedPrice || product.price)?.toLocaleString()}</span>
                  <span className="text-sm text-ink-400">/ {item?.unit || "piece"}</span>
                  {product.originalPrice && product.originalPrice !== product.price && (
                    <span className="text-sm text-ink-400 line-through">₹{product.originalPrice?.toLocaleString()}</span>
                  )}
                </div>
                <div className="flex items-center gap-3 mt-2 text-xs text-ink-500">
                  <span>📦 {item?.stock ?? product.stock} available</span>
                  <span>•</span>
                  <span className={product.stock > 0 ? "text-green-600 font-semibold" : "text-red-500 font-semibold"}>
                    {product.stock > 0 ? "In Stock" : "Out of Stock"}
                  </span>
                </div>
              </div>
            </div>

            {/* Description */}
            {product.description && (
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-ink-400 mb-2">Description</p>
                <p className="text-sm text-ink-600 leading-relaxed">{product.description}</p>
              </div>
            )}

            {/* Specifications */}
            {attrs.length > 0 && (
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-ink-400 mb-2">Specifications</p>
                <div className="bg-sand-50 rounded-xl overflow-hidden divide-y divide-ink-100">
                  {attrs.map((a, i) => (
                    <div key={i} className="flex items-center px-4 py-2.5 gap-4">
                      <span className="w-36 flex-shrink-0 text-xs font-semibold text-ink-400 uppercase tracking-wide">
                        {a.label || a.attributeCode}
                      </span>
                      <span className="text-sm text-ink-900">{String(a.value)}{a.unit ? ` ${a.unit}` : ""}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Vendor */}
            {vendor && (
              <div className="flex items-center gap-3 p-4 bg-sand-50 rounded-xl border border-ink-200">
                <div className="w-10 h-10 rounded-xl bg-brand-600 text-white flex items-center justify-center font-bold text-sm">
                  {vendor.shopName?.[0]?.toUpperCase() || "V"}
                </div>
                <div>
                  <p className="text-xs text-ink-400">Sold by</p>
                  <p className="font-semibold text-ink-900 text-sm">{vendor.shopName}</p>
                </div>
              </div>
            )}

            {/* CTA */}
            {item && onMakeDeal && (
              <button
                onClick={() => { onClose(); onMakeDeal(item); }}
                className="w-full py-3 rounded-xl text-sm font-bold text-white transition-all"
                style={{ background: "linear-gradient(135deg,#f05f00,#ff7d07)" }}>
                🤝 Make a Deal
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Make Deal Modal ──────────────────────────────────────────────────────────
function MakeDealModal({ item, onClose, onSuccess }) {
  const showToast = useToastStore(s => s.showToast);
  const [form, setForm] = useState({
    proposedPrice: String(item.discountedPrice || ""),
    proposedQty: "1",
    terms: "",
    deliveryDays: "7",
  });
  const [submitting, setSubmitting] = useState(false);

  // ── Address state ──────────────────────────────────────────────────────
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [addressLoading, setAddressLoading] = useState(true);
  const [selectedAddressId, setSelectedAddressId] = useState(""); // "" = none selected
  const [addingNew, setAddingNew] = useState(false);
  const [newAddress, setNewAddress] = useState({
    name: "", phone: "", street: "", area: "", city: "", state: "", pincode: "",
    lat: null, lng: null,
  });
  const [showMap, setShowMap] = useState(false);
  const [locationPinned, setLocationPinned] = useState(false);

  // Lazy-import LocationPicker to avoid top-level Leaflet issues
  const [LocationPickerComp, setLocationPickerComp] = useState(null);
  useEffect(() => {
    import("../../components/map/LocationPicker").then(m => setLocationPickerComp(() => m.default));
  }, []);

  useEffect(() => {
    import("../../services/apis/index").then(({ vendorAPI }) => {
      vendorAPI.getProfile().then(r => {
        // Try to get saved business addresses from vendor profile
        const addrs = r.data?.data?.businessAddressDetails || r.data?.data?.addresses || [];
        setSavedAddresses(addrs);
        if (addrs.length > 0) setSelectedAddressId(addrs[0]._id || "first");
      }).catch(() => {}).finally(() => setAddressLoading(false));
    });
  }, []);

  const total = (Number(form.proposedPrice) || 0) * (Number(form.proposedQty) || 0);

  const getDeliveryAddress = () => {
    if (addingNew) {
      return {
        name: newAddress.name,
        phone: newAddress.phone,
        street: newAddress.street,
        area: newAddress.area,
        city: newAddress.city,
        state: newAddress.state,
        pincode: newAddress.pincode,
        lat: newAddress.lat,
        lng: newAddress.lng,
      };
    }
    if (selectedAddressId && selectedAddressId !== "first") {
      const a = savedAddresses.find(a => (a._id || "first") === selectedAddressId);
      if (a) return {
        name: a.name || a.buildingNameOrNumber || "",
        phone: a.phone || "",
        street: a.buildingNameOrNumber || a.street || "",
        area: a.area || "",
        city: a.city || "",
        state: a.state || "",
        pincode: a.pincode || "",
        lat: a.location?.lat || null,
        lng: a.location?.lng || null,
      };
    }
    if (savedAddresses.length > 0) {
      const a = savedAddresses[0];
      return {
        name: a.name || a.buildingNameOrNumber || "",
        phone: a.phone || "",
        street: a.buildingNameOrNumber || a.street || "",
        area: a.area || "",
        city: a.city || "",
        state: a.state || "",
        pincode: a.pincode || "",
        lat: a.location?.lat || null,
        lng: a.location?.lng || null,
      };
    }
    return null;
  };

  const handleMapSelect = (data) => {
    setNewAddress(prev => ({
      ...prev,
      street: data.buildingNameOrNumber || prev.street,
      area: data.area || prev.area,
      city: data.city || prev.city,
      state: data.state || prev.state,
      pincode: data.pincode || prev.pincode,
      lat: data.lat,
      lng: data.lng,
    }));
    setLocationPinned(true);
    setShowMap(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.proposedPrice || !form.proposedQty) {
      showToast({ message: "Price and quantity required", type: "error" }); return;
    }
    if (Number(form.proposedQty) > item.stock) {
      showToast({ message: `Only ${item.stock} units available`, type: "error" }); return;
    }
    if (addingNew && (!newAddress.city || !newAddress.pincode)) {
      showToast({ message: "Please complete the delivery address", type: "error" }); return;
    }
    setSubmitting(true);
    try {
      const deliveryAddress = getDeliveryAddress();
      await dealAPI.propose({
        listingId: item._id,
        proposedPrice: Number(form.proposedPrice),
        proposedQty: Number(form.proposedQty),
        terms: form.terms,
        deliveryDays: Number(form.deliveryDays),
        deliveryAddress,
      });
      showToast({ message: "Deal proposed! Check your Deals page for updates.", type: "success" });
      onSuccess();
      onClose();
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to propose deal";
      showToast({ message: msg.toLowerCase().includes("own listing") ? "You can't make a deal on your own listing" : msg, type: "error" });
    } finally { setSubmitting(false); }
  };

  return (
    <>
      {/* Map overlay */}
      {showMap && LocationPickerComp && (
        <div className="fixed inset-0 z-[60]">
          <LocationPickerComp
            onLocationSelect={handleMapSelect}
            onClose={() => setShowMap(false)}
            initialLat={newAddress.lat}
            initialLng={newAddress.lng}
          />
        </div>
      )}

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
        onClick={onClose}>
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden max-h-[92vh] flex flex-col"
          onClick={e => e.stopPropagation()}>

          {/* Header */}
          <div className="px-6 pt-6 pb-4 border-b border-ink-100 flex-shrink-0">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold text-ink-900 font-display">🤝 Make a Deal</h2>
                <p className="text-sm text-ink-400 mt-0.5">Propose terms to {item.vendor?.shopName || "vendor"}</p>
              </div>
              <button onClick={onClose} className="w-8 h-8 rounded-xl bg-ink-50 flex items-center justify-center text-ink-600 hover:bg-ink-100">✕</button>
            </div>
          </div>

          {/* Product info */}
          <div className="px-6 py-3 bg-sand-50 border-b border-ink-100 flex-shrink-0">
            <p className="text-sm font-bold text-ink-900">{item.title}</p>
            <p className="text-xs text-ink-500 mt-0.5">Listed at ₹{item.discountedPrice?.toLocaleString()}/{item.unit} · {item.stock} available</p>
          </div>

          {/* Scrollable form body */}
          <div className="overflow-y-auto flex-1">
            <form onSubmit={handleSubmit} className="p-6 space-y-5">

              {/* Price + Qty */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-ink-400 mb-2">Your Price (₹/unit) *</label>
                  <input type="number" min="1" required value={form.proposedPrice}
                    onChange={e => setForm(f => ({...f, proposedPrice: e.target.value}))}
                    className="input-base" />
                  {Number(form.proposedPrice) < item.discountedPrice && (
                    <p className="text-[10px] text-amber-600 mt-1">Below listed price — seller may counter</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-ink-400 mb-2">Quantity *</label>
                  <input type="number" min="1" max={item.stock} required value={form.proposedQty}
                    onChange={e => setForm(f => ({...f, proposedQty: e.target.value}))}
                    className="input-base" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-ink-400 mb-2">Delivery Days</label>
                <input type="number" min="1" value={form.deliveryDays}
                  onChange={e => setForm(f => ({...f, deliveryDays: e.target.value}))}
                  className="input-base" />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-ink-400 mb-2">Terms & Notes (optional)</label>
                <textarea rows={2} value={form.terms}
                  onChange={e => setForm(f => ({...f, terms: e.target.value}))}
                  placeholder="e.g. Payment upfront, delivery by end of month..."
                  className="input-base resize-none" />
              </div>

              {/* ── Delivery Address ── */}
              <div className="border-t border-ink-100 pt-4">
                <p className="text-xs font-bold uppercase tracking-wider text-ink-500 mb-3">📍 Delivery Address</p>

                {addressLoading ? (
                  <div className="h-10 skeleton rounded-xl" />
                ) : (
                  <>
                    {/* Saved addresses */}
                    {savedAddresses.length > 0 && !addingNew && (
                      <div className="space-y-2 mb-3">
                        {savedAddresses.map((a, i) => {
                          const id = a._id || (i === 0 ? "first" : String(i));
                          const label = [a.buildingNameOrNumber, a.area, a.city, a.pincode].filter(Boolean).join(", ");
                          const selected = selectedAddressId === id || (i === 0 && !selectedAddressId);
                          return (
                            <label key={id} className={`flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${selected ? "border-brand-500 bg-brand-50" : "border-ink-200 hover:border-ink-300"}`}>
                              <input type="radio" name="savedAddr" value={id} checked={selected}
                                onChange={() => setSelectedAddressId(id)} className="mt-0.5 accent-orange-500" />
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-semibold text-ink-800 truncate">{label || "Saved address"}</p>
                                {a.state && <p className="text-[11px] text-ink-400">{a.state}</p>}
                                {(a.location?.lat || a.lat) && (
                                  <p className="text-[10px] text-green-600 mt-0.5">📍 Location pinned</p>
                                )}
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    )}

                    {/* Toggle add new */}
                    {!addingNew ? (
                      <button type="button" onClick={() => setAddingNew(true)}
                        className="w-full py-2.5 rounded-xl border-2 border-dashed border-ink-300 text-sm font-semibold text-ink-500 hover:border-brand-400 hover:text-brand-600 transition-all flex items-center justify-center gap-2">
                        <span className="text-base">＋</span> Add New Address
                      </button>
                    ) : (
                      <div className="space-y-3 p-4 bg-sand-50 rounded-xl border border-ink-200">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-xs font-bold text-ink-600 uppercase tracking-wider">New Delivery Address</p>
                          {savedAddresses.length > 0 && (
                            <button type="button" onClick={() => setAddingNew(false)}
                              className="text-xs text-ink-400 hover:text-ink-700 underline">Use saved</button>
                          )}
                        </div>

                        {/* Map picker */}
                        <div onClick={() => setShowMap(true)}
                          className={`flex items-center gap-3 border-2 border-dashed rounded-xl px-3 py-2.5 cursor-pointer transition-all ${locationPinned ? "border-green-400 bg-green-50" : "border-ink-300 hover:border-brand-400 hover:bg-brand-50"}`}>
                          <span className="text-xl">{locationPinned ? "✅" : "📍"}</span>
                          <div className="flex-1 min-w-0">
                            {locationPinned ? (
                              <p className="text-xs font-semibold text-green-700">Location pinned on map</p>
                            ) : (
                              <p className="text-xs font-semibold text-ink-600">Pin location on map <span className="font-normal text-ink-400">(recommended)</span></p>
                            )}
                          </div>
                          <span className="text-xs font-semibold text-brand-600 bg-white border border-brand-200 px-2.5 py-1 rounded-lg whitespace-nowrap">
                            {locationPinned ? "Edit Map" : "Open Map"}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-xs font-semibold text-ink-600 mb-1">Contact Name</label>
                            <input value={newAddress.name} onChange={e => setNewAddress(p => ({...p, name: e.target.value}))}
                              placeholder="Recipient name" className="input-base text-sm" />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-ink-600 mb-1">Phone</label>
                            <input value={newAddress.phone} onChange={e => setNewAddress(p => ({...p, phone: e.target.value}))}
                              placeholder="10-digit number" className="input-base text-sm" />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-ink-600 mb-1">Building / Street</label>
                          <input value={newAddress.street} onChange={e => setNewAddress(p => ({...p, street: e.target.value}))}
                            placeholder="Shop no., building, street" className="input-base text-sm" />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-xs font-semibold text-ink-600 mb-1">Area</label>
                            <input value={newAddress.area} onChange={e => setNewAddress(p => ({...p, area: e.target.value}))}
                              placeholder="Area / locality" className="input-base text-sm" />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-ink-600 mb-1">City *</label>
                            <input value={newAddress.city} onChange={e => setNewAddress(p => ({...p, city: e.target.value}))}
                              placeholder="City" className="input-base text-sm" required />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-xs font-semibold text-ink-600 mb-1">State</label>
                            <input value={newAddress.state} onChange={e => setNewAddress(p => ({...p, state: e.target.value}))}
                              placeholder="State" className="input-base text-sm" />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-ink-600 mb-1">Pincode *</label>
                            <input value={newAddress.pincode} onChange={e => setNewAddress(p => ({...p, pincode: e.target.value}))}
                              placeholder="6 digits" maxLength={6} className="input-base text-sm" required />
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Total */}
              {total > 0 && (
                <div className="p-3.5 bg-green-50 border border-green-200 rounded-xl text-center">
                  <p className="text-xs text-green-600 font-medium">Deal Total</p>
                  <p className="text-2xl font-bold text-green-700">₹{total.toLocaleString()}</p>
                  <p className="text-xs text-green-500">{form.proposedQty} units × ₹{form.proposedPrice}/unit</p>
                </div>
              )}

              <div className="flex gap-3 pt-1">
                <button type="button" onClick={onClose}
                  className="flex-1 py-3 rounded-xl border-2 border-ink-200 text-sm font-semibold text-ink-600 hover:border-ink-400">
                  Cancel
                </button>
                <button type="submit" disabled={submitting}
                  className="flex-1 py-3 rounded-xl text-sm font-bold text-white disabled:opacity-50"
                  style={{ background: "linear-gradient(135deg,#f05f00,#ff7d07)" }}>
                  {submitting ? "Proposing..." : "Propose Deal 🤝"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

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
function ListingCard({ item, onContact, onMakeDeal, onGoToProduct, myVendorId }) {
  const days = item.daysUntilExpiry ?? daysUntilExpiry(item.expiryDate);
  const discount = item.discountPercent ||
    (item.originalPrice && item.originalPrice !== item.discountedPrice
      ? Math.round((1 - item.discountedPrice / item.originalPrice) * 100)
      : 0);
  const cond = CONDITIONS[item.condition] || CONDITIONS.NEW;
  const isNew = item.listingType === "NEW";
  const productId = item.productId?._id || item.productId;
  const isOwnListing = myVendorId && (
    item.vendorId?._id === myVendorId ||
    item.vendorId === myVendorId ||
    item.vendor?._id === myVendorId
  );

  const vendorAddr = item.vendor?.address;
  const addrStr = vendorAddr
    ? [vendorAddr.area, vendorAddr.city].filter(Boolean).join(", ")
    : null;

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
        {item.category?.name && (
          <div className="absolute bottom-3 right-3">
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/90 text-ink-600 border border-ink-200">
              {item.category.name}
            </span>
          </div>
        )}
      </div>

      <div className="p-4 flex flex-col flex-1">
        <h3 className="text-sm font-bold text-ink-900 leading-snug line-clamp-2 mb-2">{item.title}</h3>

        {/* Vendor + address */}
        <div className="mb-3">
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-md bg-brand-100 flex items-center justify-center text-[10px] font-bold text-brand-600">
              {(item.vendor?.shopName || "V")[0]}
            </div>
            <span className="text-xs text-ink-500 truncate font-medium">{item.vendor?.shopName || "Vendor"}</span>
          </div>
          {addrStr && (
            <p className="text-[10px] text-ink-400 mt-0.5 ml-6.5 flex items-center gap-1">
              <span>📍</span>{addrStr}
            </p>
          )}
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
              onClick={() => onGoToProduct(productId, item)}
              title="View product details"
              className="flex-shrink-0 px-3 py-2.5 rounded-xl text-xs font-semibold border-2 border-ink-200 text-ink-600 hover:border-ink-400 hover:bg-ink-50 transition-all">
              View
            </button>
          )}
          {isOwnListing ? (
            <span className="flex-1 py-2.5 rounded-xl text-xs font-bold text-center bg-ink-100 text-ink-400 border border-ink-200">
              Your Listing
            </span>
          ) : (
            <button
              onClick={() => onMakeDeal(item)}
              className="flex-1 py-2.5 rounded-xl text-xs font-bold transition-all group-hover:shadow-md active:scale-[0.97] text-white"
              style={{ background: "linear-gradient(135deg,#f05f00,#ff7d07)" }}>
              🤝 Make Deal
            </button>
          )}
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
  const [myVendorId, setMyVendorId] = useState(null);
  const [stats, setStats] = useState({ totalListings: 0, expiringCount: 0, avgDiscount: 0, surplusCount: 0 });
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [contactItem, setContactItem] = useState(null);
  const [dealItem, setDealItem] = useState(null);
  const [previewItem, setPreviewItem] = useState(null); // { productId, item }

  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("newest");
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");

  const loadListings = useCallback(async () => {
    setLoading(true);
    try {
      const params = { sort };
      if (activeTab !== "all") params.listingType = activeTab;
      if (search) params.search = search;
      if (selectedCategory) params.categoryId = selectedCategory;

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
  }, [activeTab, sort, selectedCategory]); // search is applied client-side for responsiveness

  useEffect(() => {
    loadListings();
  }, [loadListings]);

  // Load categories for filter bar
  useEffect(() => {
    vendorMarketplaceAPI.getCategories()
      .then((r) => setCategories(r.data?.data || []))
      .catch(() => {});
  }, []);

  // Load vendor products for the create listing form + get own vendorId to hide deal button
  useEffect(() => {
    vendorAPI.products()
      .then((r) => {
        const d = r.data?.data;
        setVendorProducts(Array.isArray(d) ? d : d?.products || []);
      })
      .catch(() => {});
    vendorAPI.getProfile()
      .then((r) => setMyVendorId(r.data?.data?._id || null))
      .catch(() => {});
  }, []);

  const handleGoToProduct = (productId, item) => {
    setPreviewItem({ productId, item });
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
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
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

        {/* Category filter */}
        {categories.length > 0 && (
          <div className="flex gap-2 mb-4 overflow-x-auto pb-1 scrollbar-hide">
            <button
              onClick={() => setSelectedCategory("")}
              className="flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
              style={{
                background: selectedCategory === "" ? "#131318" : "white",
                color: selectedCategory === "" ? "white" : "#70707e",
                border: `2px solid ${selectedCategory === "" ? "#131318" : "#e2e2e8"}`,
              }}>
              All Categories
            </button>
            {categories.map((cat) => (
              <button key={cat._id} onClick={() => setSelectedCategory(cat._id)}
                className="flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
                style={{
                  background: selectedCategory === cat._id ? "#f05f00" : "white",
                  color: selectedCategory === cat._id ? "white" : "#70707e",
                  border: `2px solid ${selectedCategory === cat._id ? "#f05f00" : "#e2e2e8"}`,
                }}>
                {cat.name}
              </button>
            ))}
          </div>
        )}

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
                      <ListingCard key={item._id} item={item} onContact={setContactItem} onMakeDeal={setDealItem} onGoToProduct={handleGoToProduct} myVendorId={myVendorId} />
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
                      <ListingCard key={item._id} item={item} onContact={setContactItem} onMakeDeal={setDealItem} onGoToProduct={handleGoToProduct} myVendorId={myVendorId} />
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

      {/* Make Deal Modal */}
      {dealItem && (
        <MakeDealModal
          item={dealItem}
          onClose={() => setDealItem(null)}
          onSuccess={() => { setDealItem(null); loadListings(); }}
        />
      )}

      {/* Product Preview Modal */}
      {previewItem && (
        <ProductPreviewModal
          productId={previewItem.productId}
          item={previewItem.item}
          onClose={() => setPreviewItem(null)}
          onMakeDeal={(item) => { setPreviewItem(null); setDealItem(item); }}
        />
      )}
    </div>
  );
}