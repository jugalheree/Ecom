import { useEffect, useState } from "react";
import { useToastStore } from "../store/toastStore";
import { referralAPI } from "../services/apis/index";

export default function Referral() {
  const showToast = useToastStore((s) => s.showToast);
  const [data, setData]       = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applyCode, setApplyCode] = useState("");
  const [applying, setApplying]   = useState(false);
  const [copied, setCopied]       = useState(false);

  useEffect(() => {
    Promise.all([referralAPI.getMyCode(), referralAPI.getHistory()])
      .then(([codeRes, histRes]) => {
        setData(codeRes.data?.data);
        setHistory(histRes.data?.data || []);
      })
      .catch(() => showToast({ message: "Failed to load referral data", type: "error" }))
      .finally(() => setLoading(false));
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(data?.referralCode || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApply = async () => {
    if (!applyCode.trim()) return;
    setApplying(true);
    try {
      const res = await referralAPI.applyCode(applyCode.trim());
      showToast({ message: res.data?.data?.message || "Referral applied!", type: "success" });
      setApplyCode("");
      // Refresh stats
      const codeRes = await referralAPI.getMyCode();
      setData(codeRes.data?.data);
    } catch (err) {
      showToast({ message: err?.response?.data?.message || "Invalid referral code", type: "error" });
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-sand-50 py-10">
        <div className="container-app max-w-2xl space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card p-6"><div className="skeleton h-16 rounded-xl" /></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sand-50 py-10">
      <div className="container-app max-w-2xl space-y-6">
        {/* Header */}
        <div>
          <p className="section-label">Rewards</p>
          <h1 className="text-3xl font-display font-bold text-ink-900 mt-1">Refer & Earn</h1>
          <p className="text-ink-500 text-sm mt-1">
            Share your code and earn ₹{data?.referrerBonus} for every friend who joins.
            They get ₹{data?.refereeBonus} too!
          </p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Rewarded Referrals", value: data?.stats?.totalRewarded ?? 0, icon: "👥" },
            { label: "Pending",            value: data?.stats?.pendingReferrals ?? 0, icon: "⏳" },
            { label: "Total Earned",       value: `₹${(data?.stats?.totalEarned ?? 0).toLocaleString()}`, icon: "💰" },
          ].map((s, i) => (
            <div key={i} className="card p-4 text-center">
              <div className="text-2xl mb-1">{s.icon}</div>
              <div className="text-xl font-bold text-ink-900">{s.value}</div>
              <div className="text-xs text-ink-500 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Your referral code */}
        <div className="card p-6">
          <h2 className="text-base font-semibold text-ink-800 mb-3">Your Referral Code</h2>
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-sand-100 border-2 border-dashed border-brand-300 rounded-xl px-5 py-3 text-center">
              <span className="text-2xl font-mono font-bold text-brand-700 tracking-widest">
                {data?.referralCode || "—"}
              </span>
            </div>
            <button
              onClick={handleCopy}
              className="btn-primary px-5 py-3 text-sm whitespace-nowrap"
            >
              {copied ? "✓ Copied!" : "Copy Code"}
            </button>
          </div>
          <p className="text-xs text-ink-400 mt-3 text-center">
            Share this code with friends. When they register and apply it, both of you earn wallet credits!
          </p>
        </div>

        {/* Apply a referral code */}
        <div className="card p-6">
          <h2 className="text-base font-semibold text-ink-800 mb-1">Have a Referral Code?</h2>
          <p className="text-xs text-ink-500 mb-4">
            Enter a friend's code to get ₹{data?.refereeBonus} in your wallet. Can only be applied once.
          </p>
          <div className="flex gap-3">
            <input
              type="text"
              value={applyCode}
              onChange={(e) => setApplyCode(e.target.value.toUpperCase())}
              placeholder="e.g. TSABCD1234"
              className="input-base flex-1 font-mono tracking-widest uppercase"
              maxLength={12}
            />
            <button
              onClick={handleApply}
              disabled={applying || !applyCode.trim()}
              className="btn-primary px-5 text-sm"
            >
              {applying ? "Applying…" : "Apply"}
            </button>
          </div>
        </div>

        {/* Referral history */}
        {history.length > 0 && (
          <div className="card p-6">
            <h2 className="text-base font-semibold text-ink-800 mb-4">Referral History</h2>
            <div className="space-y-3">
              {history.map((r) => (
                <div key={r._id} className="flex items-center justify-between py-2 border-b border-sand-100 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-ink-800">
                      {r.referredUserId?.name || "Anonymous"}
                    </p>
                    <p className="text-xs text-ink-400">
                      {new Date(r.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  </div>
                  <span className={`badge text-xs font-semibold ${
                    r.status === "REWARDED" ? "badge-success" :
                    r.status === "PENDING"  ? "badge-warning" : "badge-error"
                  }`}>
                    {r.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* How it works */}
        <div className="card p-6 bg-brand-50 border-brand-100">
          <h2 className="text-base font-semibold text-ink-800 mb-4">How It Works</h2>
          <div className="space-y-3">
            {[
              { step: "1", text: "Copy your unique referral code above" },
              { step: "2", text: "Share it with friends via WhatsApp, email, or socials" },
              { step: "3", text: `Friend registers on TradeSphere and applies your code` },
              { step: "4", text: `You earn ₹${data?.referrerBonus} · They earn ₹${data?.refereeBonus} — instantly in your wallets!` },
            ].map((s) => (
              <div key={s.step} className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-brand-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                  {s.step}
                </div>
                <p className="text-sm text-ink-700">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
