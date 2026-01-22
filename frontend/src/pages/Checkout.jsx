import { useCartStore } from "../store/cartStore";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import { useNavigate } from "react-router-dom";
import { useWalletStore } from "../store/walletStore";
import { useOrderStore } from "../store/orderStore";
import { useToastStore } from "../store/toastStore";


export default function Checkout() {
  const cart = useCartStore((s) => s.cart);
  const clearCart = useCartStore((s) => s.clearCart);
  const navigate = useNavigate();
  const holdAmount = useWalletStore((s) => s.holdAmount);
  const addOrder = useOrderStore((s) => s.addOrder);
  const showToast = useToastStore((s) => s.showToast);


  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  if (cart.length === 0) {
    return (
      <div className="container-app py-10">
        <h1>Checkout</h1>
        <p className="text-slate-600 mt-4">Your cart is empty.</p>
      </div>
    );
  }

  return (
    <div className="container-app py-10 grid md:grid-cols-3 gap-6">
      {/* LEFT */}
      <div className="md:col-span-2 space-y-4">
        <Card>
          <h3>Delivery details</h3>
          <div className="grid md:grid-cols-2 gap-4 mt-4">
            <Input label="Full Name" placeholder="Enter name" />
            <Input label="Phone" placeholder="Enter phone number" />
            <Input label="City" placeholder="Enter city" />
            <Input label="Pincode" placeholder="Enter pincode" />
          </div>
          <Input
            label="Full Address"
            placeholder="House no, street, area"
            className="mt-4"
          />
        </Card>

        <Card>
          <h3>Order items</h3>
          <div className="space-y-3 mt-3">
            {cart.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span>
                  {item.name} × {item.qty}
                </span>
                <span>₹{item.price * item.qty}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* RIGHT */}
      <Card className="h-fit">
        <h3>Summary</h3>
        <p className="text-slate-600 mt-2">Total: ₹{total}</p>

        <Button
          className="w-full mt-4"
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
          Place Order
        </Button>
      </Card>
    </div>
  );
}
