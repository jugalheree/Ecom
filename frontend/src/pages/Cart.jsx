import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCartStore } from "../store/cartStore";
import { useAuthStore } from "../store/authStore";
import { useToastStore } from "../store/toastStore";

export default function Cart() {
  const cart = useCartStore((s) => s.cart);
  const fetchCart = useCartStore((s) => s.fetchCart);
  const removeFromCart = useCartStore((s) => s.removeFromCart);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const showToast = useToastStore((s) => s.showToast);
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();

  // Refresh cart on mount (syncs with backend if logged in)
  useEffect(() => { fetchCart(); }, []);

  const getPrice = (item) => item.priceAtTime || item.price || item.productId?.price || 0;
  const subtotal = cart.reduce((sum, item) => sum + getPrice(item) * (item.quantity || 1), 0);
  const shipping = subtotal > 499 ? 0 : 49;
  const total = subtotal + shipping;

  if (cart.length === 0) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-sand-50">
        <div className="text-center px-4">
          <div className="w-24 h-24 mx-auto bg-sand-100 rounded-full flex items-center justify-center text-5xl mb-6">🛒</div>
          <h2 className="text-2xl font-display font-bold text-ink-900">Your cart is empty</h2>
          <p className="text-ink-500 mt-2 mb-8 text-sm">Looks like you haven't added anything yet.</p>
          <Link to="/market"><button className="btn-primary px-8 py-3">Browse Marketplace →</button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sand-50 py-10">
      <div className="container-app">
        <div className="mb-8">
          <p className="section-label">Shopping</p>
          <h1 className="text-3xl font-display font-bold text-ink-900 mt-1">
            Your Cart
            <span className="text-base font-sans font-normal text-ink-400 ml-3">({cart.length} item{cart.length !== 1 ? "s" : ""})</span>
          </h1>
        </div>

        {/* Guest notice */}
        {!user && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3">
            <span className="text-xl flex-shrink-0">ℹ️</span>
            <div className="flex-1">
              <p className="text-sm font-semibold text-amber-800">You're shopping as a guest</p>
              <p className="text-xs text-amber-700 mt-0.5">
                Your cart is saved locally. <Link to="/login?redirect=/checkout" className="underline font-semibold">Sign in</Link> or <Link to="/register?redirect=/checkout" className="underline font-semibold">create an account</Link> to checkout and save your order history.
              </p>
            </div>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Cart items */}
          <div className="flex-1 space-y-3">
            {cart.map((item) => {
              const id = item._id || (typeof item.productId === "object" ? item.productId?._id : item.productId);
              const price = getPrice(item);
              const qty = item.quantity || 1;
              const stock = item.stock ?? item.productId?.stock ?? 99;
              const name = item.name || item.productId?.title || "Product";
              const imageUrl = item.imageUrl || item.productId?.primaryImage?.imageUrl || null;

              return (
                <div key={id} className="card p-5 flex gap-4 items-start hover:shadow-card-hover transition-shadow">
                  {/* Image */}
                  <Link to={`/product/${typeof item.productId === "object" ? item.productId._id : item.productId}`}
                    className="w-20 h-20 rounded-xl bg-sand-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {imageUrl ? <img src={imageUrl} alt={name} className="w-full h-full object-cover" /> : <span className="text-3xl">🛍️</span>}
                  </Link>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <Link to={`/product/${typeof item.productId === "object" ? item.productId._id : item.productId}`}>
                      <h3 className="font-semibold text-ink-900 text-sm leading-snug line-clamp-2 hover:text-brand-700 transition-colors">{name}</h3>
                    </Link>
                    {item.vendor && <p className="text-xs text-ink-400 mt-0.5">by {item.vendor}</p>}

                    <div className="flex items-center justify-between mt-3 gap-3 flex-wrap">
                      {/* Quantity control */}
                      <div className="flex items-center border-2 border-ink-200 rounded-xl overflow-hidden bg-white">
                        <button
                          onClick={() => {
                            if (qty <= 1) {
                              removeFromCart(id);
                              showToast({ message: "Removed from cart", type: "info" });
                            } else {
                              updateQuantity(id, qty - 1);
                            }
                          }}
                          className="px-3 py-1.5 text-ink-500 hover:bg-ink-50 text-lg font-medium transition-colors">−</button>
                        <span className="px-3 py-1.5 text-sm font-semibold text-ink-900 min-w-[28px] text-center">{qty}</span>
                        <button
                          onClick={() => {
                            if (qty >= stock) {
                              showToast({ message: `Only ${stock} in stock`, type: "error" });
                            } else {
                              updateQuantity(id, qty + 1);
                            }
                          }}
                          className="px-3 py-1.5 text-ink-500 hover:bg-ink-50 text-lg font-medium transition-colors">+</button>
                      </div>

                      <div className="flex items-center gap-4">
                        <span className="font-bold text-ink-900">₹{(price * qty).toLocaleString()}</span>
                        {qty > 1 && <span className="text-xs text-ink-400">₹{price.toLocaleString()} each</span>}
                        <button
                          onClick={() => { removeFromCart(id); showToast({ message: "Removed from cart", type: "info" }); }}
                          className="text-xs text-danger-500 hover:text-danger-700 font-medium transition-colors flex items-center gap-1">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                            <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
                          </svg>
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Continue shopping */}
            <Link to="/market" className="flex items-center gap-2 text-sm text-brand-600 hover:text-brand-700 font-semibold mt-2 transition-colors">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
              Continue Shopping
            </Link>
          </div>

          {/* Order Summary */}
          <div className="w-full lg:w-80 flex-shrink-0">
            <div className="card p-6 sticky top-24">
              <h2 className="text-lg font-display font-bold text-ink-900 mb-5">Order Summary</h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-ink-600">
                  <span>Subtotal ({cart.length} item{cart.length !== 1 ? "s" : ""})</span>
                  <span>₹{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-ink-600">
                  <span>Delivery</span>
                  <span className={shipping === 0 ? "text-green-600 font-semibold" : ""}>
                    {shipping === 0 ? "Free" : `₹${shipping}`}
                  </span>
                </div>
                {shipping > 0 && (
                  <p className="text-xs text-ink-400 bg-sand-100 rounded-lg p-2">
                    Add ₹{(500 - subtotal).toLocaleString()} more for free delivery
                  </p>
                )}
                {shipping === 0 && (
                  <p className="text-xs text-green-600 bg-green-50 rounded-lg p-2 font-medium">
                    🎉 You qualify for free delivery!
                  </p>
                )}
                <div className="border-t border-ink-100 pt-3 flex justify-between font-bold text-ink-900 text-base">
                  <span>Total</span>
                  <span>₹{total.toLocaleString()}</span>
                </div>
              </div>

              {user ? (
                <button onClick={() => navigate("/checkout")} className="btn-primary w-full py-3.5 mt-5 text-sm">
                  Proceed to Checkout →
                </button>
              ) : (
                <div className="mt-5 space-y-2">
                  <Link to="/login?redirect=/checkout">
                    <button className="btn-primary w-full py-3.5 text-sm">Sign In to Checkout →</button>
                  </Link>
                  <Link to="/register?redirect=/checkout">
                    <button className="w-full py-3 rounded-xl border-2 border-ink-200 text-sm font-semibold text-ink-600 hover:border-ink-400 transition-all">
                      Create Account
                    </button>
                  </Link>
                  <p className="text-center text-xs text-ink-400">Your cart is saved and won't be lost</p>
                </div>
              )}

              <p className="text-center text-xs text-ink-400 mt-3 flex items-center justify-center gap-1">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
                Secure checkout
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
