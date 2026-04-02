import { useEffect, useState } from "react";
import { useAuthStore } from "../../store/authStore";
import { ratingAPI, vendorAPI, scoresAPI } from "../../services/apis/index";

/* ---------- COMPONENTS ---------- */

function Stars({ value, size = 14 }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1,2,3,4,5].map(s => (
        <svg key={s} width={size} height={size} viewBox="0 0 24 24"
          fill={s <= Math.round(value) ? "#ff7d07" : "#d9d9de"}>
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
      <span className="text-xs text-ink-400 w-3">{label}</span>
      <div className="flex-1 h-2 rounded-full bg-ink-200">
        <div className="h-full bg-brand-500" style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-ink-400 w-5 text-right">{count}</span>
    </div>
  );
}

function VendorScoreCard({ vendorScore, vendorId, onScoreUpdate }) {
  const [loading, setLoading] = useState(false);

  const handleRefresh = async () => {
    if (!vendorId) return;
    setLoading(true);
    try {
      const res = await scoresAPI.recomputeVendor(vendorId);
      const newScore = res.data?.data?.score;
      if (newScore !== undefined) onScoreUpdate(newScore);
    } finally {
      setLoading(false);
    }
  };

  const score = vendorScore ?? 100;

  return (
    <div className="card p-6 mb-6">
      <div className="flex justify-between items-center">
        <p className="font-bold">Vendor Score: {score}/100</p>
        <button onClick={handleRefresh} disabled={loading}>
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>
    </div>
  );
}

/* ---------- MAIN ---------- */

export default function VendorRatings() {
  const user = useAuthStore(s => s.user);

  const [ratings, setRatings] = useState([]);
  const [stats, setStats] = useState({ avgRating: 0, totalRatings: 0 });
  const [vendorScore, setVendorScore] = useState(null);
  const [vendorId, setVendorId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    vendorAPI.getProfile()
      .then(r => {
        const data = r.data?.data;
        const vid = data?._id;
        setVendorId(vid);
        setVendorScore(data?.vendorScore ?? 100);

        if (vid) return ratingAPI.getVendorRatings(vid, { limit: 50 });
      })
      .then(r => {
        if (r) {
          setRatings(r.data?.data?.ratings || []);
          setStats(r.data?.data?.stats || {});
        }
      })
      .finally(() => setLoading(false));
  }, [user]);

  const breakdown = [5,4,3,2,1].map(star =>
    ratings.filter(r => r.stars === star).length
  );

  const totalRatings = ratings.length;

  const avgRating = totalRatings > 0
    ? (ratings.reduce((s,r) => s + r.stars, 0) / totalRatings)
    : stats.avgRating || 0;

  const avg = avgRating.toFixed(1);

  return (
    <div className="min-h-screen p-6">

      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <VendorScoreCard
            vendorScore={vendorScore}
            vendorId={vendorId}
            onScoreUpdate={setVendorScore}
          />

          <h1 className="text-2xl font-bold mb-4">Ratings</h1>

          <div className="mb-6">
            <h2 className="text-4xl">{avg}</h2>
            <Stars value={avgRating} />
            <p>{totalRatings} reviews</p>
          </div>

          {[5,4,3,2,1].map((star, i) => (
            <RatingBar
              key={star}
              label={star}
              count={breakdown[i]}
              total={totalRatings}
            />
          ))}

          <div className="mt-6 space-y-3">
            {ratings.map(r => (
              <div key={r._id} className="card p-4">
                <p className="font-semibold">{r.reviewerName}</p>
                <Stars value={r.stars} />
                <p>{r.review}</p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}