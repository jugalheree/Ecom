import { useEffect, useState } from "react";
import { ratingAPI, orderAPI } from "../../services/apis/index";
import { useToastStore } from "../../store/toastStore";

function Stars({ value, onChange, size = "md" }) {
  const [hover, setHover] = useState(0);
  const s = size === "lg" ? 28 : 18;
  return (
    <div className="flex gap-1">
      {[1,2,3,4,5].map(star => (
        <button key={star} type="button"
          onClick={() => onChange?.(star)}
          onMouseEnter={() => onChange && setHover(star)}
          onMouseLeave={() => onChange && setHover(0)}
          className={onChange ? "cursor-pointer" : "cursor-default"}>
          <svg width={s} height={s} viewBox="0 0 24 24"
            fill={star <= (hover || value) ? "#ff7d07" : "#d9d9de"} stroke="none">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
          </svg>
        </button>
      ))}
    </div>
  );
}

export default function RatingCenter() {
  const showToast = useToastStore(s => s.showToast);
  const [given, setGiven] = useState([]);
  const [received, setReceived] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("given");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ targetType: "PRODUCT", productId: "", vendorId: "", stars: 0, review: "" });
  const [submitting, setSubmitting] = useState(false);

  // For dropdown — list of delivered orders
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  useEffect(() => {
    ratingAPI.getMyRatings()
      .then(r => {
        setGiven(r.data?.data?.given || []);
        setReceived(r.data?.data?.received || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Load delivered orders when form opens
  useEffect(() => {
    if (!showForm) return;
    setOrdersLoading(true);
    orderAPI.getMyOrders({ limit: 50 })
      .then(r => {
        const all = r.data?.data?.orders || [];
        setOrders(all.filter(o => ["DELIVERED", "COMPLETED"].includes(o.orderStatus)));
      })
      .catch(() => {})
      .finally(() => setOrdersLoading(false));
  }, [showForm]);

  // When order is selected, auto-fill product or vendor id
  const handleOrderSelect = (e) => {
    const orderId = e.target.value;
    if (!orderId) { setForm(f => ({ ...f, productId: "", vendorId: "" })); return; }
    const order = orders.find(o => o._id === orderId);
    if (!order) return;
    if (form.targetType === "PRODUCT") {
      // pre-fill first product id
      const firstItem = order.items?.[0];
      const pid = firstItem?.productId?._id || firstItem?.productId || "";
      setForm(f => ({ ...f, productId: String(pid) }));
    } else if (form.targetType === "VENDOR") {
      const vid = order.items?.[0]?.vendorId || "";
      setForm(f => ({ ...f, vendorId: String(vid) }));
    }
  };

  const handleSubmit = async () => {
    if (!form.stars) { showToast({ message: "Please select a star rating", type: "error" }); return; }
    if (!form.review.trim()) { showToast({ message: "Please write a review", type: "error" }); return; }
    setSubmitting(true);
    try {
      const payload = { targetType: form.targetType, stars: form.stars, review: form.review };
      if (form.targetType === "PRODUCT" && form.productId) payload.productId = form.productId;
      if (form.targetType === "VENDOR" && form.vendorId) payload.vendorId = form.vendorId;
      const res = await ratingAPI.submit(payload);
      setGiven(prev => [res.data?.data, ...prev]);
      setForm({ targetType: "PRODUCT", productId: "", vendorId: "", stars: 0, review: "" });
      setShowForm(false);
      showToast({ message: "Review submitted!", type: "success" });
    } catch (err) {
      showToast({ message: err?.response?.data?.message || "Failed to submit review", type: "error" });
    } finally { setSubmitting(false); }
  };

  const renderList = (list) => {
    if (list.length === 0) return (
      <div className="card p-12 text-center">
        <div className="text-4xl mb-3">⭐</div>
        <p className="font-display font-bold text-ink-900">No {tab} ratings yet</p>
        <p className="text-ink-500 text-sm mt-1">
          {tab === "given" ? "After your orders are delivered, you can rate products and vendors here." : "Ratings others leave for you appear here."}
        </p>
      </div>
    );
    return (
      <div className="space-y-4">
        {list.map(r => (
          <div key={r._id} className="card p-5">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-sand-100 flex items-center justify-center text-xl flex-shrink-0">
                {r.targetType === "PRODUCT" ? "📦" : r.targetType === "VENDOR" ? "🏪" : "👤"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <Stars value={r.stars} size="sm" />
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-ink-100 text-ink-600">{r.targetType}</span>
                  <span className="text-xs text-ink-400 ml-auto">
                    {r.createdAt ? new Date(r.createdAt).toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" }) : ""}
                  </span>
                </div>
                {r.review && <p className="text-sm text-ink-600 mt-2 leading-relaxed">{r.review}</p>}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-sand-50 py-10">
      <div className="container-app max-w-3xl">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <p className="section-label">Account</p>
            <h1 className="text-3xl font-display font-bold text-ink-900 mt-1">Rating Center</h1>
            <p className="text-ink-500 text-sm mt-1">Manage your ratings and reviews</p>
          </div>
          <button onClick={() => setShowForm(v => !v)} className="btn-primary px-5 py-2.5 text-sm">
            {showForm ? "✕ Cancel" : "+ Write Review"}
          </button>
        </div>

        {/* New rating form */}
        {showForm && (
          <div className="card p-6 mb-6 border-2 border-brand-200 bg-brand-50">
            <h2 className="font-display font-bold text-ink-900 text-lg mb-5">Leave a Review</h2>
            <div className="space-y-4">
              {/* What to rate */}
              <div>
                <label className="block text-sm font-semibold text-ink-700 mb-1.5">What are you rating?</label>
                <select value={form.targetType} onChange={e => setForm(f => ({...f, targetType: e.target.value, productId: "", vendorId: ""}))} className="input-base">
                  <option value="PRODUCT">Product</option>
                  <option value="VENDOR">Vendor</option>
                </select>
              </div>

              {/* Order dropdown */}
              <div>
                <label className="block text-sm font-semibold text-ink-700 mb-1.5">
                  Select Delivered Order
                  <span className="text-ink-400 font-normal ml-1">(auto-fills ID below)</span>
                </label>
                {ordersLoading ? (
                  <div className="skeleton h-10 rounded-xl w-full" />
                ) : orders.length === 0 ? (
                  <p className="text-sm text-ink-400 italic p-3 bg-white rounded-xl border border-ink-200">
                    No delivered orders found. You can only review products/vendors from delivered orders.
                  </p>
                ) : (
                  <select onChange={handleOrderSelect} defaultValue="" className="input-base">
                    <option value="">— Pick an order —</option>
                    {orders.map(o => (
                      <option key={o._id} value={o._id}>
                        #{o.orderNumber || o._id?.slice(-8).toUpperCase()} · ₹{o.totalAmount?.toLocaleString()} · {new Date(o.createdAt).toLocaleDateString("en-IN", {day:"numeric", month:"short"})}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Product items dropdown if targetType is PRODUCT */}
              {form.targetType === "PRODUCT" && (
                <div>
                  <label className="block text-sm font-semibold text-ink-700 mb-1.5">Product ID</label>
                  <input value={form.productId} onChange={e => setForm(f => ({...f, productId: e.target.value}))}
                    placeholder="Auto-filled from order, or paste manually" className="input-base font-mono text-sm" />
                </div>
              )}
              {form.targetType === "VENDOR" && (
                <div>
                  <label className="block text-sm font-semibold text-ink-700 mb-1.5">Vendor ID</label>
                  <input value={form.vendorId} onChange={e => setForm(f => ({...f, vendorId: e.target.value}))}
                    placeholder="Auto-filled from order, or paste manually" className="input-base font-mono text-sm" />
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-ink-700 mb-2">Your Rating</label>
                <Stars value={form.stars} onChange={v => setForm(f => ({...f, stars: v}))} size="lg" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-ink-700 mb-1.5">Review</label>
                <textarea value={form.review} onChange={e => setForm(f => ({...f, review: e.target.value}))}
                  placeholder="Share your experience..." rows={3} className="input-base resize-none" />
              </div>
              <button onClick={handleSubmit} disabled={submitting || !form.stars || !form.review.trim()}
                className="btn-primary w-full py-3 text-sm disabled:opacity-50">
                {submitting ? "Submitting..." : "Submit Review"}
              </button>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 mb-5 bg-white border border-ink-100 rounded-xl p-1 w-fit">
          {[["given","Reviews I Gave"], ["received","Reviews I Received"]].map(([t, label]) => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${tab === t ? "bg-brand-600 text-white" : "text-ink-500 hover:text-ink-900"}`}>
              {label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="card p-5"><div className="skeleton h-16 rounded-xl"/></div>)}</div>
        ) : renderList(tab === "given" ? given : received)}
      </div>
    </div>
  );
}
