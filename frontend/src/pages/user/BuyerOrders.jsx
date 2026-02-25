import { useEffect, useState } from "react";
import api from "../../services/api";
import Card from "../../components/ui/Card";
import { useNavigate } from "react-router-dom";

export default function BuyerOrders() {
  const [orders, setOrders] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/api/orders/buyer").then((res) => {
      setOrders(res.data.data.orders);
    });
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <div className="container-app py-16">
        <h1 className="text-4xl font-bold mb-8">
          My Orders
        </h1>

        {orders.length === 0 ? (
          <p>No orders found.</p>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <Card
                key={order._id}
                onClick={() =>
                  navigate(`/orders/${order._id}`)
                }
                className="p-6 cursor-pointer hover:border-black transition"
              >
                <p className="text-sm text-stone-500">
                  {new Date(order.createdAt).toLocaleDateString()}
                </p>

                <p className="font-semibold">
                  Order #{order._id}
                </p>

                <p>Status: {order.status}</p>
                <p>Total: ₹{order.totalAmount}</p>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}