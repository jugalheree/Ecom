import { useEffect, useState } from "react";
import api from "../../services/api";
import BackendMissing from "../../components/ui/BackendMissing";
import { useToastStore } from "../../store/toastStore";

const statusBadge = (s) =>
  s === "DELIVERED"        ? "badge-success" :
  s === "OUT_FOR_DELIVERY" ? "badge-navy"    :
  s === "PICKED_UP"        ? "badge-navy"    :
  "badge-warn";

export default function DeliveryOrders() {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [backendMissing, setBackendMissing] = useState(false);
  const [updating, setUpdating] = useState({});
  const showToast = useToastStore((s) => s.showToast);

  useEffect(() => {
    api.get("/api/delivery/deliveries")
      .then((res) => setDeliveries(res.data.data?.deliveries || []))
      .catch(() => setBackendMissing(true))
      .finally(() => setLoading(false));
  }, []);

  const updateStatus = async (id, status) => {
    setUpdating((s) => ({ ...s, [id]: true }));
    try {
      await api.patch(`/api/delivery/deliveries/${id}/status`, { status });
      setDeliveries((prev) => prev.map((d) => d._id === id ? { ...d, status } : d));
      showToast({ message: "Status updated!", type: "success" });
    } catch {
      showToast({ message: "Update failed — backend missing", type: "error" });
    } finally {
      setUpdating((s) => ({ ...s, [id]: false }));
    }
  };

  return (
    <div className="min-h-screen bg-sand-50 p-6">
      <div className="mb-6">
        <p className="section-label">Delivery</p>
        <h1 className="text-2xl font-display font-bold text-ink-900 mt-1">My Deliveries</h1>
        <p className="text-ink-400 text-sm mt-0.5">Assigned orders to deliver</p>
      </div>

      {backendMissing && (
        <BackendMissing
          method="GET"
          endpoint="/api/delivery/deliveries"
          todo="Return list of delivery assignments for the logged-in employee including order details, address, and current status"
        />
      )}

      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="card p-5"><div className="skeleton h-16 rounded-xl" /></div>)}</div>
      ) : deliveries.length === 0 && !backendMissing ? (
        <div className="card p-16 text-center">
          <div className="text-5xl mb-4">🚚</div>
          <h3 className="font-display font-bold text-ink-900 text-lg">No deliveries assigned</h3>
          <p className="text-ink-500 text-sm mt-2">Orders assigned to you will appear here.</p>
        </div>
      ) : deliveries.length > 0 && (
        <div className="space-y-4">
          {deliveries.map((d) => (
            <div key={d._id} className="card p-5">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-ink-900 text-sm">Order #{d.order?._id?.slice(-8).toUpperCase() || d._id?.slice(-8)}</p>
                    <span className={statusBadge(d.status)}>{d.status?.replace(/_/g," ")}</span>
                  </div>
                  <p className="text-xs text-ink-500">📍 {d.order?.address?.street}, {d.order?.address?.city} — {d.order?.address?.pincode}</p>
                  <p className="text-xs text-ink-400 mt-0.5">📱 {d.order?.address?.phone || "—"}</p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  {d.status === "ASSIGNED" && (
                    <button onClick={() => updateStatus(d._id, "PICKED_UP")} disabled={updating[d._id]}
                      className="btn-outline text-xs py-1.5 px-3">Mark Picked Up</button>
                  )}
                  {d.status === "PICKED_UP" && (
                    <button onClick={() => updateStatus(d._id, "OUT_FOR_DELIVERY")} disabled={updating[d._id]}
                      className="btn-primary text-xs py-1.5 px-3">Out for Delivery</button>
                  )}
                  {d.status === "OUT_FOR_DELIVERY" && (
                    <button onClick={() => updateStatus(d._id, "DELIVERED")} disabled={updating[d._id]}
                      className="btn-primary text-xs py-1.5 px-3">Mark Delivered ✓</button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
