import { useState } from "react";
import { useWalletStore } from "../store/walletStore";

export default function Wallet() {
  const balance      = useWalletStore((s) => s.balance);
  const held         = useWalletStore((s) => s.held);
  const transactions = useWalletStore((s) => s.transactions);
  const addMoney     = useWalletStore((s) => s.addMoney);
  const withdrawMoney= useWalletStore((s) => s.withdrawMoney);

  const [modal, setModal] = useState(null); // "add" | "withdraw" | null
  const [amount, setAmount] = useState("");
  const available = balance - held;

  function handleConfirm() {
    const val = Number(amount);
    if (!val || val <= 0) return;
    if (modal === "add") addMoney(val);
    else if (modal === "withdraw" && val <= available) withdrawMoney(val);
    setAmount(""); setModal(null);
  }

  const cards = [
    { label: "Total Balance", value: `₹${balance.toLocaleString()}`, icon: "💳", color: "bg-navy-600" },
    { label: "Held in Escrow", value: `₹${held.toLocaleString()}`, icon: "🔒", color: "bg-sand-600" },
    { label: "Available", value: `₹${available.toLocaleString()}`, icon: "✅", color: "bg-emerald-600" },
  ];

  return (
    <div className="min-h-screen bg-sand-50 py-10">
      <div className="container-app max-w-3xl">
        <div className="mb-8">
          <p className="section-label">Account</p>
          <h1 className="text-3xl font-display font-bold text-ink-900 mt-1">My Wallet</h1>
          <p className="text-ink-500 text-sm mt-1">Manage your funds, escrow, and transaction history</p>
        </div>

        {/* Balance cards */}
        <div className="grid sm:grid-cols-3 gap-4 mb-6">
          {cards.map((c, i) => (
            <div key={i} className="card p-5 flex items-start gap-4">
              <div className={`${c.color} w-10 h-10 rounded-xl text-white flex items-center justify-center text-lg flex-shrink-0`}>{c.icon}</div>
              <div>
                <p className="text-xs text-ink-400 font-medium">{c.label}</p>
                <p className="text-xl font-bold text-ink-900 mt-0.5">{c.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="card p-5 flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
          <p className="text-sm text-ink-500">Add money to your wallet or withdraw your available balance.</p>
          <div className="flex gap-3 flex-shrink-0">
            <button onClick={() => setModal("add")} className="btn-primary px-5 py-2.5 text-sm">+ Add Money</button>
            <button onClick={() => setModal("withdraw")} className="btn-outline px-5 py-2.5 text-sm">Withdraw</button>
          </div>
        </div>

        {/* Transaction history */}
        <div>
          <h2 className="text-lg font-display font-bold text-ink-900 mb-4">Transaction History</h2>
          {transactions.length === 0 ? (
            <div className="card p-10 text-center">
              <div className="text-4xl mb-3">📊</div>
              <p className="font-medium text-ink-700">No transactions yet</p>
              <p className="text-sm text-ink-400 mt-1">Your wallet activity will appear here.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.map((tx, i) => (
                <div key={i} className="card p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-base ${tx.amount > 0 ? "bg-green-50 text-green-600" : "bg-red-50 text-red-500"}`}>
                      {tx.amount > 0 ? "↓" : "↑"}
                    </div>
                    <div>
                      <p className="font-medium text-ink-900 text-sm">{tx.title}</p>
                      <p className="text-xs text-ink-400 mt-0.5">{tx.date}</p>
                    </div>
                  </div>
                  <span className={`font-bold text-sm ${tx.amount > 0 ? "text-success-600" : "text-danger-500"}`}>
                    {tx.amount > 0 ? "+" : "-"}₹{Math.abs(tx.amount).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-card-hover p-6 space-y-5 animate-scale-in">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-display font-bold text-ink-900">
                {modal === "add" ? "Add Money" : "Withdraw"}
              </h2>
              <button onClick={() => { setModal(null); setAmount(""); }} className="p-1.5 rounded-lg hover:bg-ink-50 text-ink-400">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            {modal === "withdraw" && (
              <p className="text-sm text-ink-500 bg-sand-50 rounded-xl p-3">Available balance: <strong className="text-ink-900">₹{available.toLocaleString()}</strong></p>
            )}
            <div>
              <label className="block text-sm font-semibold text-ink-700 mb-1.5">Amount (₹)</label>
              <input type="number" placeholder="Enter amount" value={amount} onChange={(e) => setAmount(e.target.value)} className="input-base text-lg font-bold" />
            </div>
            <div className="flex gap-3 pt-1">
              <button onClick={() => { setModal(null); setAmount(""); }} className="btn-outline flex-1 py-2.5 text-sm">Cancel</button>
              <button onClick={handleConfirm} className="btn-primary flex-1 py-2.5 text-sm">
                {modal === "add" ? "Add Money" : "Withdraw"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
