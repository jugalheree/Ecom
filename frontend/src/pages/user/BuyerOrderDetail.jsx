import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../services/api";
import BackendMissing from "../../components/ui/BackendMissing";

export default function BuyerOrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [backendMissing, setBackendMissing] = useState(false);

  useEffect(() => {
    // NOTE: GET /api/orders/buyer does not exist in the backend yet.
    api.get("/api/orders/buyer").then((res) => {
      const orders = res.data.data?.orders || res.data.data || [];
      const found = orders.find((o) => o._id === id);
      setOrder(found || null);
    }).catch(() => setBackendMissing(true));
  }, [id]);

  if (backendMissing) return (
    <div className="container-app py-16">
      <BackendMissing
        method="GET"
        endpoint="/api/orders/buyer"
        todo="Implement GET /api/orders/buyer to return all orders placed by the logged-in buyer"
      />
    </div>
  );

  if (!order) return <div>Loading...</div>;

  return (
    <div className="container-app py-16">
      <h1 className="text-3xl font-bold mb-6">Order Details</h1>
      {/* Order model: items[{ productId, vendorId, quantity, priceAtPurchase }], totalAmount, orderStatus, paymentStatus */}
      {order.items?.map((item, i) => (
        <div key={i} className="mb-4 border-b pb-2">
          <p>{item.productId?.title || item.productId}</p>
          <p>Qty: {item.quantity}</p>
          <p>₹{item.priceAtPurchase * item.quantity}</p>
        </div>
      ))}
      <p className="mt-4 text-sm text-ink-500">Status: {order.orderStatus}</p>
      <p className="mt-2 font-semibold">Total: ₹{order.totalAmount}</p>
    </div>
  );
}