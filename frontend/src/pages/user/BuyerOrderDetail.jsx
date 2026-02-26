import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../services/api";

export default function BuyerOrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    api.get("/api/orders/buyer").then((res) => {
      const found = res.data.data.orders.find(
        (o) => o._id === id
      );
      setOrder(found);
    });
  }, [id]);

  if (!order) return <div>Loading...</div>;

  return (
    <div className="container-app py-16">
      <h1 className="text-3xl font-bold mb-6">
        Order Details
      </h1>

      {order.items.map((item, i) => (
        <div key={i} className="mb-4 border-b pb-2">
          <p>{item.name}</p>
          <p>Qty: {item.qty}</p>
          <p>₹{item.price * item.qty}</p>
        </div>
      ))}

      <p className="mt-6 font-semibold">
        Total: ₹{order.totalAmount}
      </p>
    </div>
  );
}