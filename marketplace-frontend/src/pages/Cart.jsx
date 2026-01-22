import { useCartStore } from "../store/cartStore";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import { useNavigate } from "react-router-dom";

export default function Cart() {
  const cart = useCartStore((s) => s.cart);
  const removeFromCart = useCartStore((s) => s.removeFromCart);
  const navigate = useNavigate();

  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  return (
    <div className="container-app py-10">
      <h1>Your Cart</h1>

      {cart.length === 0 && (
        <div className="mt-10 text-center">
          <p className="text-lg font-semibold">Your cart is empty 🛒</p>
          <p className="text-slate-600 mt-2">
            Looks like you haven’t added anything yet.
          </p>
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-6 mt-6">
        <div className="md:col-span-2 space-y-4">
          {cart.map((item) => (
            <Card key={item.id} className="flex justify-between items-center">
              <div>
                <h3>{item.name}</h3>
                <p className="text-sm text-slate-600">
                  ₹{item.price} × {item.qty}
                </p>
              </div>

              <Button variant="danger" onClick={() => removeFromCart(item.id)}>
                Remove
              </Button>
            </Card>
          ))}
        </div>

        <Card className="h-fit">
          <h3>Summary</h3>
          <p className="text-slate-600 mt-2">Total: ₹{total}</p>

          <Button className="w-full mt-4" onClick={() => navigate("/checkout")}>
            Proceed to Checkout
          </Button>
        </Card>
      </div>
    </div>
  );
}
