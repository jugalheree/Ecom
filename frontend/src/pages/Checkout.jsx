import { useCartStore } from "../store/cartStore";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import { useNavigate } from "react-router-dom";
import { useWalletStore } from "../store/walletStore";
import { useToastStore } from "../store/toastStore";

export default function Checkout() {
  const cart = useCartStore((s) => s.cart);
  const clearCart = useCartStore((s) => s.clearCart);
  const navigate = useNavigate();
  const holdAmount = useWalletStore((s) => s.holdAmount);
  const addOrder = addOrder({
    items: cart,
    total,
    status: "processing",
    createdAt: new Date().toISOString(),
  });
  const showToast = useToastStore((s) => s.showToast);

  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.qty,
    0
  );

  const platformFee = Math.round(subtotal * 0.02);
  const total = subtotal + platformFee;

  if (cart.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center">
        <h1 className="text-3xl font-semibold">Checkout</h1>
        <p className="text-slate-600 mt-2">Your cart is empty.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-16">

      {/* HEADER */}
      <div className="mb-10">
        <h1 className="text-4xl font-semibold tracking-tight">
          Checkout
        </h1>
        <p className="text-slate-600 mt-2">
          Complete your order securely.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-10">

        {/* LEFT */}
        <div className="md:col-span-2 space-y-8">

          {/* DELIVERY */}
          <Card className="p-8">
            <h2 className="text-xl font-semibold mb-4">
              Delivery details
            </h2>

            <div className="grid md:grid-cols-2 gap-4">
              <Input label="Full name" placeholder="Enter name" />
              <Input label="Phone" placeholder="Enter phone number" />
              <Input label="City" placeholder="Enter city" />
              <Input label="Pincode" placeholder="Enter pincode" />
              <Input
              label="Full address"
              placeholder="House no, street, area"
              
            />
            </div>

            
          </Card>

          {/* ITEMS */}
          <Card className="p-8">
            <h2 className="text-xl font-semibold mb-4">
              Order items
            </h2>

            <div className="space-y-4">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between items-start border-b last:border-b-0 pb-3 last:pb-0"
                >
                  <div>
                    <p className="font-medium">
                      {item.name}
                    </p>
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

        </div>

        {/* RIGHT */}
        <div>
          <Card className="p-8 sticky top-24">

            <h2 className="text-xl font-semibold mb-6">
              Order summary
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

            <div className="bg-slate-50 rounded-lg p-3 text-xs text-slate-600 mb-6">
              Payment will be secured using escrow wallet protection.
            </div>

            <Button
              className="w-full"
              onClick={() => {
                holdAmount(total);

                addOrder({
                  items: cart,
                  total,
                });

                clearCart();
                showToast({
                  type: "success",
                  message: "Order placed successfully",
                });

                navigate("/orders");
              }}
            >
              Place order
            </Button>

          </Card>
        </div>

      </div>
    </div>
  );
}
