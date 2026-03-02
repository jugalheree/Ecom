import { useEffect, useState } from "react";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Loader from "../../components/ui/Loader";
import api from "../../services/api";
import { useNavigate } from "react-router-dom";

const statusStyles = {
  ASSIGNED: "warning",
  PICKED_UP: "info",
  OUT_FOR_DELIVERY: "info",
  DELIVERED: "success",
};

export default function DeliveryDashboard() {
  const navigate = useNavigate();
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/api/delivery/deliveries")
      .then((res) => setDeliveries(res.data.data?.deliveries || []))
      .catch(() => setDeliveries([]))
      .finally(() => setLoading(false));
  }, []);

  const assigned = deliveries.filter((d) => d.status !== "DELIVERED").length;
  const delivered = deliveries.filter((d) => d.status === "DELIVERED").length;

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  const stats = [
    { title: "Active deliveries", value: assigned, icon: "📦", gradient: "from-primary-500 to-primary-600" },
    { title: "Delivered", value: delivered, icon: "✅", gradient: "from-emerald-500 to-emerald-600" },
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="container-app py-12">
        <div className="mb-12">
          <h1 className="text-5xl md:text-6xl font-display font-bold text-ink-900 mb-4">
            Delivery dashboard
          </h1>
          <p className="text-xl text-ink-600">
            Your assigned deliveries and status.
          </p>
        </div>

        <div className="space-y-8">
          <div className="grid sm:grid-cols-2 gap-6">
            {stats.map((s, i) => (
              <Card key={i} className="p-6 border-2 border-ink-200 hover:border-primary-300 transition-all duration-300 group">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${s.gradient} flex items-center justify-center text-2xl mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  {s.icon}
                </div>
                <p className="text-sm text-ink-600 font-medium uppercase tracking-wide mb-2">{s.title}</p>
                <p className="text-3xl font-bold text-ink-900">{s.value}</p>
              </Card>
            ))}
          </div>

          <Card className="p-8 border-2 border-ink-200 hover:border-primary-300 transition-all duration-300">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-2xl font-semibold text-ink-900 mb-2">Recent assignments</h3>
                <p className="text-ink-600">Latest deliveries assigned to you</p>
              </div>
              <Button variant="outline" onClick={() => navigate("/delivery/orders")}>
                View all
              </Button>
            </div>
            {deliveries.length === 0 ? (
              <p className="text-ink-500 py-4">No deliveries assigned.</p>
            ) : (
              <div className="space-y-4">
                {deliveries.slice(0, 5).map((d) => (
                  <div
                    key={d._id}
                    className="flex justify-between items-center p-4 border-2 border-ink-200 rounded-xl hover:border-primary-300 transition-all duration-300"
                  >
                    <div>
                      <p className="font-semibold text-ink-900">{d.orderId}</p>
                      <p className="text-sm text-ink-600 mt-1">{d.address}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge type={statusStyles[d.status] || "default"}>{d.status?.replace(/_/g, " ")}</Badge>
                      <Button variant="outline" className="py-1.5 text-xs" onClick={() => navigate("/delivery/orders")}>
                        View
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
