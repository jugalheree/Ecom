import { useEffect, useState } from "react";
import api from "../../services/api";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import { useNavigate } from "react-router-dom";

export default function VendorTrade() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchOrders = () => {
    api
      .get("/api/orders/vendor")
      .then((res) => {
        setOrders(res.data.data?.orders || []);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateStatus = async (id, status) => {
    await api.patch(`/api/orders/${id}/status`, { status });

    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
  };

  const statusColor = (status) => {
    if (status === "PENDING")
      return "bg-amber-50 text-amber-700 border-amber-200";
    if (status === "SHIPPED")
      return "bg-purple-50 text-purple-700 border-purple-200";
    if (status === "DELIVERED")
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    if (status === "CANCELLED") return "bg-red-50 text-red-700 border-red-200";
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="container-app py-12">
        <div className="mb-12">
          <h1 className="text-5xl font-display font-bold text-stone-900 mb-4">
            Vendor Orders
          </h1>
          <p className="text-xl text-stone-600">Manage incoming orders.</p>
        </div>

        {loading ? (
          <p>Loading orders...</p>
        ) : orders.length === 0 ? (
          <p>No orders found.</p>
        ) : (
          <div className="space-y-8">
            {orders.map((order) => (
              <Card
                key={order.id}
                onClick={() => navigate(`/vendor/orders/${order.id}`)}
                className="p-8 border-2 border-stone-200 hover:border-black transition-all duration-300 cursor-pointer"
              >
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <p className="text-sm text-stone-500">
                      {new Date(order.date).toLocaleDateString()}
                    </p>
                    <h3 className="font-semibold text-xl mt-2 text-stone-900">
                      {order.buyer}
                    </h3>
                    <p className="text-stone-600 mt-1">Total: ₹{order.total}</p>
                  </div>

                  <span
                    className={`text-xs px-4 py-2 rounded-full font-semibold border-2 ${statusColor(
                      order.status
                    )}`}
                  >
                    {order.status}
                  </span>
                </div>

                <div className="border-2 border-stone-200 rounded-xl p-4 bg-stone-50 space-y-2 mb-6">
                  {order.items.map((item, i) => (
                    <div
                      key={i}
                      className="flex justify-between text-sm text-stone-700"
                    >
                      <span>
                        {item.name} × {item.qty}
                      </span>
                    </div>
                  ))}
                </div>

                {order.status === "PENDING" && (
                  <div className="flex gap-3">
                    <Button onClick={() => updateStatus(order.id, "SHIPPED")}>
                      Mark as Shipped
                    </Button>

                    <Button
                      variant="outline"
                      onClick={() => updateStatus(order.id, "CANCELLED")}
                    >
                      Cancel Order
                    </Button>
                  </div>
                )}

                {order.status === "SHIPPED" && (
                  <Button onClick={() => updateStatus(order.id, "DELIVERED")}>
                    Mark as Delivered
                  </Button>
                )}

                {order.status === "DELIVERED" && (
                  <p className="text-emerald-600 font-medium text-sm">
                    Order completed ✔
                  </p>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
