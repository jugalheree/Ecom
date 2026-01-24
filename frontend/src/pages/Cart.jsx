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

  // EMPTY CART
  if (cart.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center">
        <h1 className="text-3xl font-semibold">Your cart is empty 🛒</h1>
        <p className="text-slate-600 mt-2">
          Browse the marketplace and add products to your cart.
        </p>

        <Link to="/market">
          <Button className="mt-6">Explore marketplace</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-16">

      {/* HEADER */}
      <div className="mb-10">
        <h1 className="text-4xl font-semibold tracking-tight">Shopping Cart</h1>
        <p className="text-slate-600 mt-2">
          Review your items and proceed to checkout.
        </p>
      </div>

      {/* LAYOUT */}
      <div className="grid md:grid-cols-3 gap-10">

        {/* CART ITEMS */}
        <div className="md:col-span-2 space-y-6">
          {cart.map((item) => (
            <Card key={item.id} className="p-6 flex gap-6 items-center">

              <div className="w-28 h-28 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400">
                Image
              </div>

              <div className="flex-1">
                <h3 className="font-semibold text-lg">{item.name}</h3>
                <p className="text-sm text-slate-600 mt-1">
                  AI score: {item.ai}
                </p>

                <div className="flex items-center gap-4 mt-4">

                  {/* QTY CONTROLS */}
                  <div className="flex items-center border rounded-lg overflow-hidden">

                    <button
                      className="px-3 py-1 text-lg hover:bg-slate-100"
                      onClick={() =>
                        updateQty(item.id, Math.max(1, item.qty - 1))
                      }
                    >
                      −
                    </button>

                    <span className="px-4 py-1 border-x">
                      {item.qty}
                    </span>

                    <button
                      className="px-3 py-1 text-lg hover:bg-slate-100"
                      onClick={() =>
                        updateQty(item.id, item.qty + 1)
                      }
                    >
                      +
                    </button>

                  </div>

                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-sm text-red-500 hover:underline"
                  >
                    Remove
                  </button>
                </div>
              </div>

              <div className="font-semibold text-lg">
                ₹{item.price * item.qty}
              </div>
            </Card>
          ))}
        </div>

        {/* SUMMARY */}
        <div>
          <Card className="p-8 sticky top-24">

            <h2 className="text-2xl font-semibold mb-6">
              Order Summary
            </h2>

            <div className="space-y-3 text-slate-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{subtotal}</span>
              </div>

              <div className="flex justify-between">
                <span>Platform fee</span>
                <span>₹{platformFee}</span>
              </div>
            </div>

            <div className="border-t my-4"></div>

            <div className="flex justify-between text-lg font-semibold mb-6">
              <span>Total</span>
              <span>₹{total}</span>
            </div>

            <p className="text-xs text-slate-500 mb-6">
              Payments are secured using escrow wallet protection.
            </p>

            <Button
              className="w-full"
              onClick={() => navigate("/checkout")}
            >
              Proceed to checkout
            </Button>

          </Card>
        </div>

      </div>
    </div>
  );
}
