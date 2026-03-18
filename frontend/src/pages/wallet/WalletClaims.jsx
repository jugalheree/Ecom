import BackendMissing from "../../components/ui/BackendMissing";

const mockClaims = [
  { id: "CLM001", orderId: "ORD-9A3F", amount: 2499, status: "PENDING", reason: "Item not delivered", date: "2026-01-15" },
  { id: "CLM002", orderId: "ORD-7B2E", amount: 5999, status: "RESOLVED", reason: "Wrong product received", date: "2026-01-10" },
];

const statusBadge = (s) =>
  s === "RESOLVED" ? "badge-success" :
  s === "REJECTED" ? "badge-danger"  :
  "badge-warn";

export default function WalletClaims() {
  return (
    <div className="min-h-screen bg-sand-50 py-10">
      <div className="container-app max-w-3xl">
        <div className="mb-8">
          <p className="section-label">Finance</p>
          <h1 className="text-3xl font-display font-bold text-ink-900 mt-1">Wallet Claims</h1>
          <p className="text-ink-500 text-sm mt-1">Track your escrow disputes and refund claims</p>
        </div>

        <BackendMissing
          method="GET"
          endpoint="/api/wallet/claims"
          todo="Return list of wallet claims for the current user with orderId, amount, reason, and resolution status"
        />

        <div className="space-y-4">
          {mockClaims.map((claim) => (
            <div key={claim.id} className="card p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-sand-100 flex items-center justify-center text-xl flex-shrink-0">🛡️</div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-ink-900 text-sm">{claim.id}</p>
                      <span className={statusBadge(claim.status)}>{claim.status}</span>
                    </div>
                    <p className="text-xs text-ink-500">Order #{claim.orderId} · ₹{claim.amount.toLocaleString()}</p>
                    <p className="text-xs text-ink-400 mt-0.5">{claim.reason}</p>
                    <p className="text-xs text-ink-300 mt-0.5">{new Date(claim.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="card p-5 mt-6 border-2 border-brand-100 bg-brand-50">
          <h3 className="font-semibold text-brand-900 text-sm mb-1 flex items-center gap-2"><span>💡</span> How to raise a claim</h3>
          <p className="text-xs text-brand-700 leading-relaxed">
            To dispute an escrow hold or raise a refund claim, go to your order detail page and use the "Request Return" option. Our team reviews all claims within 24-48 hours.
          </p>
        </div>
      </div>
    </div>
  );
}
