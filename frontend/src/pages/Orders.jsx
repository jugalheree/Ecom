import { useOrderStore } from "../store/orderStore";
import Card from "../components/ui/Card";

const STATUS_STEPS = ["Placed", "Processing", "Shipped", "Delivered"];

export default function Orders() {
  const orders = useOrderStore((s) => s.orders);

  return (
    <div className="max-w-7xl mx-auto px-4 py-16">

      {/* HEADER */}
      <div className="mb-12">
        <h1 className="text-4xl font-semibold tracking-tight">My Orders</h1>
        <p className="text-slate-600 mt-2">
          Track your purchases and delivery status.
        </p>
      </div>

      {/* EMPTY */}
      {orders.length === 0 && (
        <div className="text-center py-32">
          <p className="text-2xl font-semibold">No orders yet 📦</p>
          <p className="text-slate-600 mt-2">
            Once you place an order, tracking will appear here.
          </p>
        </div>
      )}

      {/* ORDERS */}
      <div className="space-y-10">
        {orders.map((order, index) => {
          const currentStep = order.status || "Placed";
          const activeIndex = STATUS_STEPS.indexOf(currentStep);

          return (
            <Card key={index} className="p-8 space-y-6">

              {/* TOP BAR */}
              <div className="flex flex-wrap justify-between items-center gap-4">
                <div>
                  <p className="text-sm text-slate-500">
                    Order #{index + 1}
                  </p>
                  <p className="text-xl font-semibold">₹{order.total}</p>
                </div>

                <span className="px-4 py-1.5 rounded-full text-sm bg-blue-100 text-blue-700 font-medium">
                  {currentStep}
                </span>
              </div>

              {/* TRACKER */}
              <div className="flex items-center justify-between mt-6">
                {STATUS_STEPS.map((step, i) => (
                  <div key={step} className="flex-1 flex items-center">

                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold
                      ${i <= activeIndex ? "bg-green-500 text-white" : "bg-slate-200 text-slate-500"}`}
                    >
                      {i + 1}
                    </div>

                    <p className={`ml-3 text-sm font-medium
                      ${i <= activeIndex ? "text-green-600" : "text-slate-400"}`}>
                      {step}
                    </p>

                    {i !== STATUS_STEPS.length - 1 && (
                      <div
                        className={`flex-1 h-[2px] mx-4
                        ${i < activeIndex ? "bg-green-500" : "bg-slate-200"}`}
                      />
                    )}
                  </div>
                ))}
              </div>

              {/* ITEMS */}
              <div className="space-y-4 border-t pt-6">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-center"
                  >
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-slate-500">
                        Qty {item.qty}
                      </p>
                    </div>

                    <p className="font-medium">
                      ₹{item.price * item.qty}
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
