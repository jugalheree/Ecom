import BackendMissing from "../../components/ui/BackendMissing";

export default function AdminClaims() {
  return (
    <div className="min-h-screen bg-sand-50 p-6">
      <div className="mb-6">
        <p className="section-label">Admin</p>
        <h1 className="text-2xl font-display font-bold text-ink-900 mt-1">Wallet Claims</h1>
        <p className="text-ink-400 text-sm mt-0.5">Manage escrow disputes and wallet claims</p>
      </div>
      <BackendMissing
        method="GET"
        endpoint="/api/admin/claims"
        todo="Return list of wallet claims/disputes with buyer, vendor, amount, and resolution status"
      />
      <div className="card p-16 text-center">
        <div className="text-5xl mb-4">🛡️</div>
        <h3 className="font-display font-bold text-ink-900 text-lg">Claims management coming soon</h3>
        <p className="text-ink-500 text-sm mt-2 max-w-sm mx-auto">
          Dispute resolution and wallet claims will be managed here once the backend endpoint is ready.
        </p>
      </div>
    </div>
  );
}
