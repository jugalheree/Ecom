/**
 * ProductScoreBadge — shows total 5★ score (aiScore + ratingScore)
 * Used in: ProductCard, ProductDetail, VendorProducts, AdminProducts
 *
 * Props:
 *   aiScore     {number}  0–2.5  (AI quality half)
 *   ratingScore {number}  0–2.5  (community reviews half)
 *   size        "sm"|"md"|"lg"
 *   showBreakdown {bool}  show split bars
 */
export default function ProductScoreBadge({
  aiScore = 0,
  ratingScore = 0,
  reviewCount = 0,
  size = "sm",
  showBreakdown = false,
}) {
  const total = Math.min(5, aiScore + ratingScore);
  const totalPct = (total / 5) * 100;

  const color =
    total >= 4   ? "#10b981" :
    total >= 3   ? "#f59e0b" :
    total >= 2   ? "#ef4444" :
    "#8e8e9a";

  const starSize = size === "lg" ? 18 : size === "md" ? 14 : 11;
  const textSize = size === "lg" ? "text-sm" : size === "md" ? "text-xs" : "text-[11px]";

  if (!showBreakdown) {
    // Compact inline badge
    return (
      <div className="flex items-center gap-1">
        {/* Stars */}
        <div className="flex">
          {[1, 2, 3, 4, 5].map((s) => {
            const filled = s <= Math.floor(total);
            const half   = !filled && s === Math.ceil(total) && total % 1 >= 0.3;
            return (
              <svg key={s} width={starSize} height={starSize} viewBox="0 0 24 24">
                <defs>
                  <linearGradient id={`half-${s}`} x1="0" x2="1" y1="0" y2="0">
                    <stop offset="50%" stopColor="#ff7d07"/>
                    <stop offset="50%" stopColor="#d9d9de"/>
                  </linearGradient>
                </defs>
                <polygon
                  points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
                  fill={filled ? "#ff7d07" : half ? `url(#half-${s})` : "#d9d9de"}
                  stroke="none"
                />
              </svg>
            );
          })}
        </div>
        <span className={`${textSize} font-bold`} style={{ color }}>
          {total.toFixed(1)}
        </span>
        {reviewCount > 0 && (
          <span className={`${textSize} text-ink-400`}>({reviewCount})</span>
        )}
        {/* Mini AI badge */}
        {aiScore > 0 && (
          <span
            className="text-[9px] font-bold px-1 py-0.5 rounded"
            style={{ background: "#f0fdf4", color: "#16a34a", border: "1px solid #bbf7d0" }}
            title={`AI Quality Score: ${aiScore.toFixed(1)}/2.5`}
          >
            🤖 {aiScore.toFixed(1)}
          </span>
        )}
      </div>
    );
  }

  // Full breakdown card
  return (
    <div className="rounded-2xl border-2 border-ink-200 overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 flex items-center gap-4" style={{ background: "linear-gradient(135deg,#131318,#2a2a35)" }}>
        <div className="text-center">
          <p className="text-4xl font-bold text-white font-display">{total.toFixed(1)}</p>
          <div className="flex justify-center mt-1">
            {[1,2,3,4,5].map(s => (
              <svg key={s} width="14" height="14" viewBox="0 0 24 24">
                <polygon
                  points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
                  fill={s <= Math.round(total) ? "#ff7d07" : "#444"}
                  stroke="none"
                />
              </svg>
            ))}
          </div>
          <p className="text-[11px] text-ink-400 mt-1">out of 5</p>
        </div>
        <div className="flex-1 space-y-3">
          {/* AI Score bar */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-ink-300 font-medium">🤖 AI Quality</span>
              <span className="font-bold" style={{ color: aiScore >= 1.5 ? "#10b981" : aiScore >= 1 ? "#f59e0b" : "#ef4444" }}>
                {aiScore.toFixed(1)}/2.5
              </span>
            </div>
            <div className="h-2 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${(aiScore / 2.5) * 100}%`,
                  background: "linear-gradient(90deg, #6366f1, #8b5cf6)",
                }}
              />
            </div>
          </div>
          {/* Community bar */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-ink-300 font-medium">⭐ Community</span>
              <span className="font-bold" style={{ color: ratingScore >= 1.5 ? "#10b981" : ratingScore >= 1 ? "#f59e0b" : "#ef4444" }}>
                {ratingScore.toFixed(1)}/2.5
              </span>
            </div>
            <div className="h-2 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${(ratingScore / 2.5) * 100}%`,
                  background: "linear-gradient(90deg, #f59e0b, #ff7d07)",
                }}
              />
            </div>
          </div>
        </div>
      </div>
      {/* Footer */}
      <div className="px-5 py-3 bg-ink-50 flex items-center justify-between">
        <p className="text-xs text-ink-500">
          Based on {reviewCount} review{reviewCount !== 1 ? "s" : ""} + AI content analysis
        </p>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-purple-500" />
          <span className="text-[11px] text-ink-400">AI</span>
          <span className="w-2 h-2 rounded-full bg-amber-500 ml-2" />
          <span className="text-[11px] text-ink-400">Community</span>
        </div>
      </div>
    </div>
  );
}
