import { useState } from "react";
import BackendMissing from "../../components/ui/BackendMissing";

const mockRatings = [
  { id: 1, target: "Wireless Headphones Pro", type: "Product", stars: 5, review: "Excellent quality and fast delivery.", date: "2026-01-20", direction: "given" },
  { id: 2, target: "Rahul Mehta", type: "Buyer", stars: 4, review: "Smooth transaction and quick response.", date: "2026-01-18", direction: "received" },
  { id: 3, target: "TechVendor Store", type: "Vendor", stars: 5, review: "Great packaging and prompt shipping.", date: "2026-01-12", direction: "given" },
];

function StarRating({ value, onChange, size = "md" }) {
  const [hover, setHover] = useState(0);
  const s = size === "lg" ? 24 : 18;
  return (
    <div className="flex gap-1">
      {[1,2,3,4,5].map((star) => (
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
  const [ratings, setRatings] = useState(mockRatings);
  const [tab, setTab] = useState("given");
  const [form, setForm] = useState({ target: "", type: "Product", stars: 0, review: "" });
  const [showForm, setShowForm] = useState(false);

  const submit = () => {
    if (!form.target || !form.review || form.stars === 0) return;
    setRatings([{ id: Date.now(), ...form, date: new Date().toISOString().split("T")[0], direction: "given" }, ...ratings]);
    setForm({ target: "", type: "Product", stars: 0, review: "" });
    setShowForm(false);
  };

  const filtered = ratings.filter((r) => r.direction === tab);
  const avgStars = ratings.length ? (ratings.reduce((s, r) => s + r.stars, 0) / ratings.length).toFixed(1) : "0.0";

  return (
    <div className="min-h-screen bg-sand-50 py-10">
      <div className="container-app max-w-3xl">
        <div className="flex items-start justify-between mb-8 gap-4">
          <div>
            <p className="section-label">Account</p>
            <h1 className="text-3xl font-display font-bold text-ink-900 mt-1">Rating Center</h1>
            <p className="text-ink-500 text-sm mt-1">Manage your reviews and ratings</p>
          </div>
          <button onClick={() => setShowForm(!showForm)} className="btn-primary px-5 py-2.5 text-sm flex-shrink-0">
            {showForm ? "Cancel" : "+ Leave a Review"}
          </button>
        </div>

        <BackendMissing
          method="GET/POST"
          endpoint="/api/ratings"
          todo="Need GET /api/ratings (list user ratings) and POST /api/ratings (submit a product/buyer/vendor rating)"
        />

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="card p-5 text-center">
            <p className="text-2xl font-bold text-ink-900">{ratings.length}</p>
            <p className="text-xs text-ink-400 mt-0.5">Total Ratings</p>
          </div>
          <div className="card p-5 text-center">
            <div className="flex justify-center mb-1"><StarRating value={Math.round(Number(avgStars))} size="sm" /></div>
            <p className="text-xs text-ink-400">{avgStars} avg</p>
          </div>
          <div className="card p-5 text-center">
            <p className="text-2xl font-bold text-ink-900">{ratings.filter(r => r.direction === "received").length}</p>
            <p className="text-xs text-ink-400 mt-0.5">Received</p>
          </div>
        </div>

        {/* New rating form */}
        {showForm && (
          <div className="card p-6 mb-6 border-2 border-brand-200 bg-brand-50 animate-fade-up">
            <h2 className="font-display font-bold text-ink-900 text-lg mb-5">Leave a Review</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-ink-700 mb-1.5">Who/What are you rating?</label>
                <input value={form.target} onChange={(e) => setForm({...form, target: e.target.value})}
                  placeholder="Product name, vendor, or buyer name" className="input-base" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-ink-700 mb-1.5">Category</label>
                <select value={form.type} onChange={(e) => setForm({...form, type: e.target.value})} className="input-base">
                  <option value="Product">Product</option>
                  <option value="Vendor">Vendor</option>
                  <option value="Buyer">Buyer</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-ink-700 mb-2">Your Rating</label>
                <StarRating value={form.stars} onChange={(v) => setForm({...form, stars: v})} size="lg" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-ink-700 mb-1.5">Review</label>
                <textarea value={form.review} onChange={(e) => setForm({...form, review: e.target.value})}
                  placeholder="Share your experience..." rows={3} className="input-base resize-none" />
              </div>
              <button onClick={submit} disabled={!form.target || !form.review || form.stars === 0}
                className="btn-primary w-full py-3 text-sm">Submit Review</button>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 mb-5 bg-white border border-ink-100 rounded-xl p-1 w-fit">
          {["given", "received"].map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold capitalize transition-all ${tab === t ? "bg-brand-600 text-white" : "text-ink-500 hover:text-ink-900"}`}>
              {t === "given" ? "Given by Me" : "Received"}
            </button>
          ))}
        </div>

        {/* Ratings list */}
        {filtered.length === 0 ? (
          <div className="card p-12 text-center">
            <div className="text-4xl mb-3">⭐</div>
            <p className="font-display font-bold text-ink-900">No {tab} ratings yet</p>
            <p className="text-ink-500 text-sm mt-1">
              {tab === "given" ? "Reviews you leave will appear here." : "Reviews others leave for you will appear here."}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((r) => (
              <div key={r.id} className="card p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-sand-100 flex items-center justify-center text-xl flex-shrink-0">
                      {r.type === "Product" ? "📦" : r.type === "Vendor" ? "🏪" : "👤"}
                    </div>
                    <div>
                      <p className="font-semibold text-ink-900 text-sm">{r.target}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <StarRating value={r.stars} />
                        <span className="text-[10px] text-ink-400">{r.type}</span>
                      </div>
                      <p className="text-sm text-ink-600 mt-2 leading-relaxed">{r.review}</p>
                    </div>
                  </div>
                  <p className="text-xs text-ink-400 flex-shrink-0">{new Date(r.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
