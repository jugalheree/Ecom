import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import BackendMissing from "../../components/ui/BackendMissing";

export default function DeliveryDashboard() {
  const navigate = useNavigate();
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [backendMissing, setBackendMissing] = useState(false);

  useEffect(() => {
    api.get("/api/delivery/deliveries")
      .then((r) => setDeliveries(r.data?.data?.deliveries || []))
      .catch(() => setBackendMissing(true))
      .finally(() => setLoading(false));
  }, []);

  const assigned  = deliveries.filter((d) => d.status !== "DELIVERED").length;
  const delivered = deliveries.filter((d) => d.status === "DELIVERED").length;

  return (
    <div className="min-h-screen bg-sand-50 p-6">
      <div className="mb-6">
        <p className="section-label">Delivery Staff</p>
        <h1 className="text-2xl font-display font-bold text-ink-900 mt-1">My Dashboard</h1>
      </div>

      {backendMissing && <BackendMissing method="GET" endpoint="/api/delivery/deliveries" todo="Return delivery assignments for the logged-in employee with status, address, and order details" />}

      <div className="grid sm:grid-cols-2 gap-4 mb-8">
        <div className="card p-5 border-2 border-brand-200 bg-brand-50">
          <span className="text-3xl">🚚</span>
          <p className="text-2xl font-bold text-ink-900 mt-2">{assigned}</p>
          <p className="text-xs font-semibold text-brand-700 mt-0.5">Pending Deliveries</p>
        </div>
        <div className="card p-5 border-2 border-emerald-200 bg-emerald-50">
          <span className="text-3xl">✅</span>
          <p className="text-2xl font-bold text-ink-900 mt-2">{delivered}</p>
          <p className="text-xs font-semibold text-emerald-700 mt-0.5">Delivered Today</p>
        </div>
      </div>

      {!backendMissing && deliveries.length > 0 && (
        <div className="card p-5">
          <h2 className="font-display font-bold text-ink-900 text-lg mb-4">Assigned Orders</h2>
          <div className="space-y-3">
            {deliveries.slice(0, 5).map((d) => (
              <div key={d._id} className="flex items-center justify-between p-3.5 rounded-xl bg-sand-50 hover:bg-sand-100 transition-colors cursor-pointer" onClick={() => navigate(`/delivery/tracking`)}>
                <div>
                  <p className="font-semibold text-ink-900 text-sm">Order #{d.order?._id?.slice(-8).toUpperCase() || d._id?.slice(-8)}</p>
                  <p className="text-xs text-ink-400 mt-0.5">{d.order?.address?.city || "—"}</p>
                </div>
                <span className={`badge text-[10px] ${d.status === "DELIVERED" ? "badge-success" : "badge-warn"}`}>{d.status?.replace(/_/g," ")}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
