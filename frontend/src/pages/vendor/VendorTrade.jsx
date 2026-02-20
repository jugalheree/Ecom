import { useEffect, useState } from "react";
import api from "../../services/api";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";

export default function VendorTrade() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await api.get("/api/orders/vendor");
      setOrders(res.data.data.orders);
    } catch (err) {
      console.error("Failed to fetch orders");
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await api.patch(`/api/orders/${id}/status`, { status });

      setOrders((prev) =>
        prev.map((o) =>
          o.id === id ? { ...o, status } : o
        )
      );
    } catch (err) {
      alert("Status update failed");
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="container-app py-12">
        <h1 className="text-4xl font-bold mb-10">
          Vendor Trade
        </h1>

        {orders.length === 0 ? (
          <p>No orders yet.</p>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <Card key={order.id} className="p-6">
                <h3 className="font-semibold text-lg">
                  {order.buyer}
                </h3>
                <p>Total: ₹{order.total}</p>
                <p>Status: {order.status}</p>

                <div className="mt-4 space-y-2">
                  {order.items.map((item, i) => (
                    <div key={i}>
                      {item.name} × {item.qty}
                    </div>
                  ))}
                </div>

                <div className="mt-4 flex gap-3">
                  {order.status === "Pending" && (
                    <>
                      <Button
                        onClick={() =>
                          updateStatus(order.id, "Accepted")
                        }
                      >
                        Accept
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() =>
                          updateStatus(order.id, "Rejected")
                        }
                      >
                        Reject
                      </Button>
                    </>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
