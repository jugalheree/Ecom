import { useOrderStore } from "../store/orderStore";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { useNavigate } from "react-router-dom";

const STATUS_STEPS = ["Placed", "Processing", "Shipped", "Delivered"];

export default function Orders() {
  const navigate = useNavigate();
  const orders = useOrderStore((s) => s.orders);

  // EMPTY STATE (fullscreen center)
  if (orders.length === 0) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="container-app text-center">

          <div className="text-6xl mb-6">📦</div>

          <h1 className="text-4xl font-display font-semibold text-stone-900">
            No orders yet
          </h1>

          <p className="text-stone-600 mt-3 text-lg">
            Once you place an order, tracking will appear here.
          </p>

          <Button className="mt-8 px-8 py-3" onClick={() => navigate("/market")}>
            Explore marketplace
          </Button>

        </div>
      </div>
    );
  }

  // NORMAL PAGE
  return (
    <div className="min-h-screen  mt-16 bg-white">
      <div className="container-app py-12 space-y-10">

        {/* Header */}
        <div>
          <h1 className="text-5xl md:text-6xl font-display font-bold text-stone-900 mb-4">
            My orders
          </h1>
          <p className="text-xl text-stone-600">
            Track your purchases and delivery status.
          </p>
        </div>

        {/* Orders list */}
        <div className="space-y-10">
          {orders.map((order, index) => {
            const currentStep = order.status || "Placed";
            const activeIndex = STATUS_STEPS.indexOf(currentStep);

            return (
              <Card key={index} className="p-10 border-2 border-stone-200 space-y-8">

                {/* Order header */}
                <div className="flex justify-between items-center flex-wrap gap-4">
                  <div>
                    <p className="text-sm text-stone-500">
                      Order #{index + 1}
                    </p>
                    <p className="text-2xl font-bold text-stone-900">
                      ₹{order.total}
                    </p>
                  </div>

                  <span className="px-4 py-2 rounded-full text-sm bg-primary-50 text-primary-700 font-medium border border-primary-100">
                    {currentStep}
                  </span>
                </div>

                {/* Timeline */}
                <div className="relative mt-6">
                  <div className="absolute top-5 left-[10%] right-[10%] h-[2px] bg-stone-200" />

                  <div className="flex justify-between">
                    {STATUS_STEPS.map((step, i) => (
                      <div key={step} className="flex flex-col items-center z-10">

                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold
                          ${i <= activeIndex
                              ? "bg-primary-600 text-white"
                              : "bg-stone-200 text-stone-500"}`}
                        >
                          {i + 1}
                        </div>

                        <p
                          className={`mt-2 text-xs font-medium text-center
                          ${i <= activeIndex
                              ? "text-primary-600"
                              : "text-stone-400"}`}
                        >
                          {step}
                        </p>

                      </div>
                    ))}
                  </div>
                </div>

                {/* Items */}
                <div className="space-y-4 border-t border-stone-200 pt-6">
                  {order.items?.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between items-center py-2"
                    >
                      <div>
                        <p className="font-medium text-stone-900">
                          {item.name}
                        </p>
                        <p className="text-sm text-stone-500">
                          Qty {item.qty}
                        </p>
                      </div>

                      <p className="font-semibold text-stone-900">
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
    </div>
  );
}
