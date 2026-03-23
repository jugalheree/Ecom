import { useState } from "react";
import BackendMissing from "../../components/ui/BackendMissing";

const MOCK_VENDOR_RATINGS = [
  { id: 1, buyer: "Arjun Sharma", stars: 5, review: "Excellent product quality and very fast dispatch. Will definitely order again.", date: "2026-03-10", product: "Premium Basmati Rice 25kg", orderId: "ORD-89AB" },
  { id: 2, buyer: "Meena Patel",  stars: 4, review: "Good packaging. Product quality was as described. Slight delay in shipping.", date: "2026-03-05", product: "Organic Sunflower Oil 5L", orderId: "ORD-77CD" },
  { id: 3, buyer: "Rahul Singh",  stars: 5, review: "Best vendor on the platform. Proactive communication and premium quality.", date: "2026-02-28", product: "Cotton Yarn Grade A", orderId: "ORD-55EF" },
  { id: 4, buyer: "Priya Nair",   stars: 3, review: "Product was okay but not as described. Expected better GSM for the price.", date: "2026-02-20", product: "Cotton Yarn Grade A", orderId: "ORD-33GH" },
  { id: 5, buyer: "Vikram Joshi", stars: 5, review: "Superb service! Delivered ahead of schedule and quality exceeded expectations.", date: "2026-02-15", product: "Premium Basmati Rice 25kg", orderId: "ORD-11IJ" },
];

const MOCK_PRODUCT_RATINGS = [
  { product: "Premium Basmati Rice 25kg", avgRating: 4.8, totalRatings: 42, breakdown: [38, 2, 1, 1, 0] },
  { product: "Organic Sunflower Oil 5L",   avgRating: 4.2, totalRatings: 18, breakdown: [12, 4, 1, 1, 0] },
  { product: "Cotton Yarn Grade A",         avgRating: 3.9, totalRatings: 11, breakdown: [5, 3, 1, 1, 1] },
];

function StarDisplay({ value, size = 14 }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1,2,3,4,5].map(s => (
        <svg key={s} width={size} height={size} viewBox="0 0 24 24"
          fill={s <= Math.round(value) ? "#ff7d07" : "#d9d9de"} stroke="none">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      ))}
    </div>
  );
}

function RatingBar({ count, total, label }) {
  const pct = total ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-ink-400 w-3 shrink-0">{label}</span>
      <svg width="10" height="10" viewBox="0 0 24 24" fill="#ff7d07" stroke="none">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
      </svg>
      <div className="flex-1 h-2 rounded-full bg-ink-100 overflow-hidden">
        <div className="h-full rounded-full bg-brand-500 transition-all duration-700" style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-ink-400 w-5 text-right">{count}</span>
    </div>
  );
}

