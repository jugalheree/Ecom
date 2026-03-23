import { Link, useNavigate } from "react-router-dom";
import { useCartStore } from "../store/cartStore";
import { useToastStore } from "../store/toastStore";

export default function Cart() {
  const cart = useCartStore((s) => s.cart);
  const removeFromCart = useCartStore((s) => s.removeFromCart);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const showToast = useToastStore((s) => s.showToast);
  const navigate = useNavigate();

  const subtotal = cart.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0);
  const shipping = subtotal > 499 ? 0 : 49;
  const total = subtotal + shipping;

  if (cart.length === 0) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-sand-50">
        <div className="text-center">
          <div className="w-24 h-24 mx-auto bg-sand-100 rounded-full flex items-center justify-center text-5xl mb-6">🛒</div>
          <h2 className="text-2xl font-display font-bold text-ink-900">Your cart is empty</h2>
          <p className="text-ink-500 mt-2 mb-8">Looks like you haven't added anything yet.</p>
          <Link to="/market">
            <button className="btn-primary px-8 py-3">Browse Marketplace →</button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sand-50 py-10">
      <div className="container-app">
        <h1 className="text-3xl font-display font-bold text-ink-900 mb-8">Shopping Cart
          <span className="text-base font-sans font-normal text-ink-400 ml-3">({cart.length} item{cart.length !== 1 ? "s" : ""})</span>
        </h1>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Cart items */}
          <div className="flex-1 space-y-4">
            {cart.map((item) => (
              <div key={item._id || item.productId} className="card p-5 flex gap-4 items-start">
                {/* Image */}
                <div className="w-20 h-20 rounded-xl bg-sand-100 flex items-center justify-center text-3xl flex-shrink-0 overflow-hidden">
                  {item.imageUrl ? <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" /> : "🛍️"}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-ink-900 text-sm leading-snug line-clamp-2">{item.name}</h3>
                  {item.vendor && <p className="text-xs text-ink-400 mt-0.5">by {item.vendor}</p>}
                  <div className="flex items-center justify-between mt-3 gap-3 flex-wrap">
                    {/* Quantity */}
                    <div className="flex items-center border border-ink-200 rounded-xl overflow-hidden bg-white">
                      <button
                        onClick={() => { if ((item.quantity || 1) <= 1) { removeFromCart(item._id || item.productId); showToast({ message: "Removed from cart", type: "info" }); } else updateQuantity(item._id || item.productId, (item.quantity || 1) - 1); }}
                        className="px-3 py-1.5 text-ink-500 hover:bg-ink-50 text-lg font-medium transition-colors">−</button>
                      <span className="px-3 py-1.5 text-sm font-semibold text-ink-900 min-w-[28px] text-center">{item.quantity || 1}</span>
                      <button
                        onClick={() => updateQuantity(item._id || item.productId, (item.quantity || 1) + 1)}
                        className="px-3 py-1.5 text-ink-500 hover:bg-ink-50 text-lg font-medium transition-colors">+</button>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className="font-bold text-ink-900">₹{((item.price || 0) * (item.quantity || 1)).toLocaleString()}</span>
                      <button
                        onClick={() => { removeFromCart(item._id || item.productId); showToast({ message: "Removed from cart", type: "info" }); }}
                        className="text-xs text-danger-500 hover:text-danger-600 font-medium transition-colors">Remove</button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order summary */}
          <div className="w-full lg:w-80 flex-shrink-0">
            <div className="card p-6 sticky top-24">
              <h2 className="text-lg font-display font-bold text-ink-900 mb-5">Order Summary</h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-ink-600">
                  <span>Subtotal ({cart.length} items)</span>
                  <span>₹{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-ink-600">
                  <span>Shipping</span>
                  {shipping === 0
                    ? <span className="text-success-600 font-medium">FREE</span>
                    : <span>₹{shipping}</span>}
                </div>
                {shipping > 0 && (
                  <p className="text-xs text-ink-400 bg-sand-50 rounded-lg p-2.5">
                    Add ₹{(499 - subtotal).toLocaleString()} more for free shipping
                  </p>
                )}
                <div className="border-t border-ink-100 pt-3 flex justify-between font-bold text-base text-ink-900">
                  <span>Total</span>
                  <span>₹{total.toLocaleString()}</span>
                </div>
              </div>

              <button onClick={() => navigate("/checkout")} className="btn-primary w-full py-3.5 text-base mt-6">
                Proceed to Checkout →
              </button>

              <Link to="/market" className="block text-center text-sm text-ink-500 hover:text-ink-700 mt-4 transition-colors">
                ← Continue Shopping
              </Link>

              {/* Trust badges */}
              <div className="mt-5 pt-4 border-t border-ink-100 space-y-2">
                {[
                  { icon: "🔒", text: "Secure Escrow Payment" },
                  { icon: "↩️", text: "Easy 7-day Returns" },
                  { icon: "✅", text: "AI Verified Products" },
                ].map((b, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-ink-500">
                    <span>{b.icon}</span>
                    <span>{b.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
