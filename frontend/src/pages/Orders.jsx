import { useOrderStore } from "../store/orderStore";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import { useEffect, useState } from "react";
import Loader from "../components/ui/Loader";

export default function Orders() {
  const orders = useOrderStore((s) => s.orders);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => setLoading(false), 1000);
  }, []);
  if (loading) return <Loader />;

  return (
    <div className="container-app py-10">
      <h1>My Orders</h1>

      {orders.length === 0 && (
        <p className="text-slate-600 mt-4">
          You haven’t placed any orders yet.
        </p>
      )}

      <div className="space-y-6 mt-6">
        {orders.map((order) => (
          <Card key={order.id}>
            <div className="flex justify-between items-center">
              <div>
                <p className="font-semibold">Order #{order.id}</p>
                <p className="text-sm text-slate-600">{order.date}</p>
              </div>

              <Badge type="info">{order.status}</Badge>
            </div>

            <div className="mt-3 space-y-1 text-sm">
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between">
                  <span>
                    {item.name} × {item.qty}
                  </span>
                  <span>₹{item.price * item.qty}</span>
                </div>
              ))}
            </div>

            <p className="font-semibold mt-3">Total: ₹{order.total}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
