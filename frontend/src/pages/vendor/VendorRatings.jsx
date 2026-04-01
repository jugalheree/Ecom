import { useEffect, useState } from "react";
import { useAuthStore } from "../../store/authStore";
import { ratingAPI, vendorAPI } from "../../services/apis/index";

function Stars({ value, size = 14 }) {
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

function RatingBar({ label, count, total }) {
  const pct = total ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-ink-400 w-3 flex-shrink-0">{label}</span>
      <svg width="10" height="10" viewBox="0 0 24 24" fill="#ff7d07" stroke="none">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
      </svg>
      <div className="flex-1 h-2 rounded-full bg-ink-200 overflow-hidden">
        <div className="h-full rounded-full bg-brand-500 transition-all duration-700" style={{ width: `${pct}%` }}/>
      </div>
      <span className="text-xs text-ink-400 w-5 text-right">{count}</span>
    </div>
  );
}

export default function VendorRatings() {
  const user = useAuthStore(s => s.user);
  const [ratings, setRatings] = useState([]);
  const [stats, setStats] = useState({ avgRating: 0, totalRatings: 0, fivestar: 0 });
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("reviews");
  const [vendorId, setVendorId] = useState(null);

  useEffect(() => {
    vendorAPI.getProfile()
      .then(r => {
        const vid = r.data?.data?._id;
        setVendorId(vid);
        if (vid) {
          return ratingAPI.getVendorRatings(vid, { limit: 50 });
        }
      })
      .then(r => {
        if (r) {
          setRatings(r.data?.data?.ratings || []);
          setStats(r.data?.data?.stats || { avgRating: 0, totalRatings: 0 });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  const breakdown = [5,4,3,2,1].map(star => ratings.filter(r => r.stars === star).length);
  const totalRatings = ratings.length;
  const avgRating = totalRatings > 0
    ? (ratings.reduce((s,r) => s + r.stars, 0) / totalRatings).toFixed(1)
    : (stats.avgRating || 0).toFixed(1);

  const tier = avgRating >= 4.5 ? { label: "Gold Seller", icon: "🥇", color: "text-amber-500" }
    : avgRating >= 4.0 ? { label: "Silver Seller", icon: "🥈", color: "text-ink-500" }
    : avgRating >= 3.0 ? { label: "Bronze Seller", icon: "🥉", color: "text-amber-700" }
    : { label: "New Seller", icon: "🆕", color: "text-ink-400" };

  return (
    <div className="min-h-screen bg-sand-50 p-6">
      <div className="mb-6">
        <p className="section-label">Vendor</p>
        <h1 className="text-2xl font-display font-bold text-ink-900 mt-1">Ratings & Reviews</h1>
        <p className="text-ink-400 text-sm mt-0.5">Your store reputation and customer feedback</p>
      </div>

      {loading ? (
        <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="card p-6"><div className="skeleton h-16 rounded-xl"/></div>)}</div>
      ) : (
        <>
          {/* Score Hero */}
          <div className="card p-6 mb-6" style={{ background: "linear-gradient(135deg,#131318,#2a2a35)" }}>
            <div className="flex items-center gap-8 flex-wrap">
              <div className="text-center">
                <p className="text-6xl font-bold text-white font-display">{avgRating}</p>
                <Stars value={Number(avgRating)} size={18} />
                <p className="text-xs text-ink-400 mt-2">{totalRatings || stats.totalRatings || 0} reviews</p>
              </div>
              <div className="flex-1 space-y-2 min-w-[180px]">
                {[5,4,3,2,1].map((star, i) => (
                  <RatingBar key={star} label={star} count={breakdown[i]} total={totalRatings || 1} />
                ))}
              </div>
              <div className="text-right hidden sm:block">
                <p className="text-xs text-ink-400 mb-1">Store Tier</p>
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 border border-white/20">
                  <span className="text-lg">{tier.icon}</span>
                  <span className={`text-sm font-bold ${tier.color}`}>{tier.label}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="grid sm:grid-cols-3 gap-4 mb-6">
            {[
              { label: "Avg Rating",    value: avgRating,                                    icon: "⭐" },
              { label: "5-Star Reviews",value: breakdown[0],                                 icon: "🏆" },
              { label: "Total Reviews", value: totalRatings || stats.totalRatings || 0,      icon: "💬" },
            ].map((s, i) => (
              <div key={i} className="card p-5 flex items-center gap-3">
                <span className="text-2xl">{s.icon}</span>
                <div>
                  <p className="text-2xl font-display font-bold text-ink-900">{s.value}</p>
                  <p className="text-xs text-ink-400 font-medium">{s.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Reviews */}
          {totalRatings === 0 ? (
            <div className="card p-16 text-center">
              <div className="text-5xl mb-4">⭐</div>
              <h3 className="font-display font-bold text-ink-900 text-lg">No reviews yet</h3>
              <p className="text-ink-500 text-sm mt-2">Customer reviews will appear here after your first delivered order.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {ratings.map((r) => (
                <div key={r._id} className="card p-5">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-sm flex-shrink-0">
                      {r.reviewerName?.[0]?.toUpperCase() || "?"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-ink-900 text-sm">{r.reviewerName || "Customer"}</p>
                        <Stars value={r.stars} size={12} />
                        <span className="text-[10px] text-ink-400 ml-auto">
                          {r.createdAt ? new Date(r.createdAt).toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" }) : ""}
                        </span>
                      </div>
                      {r.review && <p className="text-sm text-ink-600 mt-2 leading-relaxed">{r.review}</p>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
