import { useEffect } from "react";
import { useCartStore } from "../store/cartStore";
import { useToastStore } from "../store/toastStore";
import { useAuthStore } from "../store/authStore";
import { useNavigate, Link } from "react-router-dom";

export default function Cart() {
  const { cart, loading, fetchCart, removeFromCart, updateQty } = useCartStore();
  const showToast = useToastStore((s) => s.showToast);
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();

  useEffect(() => { if (user) fetchCart(); }, [user]);

  const handleRemove = async (productId) => {
    const result = await removeFromCart(productId);
    if (!result.success) showToast({ message: result.message, type: "error" });
  };
  const handleQtyChange = async (productId, newQty) => {
    if (newQty < 1) return;
    const result = await updateQty(productId, newQty);
    if (!result.success) showToast({ message: result.message, type: "error" });
  };

  const subtotal = cart.reduce((sum, item) => sum + (item.priceAtTime || 0) * item.quantity, 0);
  const platformFee = Math.round(subtotal * 0.02);
  const total = subtotal + platformFee;

  const EmptyState = ({ icon, title, desc, href, cta }) => (
    <div className="min-h-screen bg-ink-50 flex items-center justify-center mt-[72px]">
      <div className="text-center">
        <div className="w-20 h-20 bg-white border-2 border-ink-200 rounded-2xl flex items-center justify-center text-4xl mx-auto mb-6 shadow-sm">{icon}</div>
        <h2 className="text-2xl font-display font-bold text-ink-900 mb-2">{title}</h2>
        <p className="text-ink-500 text-sm mb-8">{desc}</p>
        <Link to={href}><button className="bg-ink-900 text-white font-display font-semibold px-7 py-3 rounded-xl hover:bg-ink-800 transition-all active:scale-[0.97]">{cta}</button></Link>
      </div>
    </div>
  );

  if (!user) return <EmptyState icon="🔒" title="Please sign in" desc="You need to be logged in to view your cart." href="/login" cta="Sign in" />;
  if (loading) return <div className="min-h-screen bg-ink-50 flex items-center justify-center mt-[72px]"><div className="text-center"><div className="w-8 h-8 border-2 border-ink-200 border-t-primary-500 rounded-full animate-spin mx-auto mb-3" /><p className="text-xs font-display font-semibold uppercase tracking-widest text-ink-400">Loading cart</p></div></div>;
  if (cart.length === 0) return <EmptyState icon="🛒" title="Your cart is empty" desc="Browse the marketplace and add products to your cart." href="/market" cta="Explore marketplace" />;

  return (
    <div className="min-h-screen bg-ink-50 mt-[72px]">
      <div className="bg-white border-b border-ink-100">
        <div className="container-app py-8">
          <p className="text-xs font-display font-bold uppercase tracking-widest text-primary-600 mb-2">Shopping</p>
          <h1 className="text-4xl font-display font-bold text-ink-900">Your cart</h1>
          <p className="text-ink-500 text-sm mt-1">{cart.length} item{cart.length !== 1 ? "s" : ""} ready for checkout</p>
        </div>
      </div>

      <div className="container-app py-8">
        <div className="grid lg:grid-cols-[1fr_380px] gap-6">
          <div className="space-y-4">
            {cart.map((item) => {
              const product = item.productId;
              const productId = typeof product === "object" ? product._id : product;
              const title = typeof product === "object" ? product.title : "Product";
              const price = item.priceAtTime || 0;
              return (
                <div key={productId} className="bg-white rounded-2xl border border-ink-200 p-6 flex gap-5 items-center hover:border-ink-300 transition-colors">
                  <div className="w-20 h-20 rounded-xl bg-ink-100 flex items-center justify-center text-2xl flex-shrink-0 font-display">📦</div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-display font-semibold text-ink-900 truncate">{title}</h3>
                    <p className="text-xs text-ink-400 mt-0.5">₹{price} per unit {typeof product === "object" && `· ${product.stock} in stock`}</p>
                    <div className="flex items-center gap-4 mt-3">
                      <div className="flex items-center border border-ink-200 rounded-xl overflow-hidden bg-ink-50">
                        <button onClick={() => handleQtyChange(productId, item.quantity - 1)} className="w-9 h-9 flex items-center justify-center hover:bg-ink-200 transition text-ink-600 text-lg">−</button>
                        <span className="w-10 text-center text-sm font-display font-semibold text-ink-900">{item.quantity}</span>
                        <button onClick={() => handleQtyChange(productId, item.quantity + 1)} className="w-9 h-9 flex items-center justify-center hover:bg-ink-200 transition text-ink-600 text-lg">+</button>
                      </div>
                      <button onClick={() => handleRemove(productId)} className="text-xs text-red-500 hover:text-red-700 font-medium transition-colors">Remove</button>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-lg font-display font-bold text-ink-900">₹{(price * item.quantity).toLocaleString()}</p>
                    <p className="text-xs text-ink-400 mt-0.5">total</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div>
            <div className="bg-white rounded-2xl border border-ink-200 p-6 sticky top-24">
              <h2 className="font-display font-bold text-ink-900 mb-5">Order summary</h2>
              <div className="space-y-3 text-sm text-ink-600">
                <div className="flex justify-between"><span>Subtotal ({cart.length} items)</span><span className="font-medium text-ink-900">₹{subtotal.toLocaleString()}</span></div>
                <div className="flex justify-between"><span>Platform fee (2%)</span><span className="font-medium text-ink-900">₹{platformFee.toLocaleString()}</span></div>
              </div>
              <div className="border-t border-ink-100 my-4" />
              <div className="flex justify-between font-display font-bold text-ink-900 text-lg mb-5">
                <span>Total</span><span>₹{total.toLocaleString()}</span>
              </div>
              <div className="bg-primary-50 border border-primary-100 rounded-xl p-3 mb-5">
                <p className="text-xs text-primary-700 font-medium">🔒 Payments secured via escrow wallet protection</p>
              </div>
              <button onClick={() => navigate("/checkout")} className="w-full bg-ink-900 text-white font-display font-semibold py-3.5 rounded-xl hover:bg-ink-800 transition-all shadow-sm hover:shadow-md active:scale-[0.98]">
                Proceed to checkout →
              </button>
              <Link to="/market" className="block text-center text-xs text-ink-400 hover:text-ink-600 mt-3 transition-colors">Continue shopping</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