export default function VendorRatings() {
  const [tab, setTab] = useState("overview");
  const totalRatings = MOCK_VENDOR_RATINGS.length;
  const avgRating = (MOCK_VENDOR_RATINGS.reduce((s, r) => s + r.stars, 0) / totalRatings).toFixed(1);
  const breakdown = [5,4,3,2,1].map(s => MOCK_VENDOR_RATINGS.filter(r => r.stars === s).length);

  return (
    <div className="min-h-screen bg-sand-50 p-6">
      <div className="mb-6">
        <p className="section-label">Vendor</p>
        <h1 className="text-2xl font-display font-bold text-ink-900 mt-1">Ratings & Reviews</h1>
        <p className="text-ink-400 text-sm mt-0.5">Your store reputation and product feedback</p>
      </div>

      <BackendMissing
        method="GET"
        endpoint="/api/vendor/ratings"
        todo="Need GET /api/vendor/ratings (vendor store ratings from buyers) and GET /api/vendor/products/:id/ratings (per-product ratings). Showing mock data until backend is ready."
      />

      {/* Score Hero */}
      <div className="card p-6 mb-6" style={{ background: "linear-gradient(135deg,#131318,#2a2a35)" }}>
        <div className="flex items-center gap-8">
          <div className="text-center">
            <p className="text-6xl font-bold text-white font-display">{avgRating}</p>
            <StarDisplay value={Number(avgRating)} size={18} />
            <p className="text-xs text-ink-400 mt-2">{totalRatings} reviews</p>
          </div>
          <div className="flex-1 space-y-2">
            {[5,4,3,2,1].map((star, i) => (
              <RatingBar key={star} label={star} count={breakdown[i]} total={totalRatings} />
            ))}
          </div>
          <div className="text-right hidden md:block">
            <p className="text-xs text-ink-400 mb-1">Store Tier</p>
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl" style={{ background: "rgba(255,125,7,0.15)", border: "1px solid rgba(255,125,7,0.3)" }}>
              <span className="text-lg">🥇</span>
              <span className="text-sm font-bold text-brand-400">Gold Seller</span>
            </div>
            <p className="text-xs text-ink-500 mt-2 max-w-[120px]">Top 15% of vendors this month</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-5 bg-white border border-ink-100 rounded-xl p-1 w-fit">
        {[["overview", "Overview"], ["reviews", "Customer Reviews"], ["products", "Product Ratings"]].map(([t, label]) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold capitalize transition-all ${tab === t ? "bg-ink-900 text-white" : "text-ink-500 hover:text-ink-900"}`}>
            {label}
          </button>
        ))}
      </div>

      {/* Overview */}
      {tab === "overview" && (
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { label: "Avg Rating", value: avgRating, sub: "across all orders", icon: "⭐" },
            { label: "5-Star Reviews", value: breakdown[0], sub: `${Math.round((breakdown[0]/totalRatings)*100)}% of total`, icon: "🏆" },
            { label: "Response Rate", value: "98%", sub: "messages replied in 24h", icon: "💬" },
          ].map((s, i) => (
            <div key={i} className="card p-5">
              <span className="text-2xl">{s.icon}</span>
              <p className="text-3xl font-bold text-ink-900 mt-3 font-display">{s.value}</p>
              <p className="text-xs font-semibold text-ink-500 mt-0.5 uppercase tracking-wide">{s.label}</p>
              <p className="text-xs text-ink-400 mt-1">{s.sub}</p>
            </div>
          ))}
        </div>
      )}

      {/* Customer Reviews */}
      {tab === "reviews" && (
        <div className="space-y-4">
          {MOCK_VENDOR_RATINGS.map(r => (
            <div key={r.id} className="card p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1">
                  <div className="w-10 h-10 rounded-xl bg-brand-100 flex items-center justify-center font-bold text-brand-700 text-sm flex-shrink-0">
                    {r.buyer[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-ink-900 text-sm">{r.buyer}</p>
                      <StarDisplay value={r.stars} size={12} />
                    </div>
                    <p className="text-xs text-ink-400 mt-0.5">for <span className="text-ink-600 font-medium">{r.product}</span> · {r.orderId}</p>
                    <p className="text-sm text-ink-700 mt-2 leading-relaxed">{r.review}</p>
                  </div>
                </div>
                <p className="text-xs text-ink-400 flex-shrink-0">{new Date(r.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Product Ratings */}
      {tab === "products" && (
        <div className="space-y-4">
          {MOCK_PRODUCT_RATINGS.map((p, idx) => (
            <div key={idx} className="card p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-sand-100 flex items-center justify-center text-xl">📦</div>
                  <div>
                    <p className="font-semibold text-ink-900">{p.product}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <StarDisplay value={p.avgRating} size={13} />
                      <span className="text-xs text-ink-500">{p.avgRating} · {p.totalRatings} ratings</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-1 w-36 hidden sm:block">
                  {[5,4,3,2,1].map((star, i) => (
                    <RatingBar key={star} label={star} count={p.breakdown[5-star]} total={p.totalRatings} />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}