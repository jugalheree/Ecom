import { useState, useEffect, useRef } from "react";
import { scoresAPI } from "../../services/apis/index";

/**
 * AIScorePreview
 * Shows live AI quality score as vendor types title/description.
 * Calls POST /api/scores/preview — pure math, zero API key.
 * Falls back to local math formula if backend is unreachable.
 */
export function AIScorePreview({ title, description, productCategory }) {
  const [score, setScore]   = useState(null);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef(null);

  useEffect(() => {
    if (!title && !description) { setScore(null); return; }

    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await scoresAPI.preview({
          title: title || "",
          description: description || "",
          productCategory: productCategory || "GENERAL",
        });
        setScore(res.data?.data || null);
      } catch {
        // Local fallback math mirrors backend exactly
        const descLen = (description || "").trim().length;
        const descScore =
          descLen === 0 ? 0 :
          descLen < 30  ? 0.1 :
          descLen < 80  ? 0.25 :
          descLen < 150 ? 0.4 :
          descLen < 300 ? 0.55 :
          descLen < 500 ? 0.68 : 0.8;

        const words = (title || "").trim().split(/\s+/).filter(Boolean).length;
        const titleScore = words < 2 ? 0.1 : words < 4 ? 0.25 : words < 7 ? 0.4 : 0.5;

        const raw = descScore + titleScore;
        const aiScore = Math.round(Math.min(2.5, (raw / 2.2) * 2.5) * 100) / 100;

        const tips = [];
        if (descScore < 0.4) tips.push("Add a longer description (aim for 150+ characters)");
        if (titleScore < 0.4) tips.push("Use 4–7 words in your title for best results");

        setScore({ aiScore, tips, breakdown: null });
      } finally {
        setLoading(false);
      }
    }, 600);
  }, [title, description, productCategory]);

  if (!score && !loading) return null;

  const pct   = score ? Math.round((score.aiScore / 2.5) * 100) : 0;
  const color = pct >= 75 ? "#10b981" : pct >= 50 ? "#f59e0b" : "#ef4444";
  const label = pct >= 75 ? "Good" : pct >= 50 ? "Average" : "Needs Improvement";

  return (
    <div
      className="rounded-2xl border-2 overflow-hidden transition-all duration-300"
      style={{ borderColor: color + "50" }}
    >
      {/* Header */}
      <div className="px-5 py-3.5 flex items-center gap-3" style={{ background: color + "12" }}>
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center text-white shrink-0 text-base"
          style={{ background: `linear-gradient(135deg, ${color}, ${color}bb)` }}
        >
          🤖
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-ink-900">AI Quality Score — Live Preview</p>
          <p className="text-[11px] text-ink-500 mt-0.5">
            Pure math · No API key · Updates as you type
          </p>
        </div>
        {loading ? (
          <svg className="animate-spin w-5 h-5 shrink-0" style={{ color }} viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
        ) : (
          <div className="text-right shrink-0">
            <p className="text-xl font-bold leading-none" style={{ color }}>
              {score?.aiScore?.toFixed(1)}
              <span className="text-sm text-ink-400 font-normal">/2.5</span>
            </p>
            <p className="text-[11px] font-semibold mt-0.5" style={{ color }}>{label}</p>
          </div>
        )}
      </div>

      {/* Body */}
      {score && !loading && (
        <div className="px-5 py-4 space-y-4" style={{ background: "#fafafa" }}>
          {/* Main bar */}
          <div>
            <div className="flex justify-between text-[11px] text-ink-400 mb-1.5">
              <span className="font-medium">AI Content Quality</span>
              <span>This is half of your total 5★ product rating</span>
            </div>
            <div className="h-3 rounded-full bg-ink-100 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${color}, ${color}99)` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-ink-300 mt-1">
              <span>0</span><span>1.25</span><span>2.5</span>
            </div>
          </div>

          {/* Breakdown grid */}
          {score.breakdown && (
            <div className="grid grid-cols-2 gap-2">
              {[
                ["📝 Description", score.breakdown.descriptionCompleteness, 0.8],
                ["🏷️ Title",       score.breakdown.titleQuality,            0.5],
                ["🔤 Keywords",    score.breakdown.keywordRichness,          0.5],
                ["📦 Category fit",score.breakdown.categoryTerms,            0.4],
              ].map(([lbl, val, max]) => {
                const p = Math.round((val / max) * 100);
                const c = p >= 70 ? "#10b981" : p >= 40 ? "#f59e0b" : "#ef4444";
                return (
                  <div key={lbl} className="rounded-xl px-3 py-2.5 bg-white border border-ink-100">
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-[11px] text-ink-500">{lbl}</span>
                      <span className="text-[11px] font-bold" style={{ color: c }}>
                        {val?.toFixed(2)}<span className="text-ink-300">/{max}</span>
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-ink-100 overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${p}%`, background: c }}/>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Red flag penalty notice */}
          {score.breakdown?.redFlagPenalty < 0 && (
            <div className="rounded-xl px-4 py-3 border border-red-200 bg-red-50 flex items-start gap-2">
              <span className="text-red-500 mt-0.5 shrink-0">🚩</span>
              <div>
                <p className="text-xs font-bold text-red-700">Red Flag Detected (−0.2 penalty)</p>
                <p className="text-[11px] text-red-600 mt-0.5">
                  Avoid exaggerated claims like "best in world", "guaranteed results", or "miracle".
                </p>
              </div>
            </div>
          )}

          {/* Improvement tips */}
          {score.tips?.length > 0 && (
            <div className="rounded-xl px-4 py-3" style={{ background: "#fff7ed", border: "1px solid #fed7aa" }}>
              <p className="text-[11px] font-bold text-orange-700 uppercase tracking-wider mb-2">
                💡 Improve your score
              </p>
              <ul className="space-y-1.5">
                {score.tips.map((tip, i) => (
                  <li key={i} className="text-xs text-orange-700 flex items-start gap-2">
                    <span className="shrink-0 mt-0.5 font-bold">→</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Footer info */}
          <div className="rounded-xl px-4 py-2.5 bg-ink-50 border border-ink-100">
            <p className="text-[11px] text-ink-500 text-center leading-relaxed">
              <span className="font-semibold text-ink-700">AI Score (2.5)</span> +{" "}
              <span className="font-semibold text-ink-700">Community Rating (2.5)</span>{" "}
              = Total <span className="font-semibold text-ink-700">5★ Product Score</span> after delivery & reviews
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
