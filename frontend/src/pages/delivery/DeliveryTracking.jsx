import { useEffect, useState } from "react";
import { assignmentAPI } from "../../services/apis/index";
import { useToastStore } from "../../store/toastStore";

const STEPS = [
  { key: "ORDER_PLACED",      label: "Order Placed",     icon: "🛒" },
  { key: "CONFIRMED",         label: "Confirmed",        icon: "✅" },
  { key: "PACKED",            label: "Packed",           icon: "📦" },
  { key: "PICKED_UP",         label: "Picked Up",        icon: "🚛" },
  { key: "OUT_FOR_DELIVERY",  label: "Out for Delivery", icon: "📍" },
  { key: "DELIVERED",         label: "Delivered",        icon: "🏠" },
];

const STATUS_IDX = {
  CONFIRMED: 1, PROCESSING: 1, PACKED: 2,
  PICKED_UP: 3, ACCEPTED: 3, SHIPPED: 3,
  OUT_FOR_DELIVERY: 4, DELIVERED: 5,
};

// Map assignment status → order step
const ASSIGN_TO_ORDER_STATUS = {
  ASSIGNED:         "CONFIRMED",
  ACCEPTED:         "PICKED_UP",
  PICKED_UP:        "PICKED_UP",
  OUT_FOR_DELIVERY: "OUT_FOR_DELIVERY",
  DELIVERED:        "DELIVERED",
};

