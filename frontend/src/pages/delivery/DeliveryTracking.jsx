import { useEffect, useState } from "react";
import api from "../../services/api";
import BackendMissing from "../../components/ui/BackendMissing";

export default function DeliveryTracking() {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [backendMissing, setBackendMissing] = useState(false);

  useEffect(() => {
    api.get("/api/delivery/deliveries")
      .then((res) => setDeliveries(res.data.data?.deliveries || []))
      .catch(() => setBackendMissing(true))
      .finally(() => setLoading(false));
  }, []);

  const steps = ["ASSIGNED", "PICKED_UP", "OUT_FOR_DELIVERY", "DELIVERED"];
  const stepLabels = { ASSIGNED: "Assigned", PICKED_UP: "Picked Up", OUT_FOR_DELIVERY: "Out for Delivery", DELIVERED: "Delivered" };
  const stepIcons  = { ASSIGNED: "📋", PICKED_UP: "📦", OUT_FOR_DELIVERY: "🚚", DELIVERED: "✅" };

  return (
    <div className="min-h-screen bg-sand-50 p-6">
      <div className="mb-6">
        <p className="section-label">Delivery</p>
        <h1 className="text-2xl font-display font-bold text-ink-900 mt-1">Live Tracking</h1>
        <p className="text-ink-400 text-sm mt-0.5">Real-time status of your assigned deliveries</p>
      </div>

      {backendMissing && (
        <BackendMissing method="GET" endpoint="/api/delivery/deliveries" todo="Same endpoint as delivery dashboard — returns delivery assignments with status tracking data" />
      )}

      {loading ? (
        <div className="space-y-4">{[1,2].map(i => <div key={i} className="card p-6"><div className="skeleton h-20 rounded-xl" /></div>)}</div>
      ) : deliveries.length === 0 && !backendMissing ? (
        <div className="card p-16 text-center">
          <div className="text-5xl mb-4">🗺️</div>
          <h3 className="font-display font-bold text-ink-900 text-lg">No active deliveries</h3>
          <p className="text-ink-500 text-sm mt-2">Your active deliveries will be tracked here in real time.</p>
        </div>
      ) : deliveries.length > 0 && (
        <div className="space-y-5">
          {deliveries.map((d) => {
            const currentIdx = steps.indexOf(d.status);
            return (
              <div key={d._id} className="card p-6">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <p className="font-semibold text-ink-900">Order #{d.order?._id?.slice(-8).toUpperCase() || d._id?.slice(-8)}</p>
                    <p className="text-xs text-ink-400 mt-0.5">📍 {d.order?.address?.city || "—"}</p>
                  </div>
                  <span className={`badge text-[10px] ${d.status === "DELIVERED" ? "badge-success" : "badge-navy"}`}>{d.status?.replace(/_/g," ")}</span>
                </div>
                {/* Progress steps */}
                <div className="relative flex items-center justify-between">
                  <div className="absolute left-0 right-0 h-0.5 bg-ink-100 top-4 z-0" />
                  <div className="absolute left-0 h-0.5 bg-brand-500 top-4 z-0 transition-all duration-500"
                    style={{ width: currentIdx >= 0 ? `${(currentIdx / (steps.length - 1)) * 100}%` : "0%" }} />
                  {steps.map((step, i) => {
                    const done = i <= currentIdx;
                    return (
                      <div key={step} className="relative z-10 flex flex-col items-center gap-1.5">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm border-2 transition-all ${done ? "bg-brand-600 border-brand-600 text-white" : "bg-white border-ink-200 text-ink-300"}`}>
                          {stepIcons[step]}
                        </div>
                        <span className={`text-[10px] font-medium text-center max-w-[56px] leading-tight ${done ? "text-brand-700" : "text-ink-400"}`}>
                          {stepLabels[step]}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
