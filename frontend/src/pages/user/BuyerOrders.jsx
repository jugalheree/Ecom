import { useEffect, useState } from "react";
import { useOrderStore } from "../../store/orderStore";
import Card from "../../components/ui/Card";
import { useNavigate } from "react-router-dom";
import { useToastStore } from "../../store/toastStore";

const STATUS_COLORS = {
  PENDING_PAYMENT: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", dot: "bg-amber-400" },
  CONFIRMED:       { bg: "bg-blue-50",  text: "text-blue-700",  border: "border-blue-200",  dot: "bg-blue-400" },
  PROCESSING:      { bg: "bg-indigo-50",text: "text-indigo-700",border: "border-indigo-200",dot: "bg-indigo-400" },
  SHIPPED:         { bg: "bg-purple-50",text: "text-purple-700",border: "border-purple-200",dot: "bg-purple-400" },
  DELIVERED:       { bg: "bg-emerald-50",text: "text-emerald-700",border: "border-emerald-200",dot: "bg-emerald-400" },
  CANCELLED:       { bg: "bg-red-50",   text: "text-red-700",   border: "border-red-200",   dot: "bg-red-400" },
};

function StatusBadge({ status }) {
  const cfg = STATUS_COLORS[status] || { bg: "bg-ink-100", text: "text-ink-600", border: "border-ink-200", dot: "bg-ink-400" };
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {status?.replace(/_/g, " ")}
    </span>
  );
}

export default function BuyerOrders() {
  const { orders, pagination, loading, fetchMyOrders } = useOrderStore();
  const [page, setPage] = useState(1);
  const navigate = useNavigate();
  const showToast = useToastStore((s) => s.showToast);

  useEffect(() => {
    fetchMyOrders({ page, limit: 10 }).then((res) => {
      if (!res.success) showToast({ message: res.message || "Failed to load orders", type: "error" });
    });
  }, [page]);

  return (
    <div className="min-h-screen bg-ink-50 mt-[72px]">
      <div className="bg-white border-b border-ink-100">
        <div className="container-app py-8">
          <p className="text-xs font-display font-bold uppercase tracking-widest text-primary-600 mb-2">Account</p>
          <h1 className="text-4xl font-display font-bold text-ink-900">My Orders</h1>
          <p className="text-ink-500 text-sm mt-1">
            {pagination ? `${pagination.total} order${pagination.total !== 1 ? "s" : ""} placed` : "Your purchase history"}
          </p>
        </div>
      </div>

      <div className="container-app py-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-ink-200 border-t-primary-500 rounded-full animate-spin mx-auto mb-3" />
              <p className="text-xs font-display font-semibold uppercase tracking-widest text-ink-400">Loading orders</p>
            </div>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-white border-2 border-ink-200 rounded-2xl flex items-center justify-center text-4xl mx-auto mb-6 shadow-sm">📦</div>
            <h2 className="text-2xl font-display font-bold text-ink-900 mb-2">No orders yet</h2>
            <p className="text-ink-500 text-sm mb-8">Once you place an order, it will appear here.</p>
            <button
              onClick={() => navigate("/market")}
              className="bg-ink-900 text-white font-display font-semibold px-7 py-3 rounded-xl hover:bg-ink-800 transition-all active:scale-[0.97]"
            >
              Browse marketplace
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Card
                key={order._id}
                onClick={() => navigate(`/orders/${order._id}`)}
                className="p-6 cursor-pointer hover:border-ink-300 transition-all hover:shadow-sm"
              >
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <p className="text-xs text-ink-400 font-medium mb-1">
                      {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                    </p>
                    <p className="font-display font-bold text-ink-900 text-sm">
                      Order #{order.orderNumber || order._id.slice(-8).toUpperCase()}
                    </p>
                    <p className="text-xs text-ink-500 mt-1">
                      {order.items?.length} item{order.items?.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-display font-bold text-ink-900 mb-2">
                      Rs.{order.totalAmount?.toLocaleString()}
                    </p>
                    <StatusBadge status={order.orderStatus} />
                  </div>
                </div>
                {order.paymentStatus === "PENDING" && order.orderStatus === "PENDING_PAYMENT" && (
                  <div className="mt-3 pt-3 border-t border-ink-100">
                    <p className="text-xs text-amber-600 font-medium">
                      Payment pending
                      {order.paymentExpiresAt && ` · expires ${new Date(order.paymentExpiresAt).toLocaleTimeString()}`}
                    </p>
                  </div>
                )}
              </Card>
            ))}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex justify-center gap-2 pt-4">
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((pg) => (
                  <button
                    key={pg}
                    onClick={() => setPage(pg)}
                    className={`w-9 h-9 rounded-xl text-sm font-display font-semibold transition ${
                      pg === page ? "bg-ink-900 text-white" : "bg-white border border-ink-200 text-ink-600 hover:bg-ink-50"
                    }`}
                  >
                    {pg}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
