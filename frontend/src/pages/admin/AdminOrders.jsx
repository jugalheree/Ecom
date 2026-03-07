import { useEffect, useState } from "react";
import Card from "../../components/ui/Card";

// Note: Backend currently only has /api/orders/place endpoint (no admin orders list endpoint yet)
// This page shows a placeholder until the admin orders API is added to the backend

export default function AdminOrders() {
  const statusColor = (status) => {
    if (status === "DELIVERED") return "text-emerald-600";
    if (status === "SHIPPED") return "text-blue-600";
    if (status === "PENDING_PAYMENT" || status === "PENDING") return "text-amber-600";
    if (status === "CANCELLED") return "text-red-600";
    return "text-ink-600";
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="container-app py-12">
        <div className="mb-10">
          <h1 className="text-5xl font-display font-bold text-ink-900 mb-4">
            Admin Orders
          </h1>
          <p className="text-xl text-ink-600">
            View and manage platform orders.
          </p>
        </div>

        <Card className="p-8 border-2 border-ink-200">
          <div className="text-center py-16 text-ink-400">
            <div className="text-5xl mb-4">📦</div>
            <h3 className="text-xl font-semibold text-ink-600 mb-2">
              Orders listing coming soon
            </h3>
            <p className="text-ink-500 text-sm max-w-md mx-auto">
              The backend API for listing all orders is not yet implemented.
              Orders can be placed by buyers via <code className="bg-ink-100 px-1 rounded">/api/orders/place</code> and will appear here once the admin orders endpoint is added.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