export default function DeliveryTracking() {
  const showToast = useToastStore((s) => s.showToast);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [locating, setLocating] = useState(false);
  const [myLocation, setMyLocation] = useState(null);

  useEffect(() => {
    assignmentAPI.getMy()
      .then((r) => {
        const list = r.data?.data || [];
        // Only active (not failed/reassigned)
        const active = list.filter(a => !["FAILED", "REASSIGNED"].includes(a.status));
        setAssignments(active);
        if (active.length > 0) setSelected(active[0]._id);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleShareLocation = () => {
    if (!navigator.geolocation) {
      showToast({ message: "Geolocation not supported by your browser", type: "error" }); return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setMyLocation(coords);
        try {
          await assignmentAPI.updateLocation(coords);
          showToast({ message: "Location updated!", type: "success" });
        } catch {
          // Store locally even if API not wired
          showToast({ message: "Location captured (not synced — check backend)", type: "info" });
        } finally { setLocating(false); }
      },
      () => {
        showToast({ message: "Could not get location. Check browser permissions.", type: "error" });
        setLocating(false);
      }
    );
  };

  const currentAssignment = assignments.find(a => a._id === selected);
  const order = currentAssignment?.orderId;
  const orderStatus = ASSIGN_TO_ORDER_STATUS[currentAssignment?.status] || "CONFIRMED";
  const stepIdx = STATUS_IDX[orderStatus] ?? 1;

  return (
    <div className="min-h-screen bg-sand-50 p-6">
      <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
        <div>
          <p className="section-label">Delivery</p>
          <h1 className="text-2xl font-display font-bold text-ink-900 mt-1">Live Tracking</h1>
          <p className="text-ink-400 text-sm mt-0.5">Your assigned deliveries</p>
        </div>
        {/* Location button */}
        <button onClick={handleShareLocation} disabled={locating}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all border-2 ${
            myLocation
              ? "bg-green-50 border-green-300 text-green-700"
              : "bg-white border-ink-200 text-ink-600 hover:border-brand-400"
          } disabled:opacity-50`}>
          <span>{locating ? "📡" : myLocation ? "✅" : "📍"}</span>
          {locating ? "Getting location..." : myLocation ? `Location: ${myLocation.lat.toFixed(4)}, ${myLocation.lng.toFixed(4)}` : "Share My Location"}
        </button>
      </div>

      {loading ? (
        <div className="space-y-4">{[1,2].map(i => <div key={i} className="card p-6"><div className="skeleton h-20 rounded-xl"/></div>)}</div>
      ) : assignments.length === 0 ? (
        <div className="card p-16 text-center">
          <div className="text-5xl mb-4">🗺️</div>
          <h3 className="font-display font-bold text-ink-900 text-lg">No active deliveries</h3>
          <p className="text-ink-500 text-sm mt-2">Your assigned deliveries will appear here.</p>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Assignment list */}
          <div className="w-full lg:w-72 flex-shrink-0 space-y-2">
            <p className="text-xs font-bold uppercase tracking-wider text-ink-400 mb-2">Your Deliveries ({assignments.length})</p>
            {assignments.map(a => {
              const o = a.orderId;
              return (
                <button key={a._id} onClick={() => setSelected(a._id)}
                  className={`w-full text-left p-4 rounded-2xl border-2 transition-all ${
                    selected === a._id ? "border-brand-400 bg-brand-50" : "border-ink-200 bg-white hover:border-ink-300"
                  }`}>
                  <p className="font-mono text-xs font-bold text-ink-600">#{o?.orderNumber || o?._id?.slice(-8).toUpperCase() || a._id.slice(-8).toUpperCase()}</p>
                  <p className="text-sm font-semibold text-ink-900 mt-1">{o?.buyerId?.name || "Customer"}</p>
                  <p className="text-xs text-ink-400 mt-0.5 truncate">📍 {o?.deliveryAddress?.city || "—"}</p>
                  <span className={`mt-2 inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    a.status === "OUT_FOR_DELIVERY" ? "bg-orange-50 text-orange-700" :
                    a.status === "PICKED_UP" || a.status === "ACCEPTED" ? "bg-blue-50 text-blue-700" :
                    a.status === "DELIVERED" ? "bg-green-50 text-green-700" :
                    "bg-amber-50 text-amber-700"
                  }`}>{a.status?.replace(/_/g," ")}</span>
                </button>
              );
            })}
          </div>

          {/* Detail */}
          {currentAssignment && (
            <div className="flex-1 space-y-4">
              {/* Progress stepper */}
              <div className="card p-6">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-xs text-ink-400 font-medium">Order</p>
                    <p className="font-mono font-bold text-ink-900">#{order?.orderNumber || order?._id?.slice(-8).toUpperCase() || "—"}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-ink-400">Amount</p>
                    <p className="font-bold text-ink-900">₹{order?.totalAmount?.toLocaleString() || "—"}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-6 relative">
                  <div className="absolute top-5 left-0 right-0 h-0.5 bg-ink-100 z-0" />
                  <div className="absolute top-5 left-0 h-0.5 bg-brand-500 z-0 transition-all duration-700"
                    style={{ width: `${(stepIdx / (STEPS.length - 1)) * 100}%` }} />
                  {STEPS.map((s, i) => (
                    <div key={s.key} className="flex flex-col items-center z-10 flex-1">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg border-2 transition-all ${
                        i < stepIdx ? "bg-brand-500 border-brand-500 text-white" :
                        i === stepIdx ? "bg-white border-brand-500 shadow-lg" :
                        "bg-white border-ink-200 opacity-50"
                      }`}>{s.icon}</div>
                      <p className={`text-[10px] font-semibold mt-2 text-center leading-tight max-w-[56px] ${i <= stepIdx ? "text-ink-700" : "text-ink-400"}`}>{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Delivery address */}
              {order?.deliveryAddress && (
                <div className="card p-5">
                  <h3 className="font-display font-bold text-ink-900 mb-2">📍 Deliver To</h3>
                  <p className="text-sm font-semibold text-ink-800">{order.deliveryAddress.name}</p>
                  <p className="text-sm text-ink-600 mt-0.5">
                    {order.deliveryAddress.street}, {order.deliveryAddress.area && `${order.deliveryAddress.area}, `}
                    {order.deliveryAddress.city}, {order.deliveryAddress.state} — {order.deliveryAddress.pincode}
                  </p>
                  <a href={`tel:${order.deliveryAddress.phone}`}
                    className="mt-2 inline-flex items-center gap-1.5 text-sm text-brand-600 font-semibold hover:text-brand-800">
                    📞 {order.deliveryAddress.phone}
                  </a>
                </div>
              )}

              {/* Tracking history */}
              {order?.deliveryTracking?.length > 0 && (
                <div className="card p-5">
                  <h3 className="font-display font-bold text-ink-900 mb-4">Tracking History</h3>
                  <div className="space-y-3">
                    {order.deliveryTracking.map((t, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <div className="w-2 h-2 rounded-full bg-brand-400 mt-1.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-semibold text-ink-800">{t.status?.replace(/_/g," ")}</p>
                          {t.message && <p className="text-xs text-ink-500">{t.message}</p>}
                          <p className="text-xs text-ink-400 mt-0.5">
                            {t.timestamp && new Date(t.timestamp).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
