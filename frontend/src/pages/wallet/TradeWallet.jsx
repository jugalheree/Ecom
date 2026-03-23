import { useState } from "react";
import BackendMissing from "../../components/ui/BackendMissing";

export default function TradeWallet() {
  const [wallet, setWallet] = useState({ available: 12500, locked: 8600, withdrawn: 4200 });
  const [amount, setAmount] = useState("");
  const [modal, setModal] = useState(false);

  const withdraw = () => {
    const val = Number(amount);
    if (!val || val <= 0 || val > wallet.available) return;
    setWallet((prev) => ({ ...prev, available: prev.available - val, withdrawn: prev.withdrawn + val }));
    setAmount(""); setModal(false);
  };

  const cards = [
    { label: "Available Balance", value: wallet.available, icon: "✅", color: "bg-emerald-600", note: "Ready to withdraw" },
    { label: "Locked in Escrow", value: wallet.locked, icon: "🔒", color: "bg-amber-600", note: "Released on delivery" },
    { label: "Total Withdrawn", value: wallet.withdrawn, icon: "💸", color: "bg-navy-600", note: "Transferred out" },
  ];

  return (
    <div className="min-h-screen bg-sand-50 py-10">
      <div className="container-app max-w-3xl">
        <div className="mb-8">
          <p className="section-label">Finance</p>
          <h1 className="text-3xl font-display font-bold text-ink-900 mt-1">Trade Wallet</h1>
          <p className="text-ink-500 text-sm mt-1">Manage escrow funds, available balance and withdrawals</p>
        </div>

        <BackendMissing
          method="GET"
          endpoint="/api/wallet/trade"
          todo="Return vendor trade wallet with available, locked (escrow), and withdrawn amounts. Also needs POST /api/wallet/withdraw"
        />

        {/* Balance cards */}
        <div className="grid sm:grid-cols-3 gap-4 mb-6">
          {cards.map((c, i) => (
            <div key={i} className="card p-5">
              <div className={`w-10 h-10 rounded-xl ${c.color} text-white flex items-center justify-center text-lg mb-3`}>{c.icon}</div>
              <p className="text-2xl font-bold text-ink-900">₹{c.value.toLocaleString()}</p>
              <p className="text-xs font-semibold text-ink-500 mt-0.5">{c.label}</p>
              <p className="text-[10px] text-ink-400 mt-0.5">{c.note}</p>
            </div>
          ))}
        </div>

        {/* Withdraw action */}
        <div className="card p-6 flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
          <div>
            <p className="font-semibold text-ink-900 text-sm">Withdraw Available Balance</p>
            <p className="text-xs text-ink-400 mt-0.5">Transfer ₹{wallet.available.toLocaleString()} to your bank account</p>
          </div>
          <button onClick={() => setModal(true)} disabled={wallet.available <= 0} className="btn-primary px-6 py-2.5 text-sm flex-shrink-0">
            Withdraw Funds
          </button>
        </div>

        {/* Escrow info */}
        <div className="card p-6 bg-amber-50 border-2 border-amber-200">
          <h3 className="font-display font-bold text-amber-900 text-base mb-2 flex items-center gap-2">
            <span>🔒</span> How Escrow Works
          </h3>
          <p className="text-sm text-amber-800 leading-relaxed">
            When a buyer places an order, funds are held in escrow and locked in your wallet. They become available to withdraw only after the buyer confirms delivery. This protects both parties in every transaction.
          </p>
        </div>
      </div>

      {/* Withdraw modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-card-hover p-6 space-y-5 animate-scale-in">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-display font-bold text-ink-900">Withdraw Funds</h2>
              <button onClick={() => setModal(false)} className="p-1.5 rounded-lg hover:bg-ink-50 text-ink-400">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <p className="text-sm text-ink-500 bg-sand-50 rounded-xl p-3">
              Available: <strong className="text-ink-900">₹{wallet.available.toLocaleString()}</strong>
            </p>
            <div>
              <label className="block text-sm font-semibold text-ink-700 mb-1.5">Amount (₹)</label>
              <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Enter amount" className="input-base text-lg font-bold" />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setModal(false)} className="btn-outline flex-1 py-2.5 text-sm">Cancel</button>
              <button onClick={withdraw} className="btn-primary flex-1 py-2.5 text-sm">Confirm Withdrawal</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
