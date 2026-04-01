import { useState, useEffect } from "react";
import { useWalletStore } from "../store/walletStore";
import { useToastStore } from "../store/toastStore";

export default function Wallet() {
  const { balance, locked, available, withdrawn, transactions, loading, fetchWallet, addMoney, withdrawMoney } = useWalletStore();
  const showToast = useToastStore((s) => s.showToast);
  const [modal, setModal] = useState(null); // "add" | "withdraw"
  const [amount, setAmount] = useState("");
  const [acting, setActing] = useState(false);

  useEffect(() => { fetchWallet(); }, []);

  const handleConfirm = async () => {
    const val = Number(amount);
    if (!val || val <= 0) { showToast({ message: "Enter a valid amount", type: "error" }); return; }
    if (modal === "withdraw" && val > available) {
      showToast({ message: "Insufficient available balance", type: "error" }); return;
    }
    setActing(true);
    const fn = modal === "add" ? addMoney : withdrawMoney;
    const result = await fn(val);
    setActing(false);
    if (result.success) {
      showToast({ message: modal === "add" ? "Money added!" : "Withdrawal successful!", type: "success" });
      setAmount(""); setModal(null);
    } else {
      showToast({ message: result.message || "Failed", type: "error" });
    }
  };

  const cards = [
    { label: "Total Balance",  value: balance,   icon: "💳", color: "bg-navy-600" },
    { label: "Locked Escrow",  value: locked,    icon: "🔒", color: "bg-amber-600" },
    { label: "Available",      value: available, icon: "✅", color: "bg-emerald-600" },
    { label: "Total Withdrawn",value: withdrawn, icon: "💸", color: "bg-brand-600" },
  ];

  const txIcon = { CREDIT: "⬆️", DEBIT: "⬇️", LOCK: "🔒", UNLOCK: "🔓", REFUND: "↩️", WITHDRAWAL: "💸" };
  const txColor = { CREDIT: "text-green-600", DEBIT: "text-red-500", REFUND: "text-blue-600", WITHDRAWAL: "text-red-500", LOCK: "text-amber-600", UNLOCK: "text-green-600" };

  return (
    <div className="min-h-screen bg-sand-50 py-10">
      <div className="container-app max-w-3xl">
        <div className="mb-8">
          <p className="section-label">Account</p>
          <h1 className="text-3xl font-display font-bold text-ink-900 mt-1">My Wallet</h1>
          <p className="text-ink-500 text-sm mt-1">Manage your funds, escrow, and transaction history</p>
        </div>

        {loading ? (
          <div className="grid sm:grid-cols-4 gap-4 mb-6">{[1,2,3,4].map(i => <div key={i} className="card p-5"><div className="skeleton h-14 rounded-xl" /></div>)}</div>
        ) : (
          <>
            {/* Balance cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              {cards.map((c, i) => (
                <div key={i} className="card p-4 flex items-start gap-3">
                  <div className={`${c.color} w-9 h-9 rounded-xl text-white flex items-center justify-center text-sm flex-shrink-0`}>{c.icon}</div>
                  <div>
                    <p className="text-xs text-ink-400 font-medium leading-tight">{c.label}</p>
                    <p className="text-lg font-bold text-ink-900 mt-0.5">₹{c.value.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Action buttons */}
            <div className="flex gap-3 mb-8">
              <button onClick={() => setModal("add")} className="btn-primary px-6 py-2.5 text-sm flex items-center gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                Add Money
              </button>
              <button onClick={() => setModal("withdraw")} disabled={available <= 0}
                className="btn-outline px-6 py-2.5 text-sm flex items-center gap-2 disabled:opacity-40">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="17 11 12 6 7 11"/><line x1="12" y1="6" x2="12" y2="18"/></svg>
                Withdraw
              </button>
            </div>

            {/* Transactions */}
            <div className="card overflow-hidden">
              <div className="px-5 py-4 border-b border-ink-100">
                <h2 className="font-display font-bold text-ink-900">Transaction History</h2>
              </div>
              {transactions.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="text-4xl mb-3">💳</div>
                  <p className="text-ink-500 text-sm">No transactions yet</p>
                </div>
              ) : (
                <div className="divide-y divide-ink-100">
                  {transactions.map((tx, i) => (
                    <div key={tx._id || i} className="flex items-center justify-between px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{txIcon[tx.type] || "💳"}</span>
                        <div>
                          <p className="text-sm font-medium text-ink-800">{tx.description || tx.type?.replace(/_/g," ")}</p>
                          <p className="text-xs text-ink-400">{tx.createdAt ? new Date(tx.createdAt).toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" }) : "—"}</p>
                        </div>
                      </div>
                      <span className={`font-bold text-sm ${txColor[tx.type] || "text-ink-700"}`}>
                        {["CREDIT","REFUND","UNLOCK"].includes(tx.type) ? "+" : "-"}₹{tx.amount?.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* Modals */}
        {modal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
              <h3 className="font-display font-bold text-ink-900 text-lg mb-1">
                {modal === "add" ? "Add Money" : "Withdraw Money"}
              </h3>
              <p className="text-ink-500 text-sm mb-5">
                {modal === "add"
                  ? "Funds will be added to your wallet balance instantly."
                  : `Available to withdraw: ₹${available.toLocaleString()}`
                }
              </p>
              <div className="relative mb-5">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-500 font-semibold">₹</span>
                <input
                  type="number" min="1" value={amount} onChange={e => setAmount(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleConfirm()}
                  placeholder="0.00"
                  className="w-full pl-8 pr-4 py-3 rounded-xl border-2 border-ink-200 text-ink-900 text-lg font-bold focus:outline-none focus:border-brand-400"
                  autoFocus
                />
              </div>
              <div className="flex gap-3">
                <button onClick={handleConfirm} disabled={acting || !amount}
                  className="flex-1 btn-primary py-3 text-sm disabled:opacity-50">
                  {acting ? "Processing..." : modal === "add" ? "Add ₹" + (amount || "0") : "Withdraw ₹" + (amount || "0")}
                </button>
                <button onClick={() => { setModal(null); setAmount(""); }}
                  className="px-5 py-3 rounded-xl border border-ink-200 text-ink-600 text-sm hover:bg-ink-50">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
