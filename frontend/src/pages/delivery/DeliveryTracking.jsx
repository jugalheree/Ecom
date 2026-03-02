import { useEffect, useState } from "react";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Loader from "../../components/ui/Loader";
import api from "../../services/api";
import { useToastStore } from "../../store/toastStore";

export default function DeliveryTracking() {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null);
  const showToast = useToastStore((s) => s.showToast);

  useEffect(() => {
    api
      .get("/api/delivery/deliveries")
      .then((res) => setDeliveries(res.data.data?.deliveries || []))
      .catch(() => setDeliveries([]))
      .finally(() => setLoading(false));
  }, []);

  const handleUploadProof = (assignmentId) => {
    api
      .post(`/api/delivery/deliveries/${assignmentId}/proof`, {})
      .then(() => {
        showToast({ message: "Proof of delivery uploaded (mock)", type: "success" });
        setSelectedId(null);
        api.get("/api/delivery/deliveries").then((res) => setDeliveries(res.data.data?.deliveries || []));
      })
      .catch((e) => showToast({ message: e?.message || "Upload failed", type: "error" }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  const steps = ["ASSIGNED", "PICKED_UP", "OUT_FOR_DELIVERY", "DELIVERED"];

  return (
    <div className="min-h-screen bg-white">
      <div className="container-app py-12">
        <div className="mb-12">
          <h1 className="text-5xl md:text-6xl font-display font-bold text-ink-900 mb-4">
            Delivery tracking
          </h1>
          <p className="text-xl text-ink-600">
            Track and upload proof of delivery
          </p>
        </div>
        <div className="space-y-6">
          {deliveries.length === 0 ? (
            <Card className="p-8 text-center text-ink-500 border-2 border-ink-200">No deliveries to track.</Card>
          ) : (
            deliveries.map((d) => (
              <Card key={d._id} className="p-6 border-2 border-ink-200 hover:border-primary-300 transition-all duration-300">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="font-semibold text-ink-900">{d.orderId}</p>
                    <p className="text-ink-600">{d.address}</p>
                  </div>
                  <Badge type={d.status === "DELIVERED" ? "success" : "info"}>{d.status?.replace(/_/g, " ")}</Badge>
                </div>
                <div className="flex gap-2 overflow-x-auto py-2">
                  {steps.map((s, i) => {
                    const idx = steps.indexOf(d.status);
                    const active = i <= idx;
                    return (
                      <div
                        key={s}
                        className={`flex-shrink-0 px-3 py-2 rounded-lg text-xs font-medium ${
                          active ? "bg-primary-100 text-primary-800" : "bg-ink-100 text-ink-500"
                        }`}
                      >
                        {s.replace(/_/g, " ")}
                      </div>
                    );
                  })}
                </div>
                {d.status === "DELIVERED" && (
                  <div className="mt-4 pt-4 border-t border-ink-200">
                    {d.proofUrl ? (
                      <p className="text-sm text-ink-600">Proof: {d.proofUrl}</p>
                    ) : (
                      <Button
                        variant="outline"
                        className="text-sm py-2"
                        onClick={() => handleUploadProof(d._id)}
                        disabled={selectedId === d._id}
                      >
                        Upload proof of delivery (mock)
                      </Button>
                    )}
                  </div>
                )}
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
