import { useEffect, useState } from "react";
import { vendorAPI } from "../../services/apis/index";
import { useWalletStore } from "../../store/walletStore";
import { useToastStore } from "../../store/toastStore";

const IFSC_RE = /^[A-Z]{4}0[A-Z0-9]{6}$/;

export default function VendorPayout() {
  const showToast = useToastStore((s) => s.showToast);
  const { balance, locked, available, fetchWallet } = useWalletStore();

  const [bank, setBank] = useState(null);
  const [history, setHistory] = useState([]);
  const [loadingBank, setLoadingBank] = useState(true);
  const [tab, setTab] = useState("payout"); // "payout" | "bank" | "history"

  const [bankForm, setBankForm] = useState({
    bankName: "", accountHolderName: "", accountNumber: "", ifscCode: "",
  });
  const [savingBank, setSavingBank] = useState(false);

  const [payoutAmount, setPayoutAmount] = useState("");
  const [requesting, setRequesting] = useState(false);

  // Load everything on mount
  useEffect(() => {
    fetchWallet();
    vendorAPI.getBankAccount()
      .then((r) => {
        const b = r.data?.data;
        setBank(b || null);
        if (b) setBankForm({ bankName: b.bankName || "", accountHolderName: b.accountHolderName || "", accountNumber: b.accountNumber || "", ifscCode: b.ifscCode || "" });
      })
      .catch(() => {})
      .finally(() => setLoadingBank(false));
    vendorAPI.getPayoutHistory()
      .then((r) => setHistory(r.data?.data || []))
      .catch(() => {});
  }, []);

  const handleSaveBank = async (e) => {
    e.preventDefault();
    if (!bankForm.bankName || !bankForm.accountHolderName || !bankForm.accountNumber || !bankForm.ifscCode) {
      showToast({ message: "All fields are required", type: "error" }); return;
    }
    if (!IFSC_RE.test(bankForm.ifscCode.toUpperCase())) {
      showToast({ message: "Invalid IFSC code (e.g. SBIN0001234)", type: "error" }); return;
    }
    setSavingBank(true);
    try {
      const res = await vendorAPI.saveBankAccount({ ...bankForm, ifscCode: bankForm.ifscCode.toUpperCase() });
      setBank(res.data?.data);
      showToast({ message: "Bank account saved!", type: "success" });
      setTab("payout");
    } catch (err) {
      showToast({ message: err?.response?.data?.message || "Failed to save bank account", type: "error" });
    } finally { setSavingBank(false); }
  };

  const handleRequestPayout = async (e) => {
    e.preventDefault();
    const amt = Number(payoutAmount);
    if (!amt || amt <= 0) { showToast({ message: "Enter a valid amount", type: "error" }); return; }
    if (amt > available) { showToast({ message: `Only ₹${available?.toLocaleString()} available`, type: "error" }); return; }
    if (!bank) { showToast({ message: "Please add a bank account first", type: "error" }); setTab("bank"); return; }
    setRequesting(true);
    try {
      await vendorAPI.requestPayout(amt);
      showToast({ message: "Payout requested! Processing in 2–3 business days.", type: "success" });
      setPayoutAmount("");
      fetchWallet();
      vendorAPI.getPayoutHistory().then((r) => setHistory(r.data?.data || [])).catch(() => {});
    } catch (err) {
      showToast({ message: err?.response?.data?.message || "Payout request failed", type: "error" });
    } finally { setRequesting(false); }
  };

  const TABS = [
    { key: "payout",  label: "Request Payout", icon: "💸" },
    { key: "bank",    label: "Bank Account",    icon: "🏦" },
    { key: "history", label: "History",         icon: "📋" },
  ];

  return (
    <div className="min-h-screen bg-sand-50 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <p className="section-label">Vendor</p>
          <h1 className="text-2xl font-display font-bold text-ink-900 mt-1">Payouts</h1>
          <p className="text-ink-400 text-sm mt-0.5">Withdraw your earnings to your bank account</p>
        </div>

        {/* Balance cards */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: "Total Balance",    value: balance    ?? 0, color: "bg-navy-600",  icon: "💳" },
            { label: "Locked (Escrow)",  value: locked     ?? 0, color: "bg-amber-500", icon: "🔒" },
            { label: "Available",        value: available  ?? 0, color: "bg-green-600", icon: "✅" },
          ].map((c) => (
            <div key={c.label} className={`${c.color} rounded-2xl p-4 text-white`}>
              <p className="text-xs font-semibold opacity-80 mb-1">{c.icon} {c.label}</p>
              <p className="text-xl font-bold">₹{(c.value).toLocaleString()}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-white border border-ink-200 rounded-2xl p-1.5 w-fit">
          {TABS.map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${tab === t.key ? "bg-ink-900 text-white shadow-sm" : "text-ink-500 hover:text-ink-800"}`}>
              <span>{t.icon}</span> {t.label}
            </button>
          ))}
        </div>

        {/* Request Payout tab */}
        {tab === "payout" && (
          <div className="card p-8">
            {!bank && !loadingBank && (
              <div className="mb-5 p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
                ⚠️ You haven't added a bank account yet.{" "}
                <button onClick={() => setTab("bank")} className="font-bold underline">Add one now</button>
              </div>
            )}
            {bank && (
              <div className="mb-5 p-4 bg-sand-50 border border-ink-200 rounded-xl flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-ink-400 mb-0.5">Paying to</p>
                  <p className="text-sm font-semibold text-ink-900">{bank.bankName} — ····{bank.accountNumber?.slice(-4)}</p>
                  <p className="text-xs text-ink-400">{bank.accountHolderName} · IFSC: {bank.ifscCode}</p>
                </div>
                <button onClick={() => setTab("bank")} className="text-xs text-brand-600 font-semibold hover:text-brand-800">Change</button>
              </div>
            )}
            <form onSubmit={handleRequestPayout} className="space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-ink-500 mb-2">
                  Amount (₹) — Available: ₹{(available ?? 0).toLocaleString()}
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-400 font-semibold text-sm">₹</span>
                  <input
                    type="number" min="1" max={available} value={payoutAmount}
                    onChange={(e) => setPayoutAmount(e.target.value)}
                    placeholder="Enter amount"
                    className="input-base pl-8"
                  />
                </div>
                <div className="flex gap-2 mt-2">
                  {[500, 1000, 5000].map((q) => (
                    <button key={q} type="button" onClick={() => setPayoutAmount(Math.min(q, available ?? 0).toString())}
                      className="text-xs px-3 py-1 rounded-lg bg-sand-100 hover:bg-sand-200 text-ink-600 font-semibold transition-colors">
                      ₹{q.toLocaleString()}
                    </button>
                  ))}
                  <button type="button" onClick={() => setPayoutAmount((available ?? 0).toString())}
                    className="text-xs px-3 py-1 rounded-lg bg-sand-100 hover:bg-sand-200 text-ink-600 font-semibold transition-colors">
                    Max
                  </button>
                </div>
              </div>
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-800 space-y-1">
                <p className="font-bold">📋 Payout Policy</p>
                <p>• Payouts are processed in 2–3 business days</p>
                <p>• Minimum payout: ₹100</p>
                <p>• Funds must be unlocked (not in escrow)</p>
              </div>
              <button type="submit" disabled={requesting || !bank || !payoutAmount || Number(payoutAmount) <= 0}
                className="w-full py-3.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-50 active:scale-[0.98]"
                style={{ background: "linear-gradient(135deg,#131318 0%,#3e3e48 100%)", boxShadow: "0 4px 20px rgba(19,19,24,0.2)" }}>
                {requesting ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Requesting...
                  </span>
                ) : `Request Payout${payoutAmount ? ` • ₹${Number(payoutAmount).toLocaleString()}` : ""}`}
              </button>
            </form>
          </div>
        )}

        {/* Bank Account tab */}
        {tab === "bank" && (
          <div className="card p-8">
            <h2 className="text-lg font-display font-bold text-ink-900 mb-6">
              {bank ? "Update Bank Account" : "Add Bank Account"}
            </h2>
            <form onSubmit={handleSaveBank} className="space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-ink-500 mb-2">Bank Name *</label>
                <input value={bankForm.bankName} onChange={(e) => setBankForm((f) => ({ ...f, bankName: e.target.value }))}
                  placeholder="e.g. State Bank of India" className="input-base" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-ink-500 mb-2">Account Holder Name *</label>
                <input value={bankForm.accountHolderName} onChange={(e) => setBankForm((f) => ({ ...f, accountHolderName: e.target.value }))}
                  placeholder="Full name as on bank account" className="input-base" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-ink-500 mb-2">Account Number *</label>
                <input value={bankForm.accountNumber} onChange={(e) => setBankForm((f) => ({ ...f, accountNumber: e.target.value }))}
                  placeholder="Enter account number" type="password" className="input-base" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-ink-500 mb-2">IFSC Code *</label>
                <input value={bankForm.ifscCode} onChange={(e) => setBankForm((f) => ({ ...f, ifscCode: e.target.value.toUpperCase() }))}
                  placeholder="e.g. SBIN0001234" className="input-base font-mono" maxLength={11} />
                <p className="text-xs text-ink-400 mt-1">11-character code found on your cheque book</p>
              </div>
              <button type="submit" disabled={savingBank}
                className="w-full py-3.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-50 active:scale-[0.98]"
                style={{ background: "linear-gradient(135deg,#131318 0%,#3e3e48 100%)", boxShadow: "0 4px 20px rgba(19,19,24,0.2)" }}>
                {savingBank ? "Saving..." : bank ? "Update Bank Account" : "Save Bank Account"}
              </button>
            </form>
          </div>
        )}

        {/* History tab */}
        {tab === "history" && (
          <div className="card overflow-hidden">
            <div className="px-6 py-4 border-b border-ink-100">
              <h2 className="font-display font-bold text-ink-900">Payout History</h2>
            </div>
            {history.length === 0 ? (
              <div className="p-12 text-center">
                <div className="text-5xl mb-3">📭</div>
                <p className="text-ink-500 text-sm">No payout requests yet.</p>
              </div>
            ) : (
              <div className="divide-y divide-ink-50">
                {history.map((tx) => (
                  <div key={tx._id} className="flex items-center justify-between px-6 py-4 hover:bg-sand-50 transition-colors">
                    <div>
                      <p className="text-sm font-semibold text-ink-900">₹{tx.amount?.toLocaleString()}</p>
                      <p className="text-xs text-ink-400 mt-0.5">{tx.description}</p>
                    </div>
                    <div className="text-right">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                        tx.status === "COMPLETED" ? "bg-green-50 text-green-700 border-green-200" :
                        tx.status === "FAILED"    ? "bg-red-50 text-red-600 border-red-200" :
                        "bg-amber-50 text-amber-700 border-amber-200"
                      }`}>{tx.status || "PENDING"}</span>
                      <p className="text-xs text-ink-400 mt-1">
                        {new Date(tx.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
