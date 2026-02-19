import { useCartStore } from "../store/cartStore";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import { useNavigate, Link } from "react-router-dom";

export default function Cart() {
  const cart = useCartStore((s) => s.cart);
  const removeFromCart = useCartStore((s) => s.removeFromCart);
  const updateQty = useCartStore((s) => s.updateQty);
  const navigate = useNavigate();

  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.qty,
    0
  );

  const platformFee = Math.round(subtotal * 0.02);
  const total = subtotal + platformFee;

  // EMPTY STATE
  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="container-app text-center">

          <div className="text-6xl mb-6">🛒</div>

          <h1 className="text-4xl font-display font-semibold text-stone-900">
            Your cart is empty
          </h1>

          <p className="text-stone-600 mt-3 text-lg">
            Browse the marketplace and add products to your cart.
          </p>

          <Link to="/market">
            <Button className="mt-8 px-8 py-3">
              Explore marketplace
            </Button>
          </Link>

        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container-app py-12 space-y-10">

        {/* Header */}
        <div>
          <h1 className="text-5xl mt-16 md:text-6xl font-display font-bold text-stone-900 mb-4">
            Shopping cart
          </h1>
          <p className="text-xl text-stone-600">
            Review your items and proceed to checkout.
          </p>
        </div>

        <div className="grid lg:grid-cols-[1fr_420px] gap-10">

          {/* Items */}
          <div className="space-y-8">

            {cart.map((item) => (
              <Card key={item.id} className="p-8 border-2 border-stone-200 flex gap-8 items-center">

                <div className="w-28 h-28 rounded-2xl bg-stone-100 flex items-center justify-center text-stone-400">
                  Image
                </div>

                <div className="flex-1">
                  <h3 className="font-semibold text-xl text-stone-900">
                    {item.name}
                  </h3>

                  <p className="text-sm text-stone-600 mt-1">
                    AI score: {item.ai}
                  </p>

                  <div className="flex items-center gap-5 mt-5">

                    <div className="flex items-center border border-stone-300 rounded-xl overflow-hidden">
                      <button
                        className="px-4 py-2 hover:bg-stone-100 transition"
                        onClick={() =>
                          updateQty(item.id, Math.max(1, item.qty - 1))
                        }
                      >
                        −
                      </button>

                      <span className="px-4 py-2 border-x border-stone-200 min-w-[48px] text-center font-medium">
                        {item.qty}
                      </span>

                      <button
                        className="px-4 py-2 hover:bg-stone-100 transition"
                        onClick={() => updateQty(item.id, item.qty + 1)}
                      >
                        +
                      </button>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-sm text-red-500 hover:text-red-600 font-medium"
                    >
                      Remove
                    </button>

                  </div>
                </div>

                <div className="font-semibold text-xl text-stone-900">
                  ₹{item.price * item.qty}
                </div>

              </Card>
            ))}

          </div>

          {/* Summary */}
          <Card className="p-10 border-2 border-stone-200 h-fit sticky top-24">

            <h2 className="text-2xl font-semibold text-stone-900 mb-8">
              Order summary
            </h2>

            <div className="space-y-4 text-stone-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{subtotal}</span>
              </div>

              <div className="flex justify-between">
                <span>Platform fee</span>
                <span>₹{platformFee}</span>
              </div>
            </div>

            <div className="border-t border-stone-200 my-6"></div>

            <div className="flex justify-between text-xl font-bold text-stone-900 mb-6">
              <span>Total</span>
              <span>₹{total}</span>
            </div>

            <p className="text-sm text-stone-500 mb-6">
              Payments are secured using escrow wallet protection.
            </p>

            <Button className="w-full py-3" onClick={() => navigate("/checkout")}>
              Proceed to checkout
            </Button>

          </Card>

        </div>
      </div>
    </div>
  );
}
