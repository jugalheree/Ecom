import BackendMissing from "../../components/ui/BackendMissing";

export default function AdminOrders() {
  return (
    <div className="min-h-screen bg-sand-50 p-6">
      <div className="mb-6">
        <p className="section-label">Admin</p>
        <h1 className="text-2xl font-display font-bold text-ink-900 mt-1">All Orders</h1>
        <p className="text-ink-400 text-sm mt-0.5">View and manage all platform orders</p>
      </div>
      <BackendMissing
        method="GET"
        endpoint="/api/admin/orders"
        todo="Create endpoint that returns paginated list of all orders across all vendors with buyer info, status, and totals"
      />
      <div className="card p-16 text-center">
        <div className="text-5xl mb-4">📦</div>
        <h3 className="font-display font-bold text-ink-900 text-lg">Orders listing coming soon</h3>
        <p className="text-ink-500 text-sm mt-2 max-w-sm mx-auto">
          Once the backend endpoint is implemented, all platform orders will appear here with full management controls.
        </p>
      </div>
    </div>
  );
}
