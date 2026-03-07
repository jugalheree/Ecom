import { useEffect, useState } from "react";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Loader from "../../components/ui/Loader";
import api from "../../services/api";
import { useToastStore } from "../../store/toastStore";

const statusStyles = {
  ASSIGNED: "warning",
  PICKED_UP: "info",
  OUT_FOR_DELIVERY: "info",
  DELIVERED: "success",
};

export default function DeliveryOrders() {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const showToast = useToastStore((s) => s.showToast);

  const fetchDeliveries = () => {
    api
      .get("/api/delivery/deliveries")
      .then((res) => setDeliveries(res.data.data?.deliveries || []))
      .catch(() => setDeliveries([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    setLoading(true);
    fetchDeliveries();
  }, []);

  const updateStatus = (assignmentId, status) => {
    api
      .patch(`/api/delivery/deliveries/${assignmentId}/status`, { status })
      .then(() => {
        showToast({ message: "Status updated", type: "success" });
        fetchDeliveries();
      })
      .catch((e) => showToast({ message: e?.message || "Failed to update", type: "error" }));
  };

  const markDelivered = (assignmentId) => {
    api
      .post(`/api/delivery/deliveries/${assignmentId}/delivered`)
      .then(() => {
        showToast({ message: "Marked as delivered", type: "success" });
        fetchDeliveries();
      })
      .catch((e) => showToast({ message: e?.message || "Failed", type: "error" }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container-app py-12">
        <div className="mb-12">
          <h1 className="text-5xl md:text-6xl font-display font-bold text-ink-900 mb-4">
            Assigned deliveries
          </h1>
          <p className="text-xl text-ink-600">
            Update status for each delivery
          </p>
        </div>
        <div className="space-y-4">
          {deliveries.length === 0 ? (
            <Card className="p-8 text-center text-ink-500 border-2 border-ink-200">No deliveries assigned.</Card>
          ) : (
            deliveries.map((d) => (
              <Card key={d._id} className="p-6 border-2 border-ink-200 hover:border-primary-300 transition-all duration-300">
                <div className="flex flex-wrap justify-between items-start gap-4">
                  <div>
                    <p className="font-semibold text-ink-900">{d.orderId}</p>
                    <p className="text-ink-600 mt-1">{d.address}</p>
                    <p className="text-sm text-ink-500 mt-1">{d.customerName} • {d.phone}</p>
                  </div>
                  <Badge type={statusStyles[d.status] || "default"}>{d.status?.replace(/_/g, " ")}</Badge>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {d.status === "ASSIGNED" && (
                    <Button variant="accent" className="text-sm" onClick={() => updateStatus(d._id, "PICKED_UP")}>
                      Picked up
                    </Button>
                  )}
                  {d.status === "PICKED_UP" && (
                    <Button variant="accent" className="text-sm" onClick={() => updateStatus(d._id, "OUT_FOR_DELIVERY")}>
                      Out for delivery
                    </Button>
                  )}
                  {(d.status === "ASSIGNED" || d.status === "PICKED_UP" || d.status === "OUT_FOR_DELIVERY") && (
                    <Button variant="primary" className="text-sm" onClick={() => markDelivered(d._id)}>
                      Mark delivered
                    </Button>
                  )}
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
