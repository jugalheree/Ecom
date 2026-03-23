import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCartStore } from "../store/cartStore";
import { useToastStore } from "../store/toastStore";
import { orderAPI } from "../services/apis/index";

export default function Checkout() {
  const cart = useCartStore((s) => s.cart);
  const clearCart = useCartStore((s) => s.clearCart);
  const showToast = useToastStore((s) => s.showToast);
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: "", phone: "", street: "", city: "", state: "", pincode: "", paymentMethod: "WALLET" });
  const [loading, setLoading] = useState(false);

  const subtotal = cart.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0);
  const shipping = subtotal > 499 ? 0 : 49;
  const total = subtotal + shipping;

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleOrder = async (e) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.street || !form.city || !form.pincode) {
      showToast({ message: "Please fill all required fields", type: "error" }); return;
    }
    setLoading(true);
    try {
      const res = await orderAPI.placeOrder({
        items: cart.map((c) => ({ productId: c._id || c.productId, quantity: c.quantity || 1 })),
        address: { name: form.name, phone: form.phone, street: form.street, city: form.city, state: form.state, pincode: form.pincode },
        paymentMethod: form.paymentMethod,
      });
      const orderId = res.data?.data?.order?._id;
      if (orderId && form.paymentMethod !== "COD") {
        await orderAPI.payOrder(orderId);
      }
      clearCart?.();
      showToast({ message: "Order placed successfully! 🎉", type: "success" });
      navigate("/orders");
    } catch (err) {
      showToast({ message: err?.message || "Failed to place order", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-sand-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4">🛒</div>
          <h2 className="text-2xl font-display font-bold text-ink-900">Your cart is empty</h2>
          <button onClick={() => navigate("/market")} className="btn-primary mt-6 px-8 py-3">Browse Marketplace →</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sand-50 py-10">
      <div className="container-app max-w-5xl">
        <div className="mb-8">
          <p className="section-label">Order</p>
          <h1 className="text-3xl font-display font-bold text-ink-900 mt-1">Checkout</h1>
        </div>

        <form onSubmit={handleOrder} className="flex flex-col lg:flex-row gap-8">
          {/* Left: Address + Payment */}
          <div className="flex-1 space-y-6">
            {/* Delivery address */}
            <div className="card p-6">
              <h2 className="font-display font-bold text-ink-900 text-lg mb-5 flex items-center gap-2">
                <span className="w-7 h-7 bg-brand-100 text-brand-700 rounded-full text-sm flex items-center justify-center font-bold">1</span>
                Delivery Address
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-ink-700 mb-1.5">Full Name *</label>
                  <input name="name" value={form.name} onChange={handleChange} placeholder="Recipient name" className="input-base" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-ink-700 mb-1.5">Phone *</label>
                  <input name="phone" value={form.phone} onChange={handleChange} placeholder="10-digit mobile" className="input-base" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-semibold text-ink-700 mb-1.5">Street Address *</label>
                  <input name="street" value={form.street} onChange={handleChange} placeholder="House no, street, area" className="input-base" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-ink-700 mb-1.5">City *</label>
                  <input name="city" value={form.city} onChange={handleChange} placeholder="City" className="input-base" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-ink-700 mb-1.5">State</label>
                  <input name="state" value={form.state} onChange={handleChange} placeholder="State" className="input-base" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-ink-700 mb-1.5">Pincode *</label>
                  <input name="pincode" value={form.pincode} onChange={handleChange} placeholder="6-digit pincode" className="input-base" />
                </div>
              </div>
            </div>

            {/* Payment method */}
            <div className="card p-6">
              <h2 className="font-display font-bold text-ink-900 text-lg mb-5 flex items-center gap-2">
                <span className="w-7 h-7 bg-brand-100 text-brand-700 rounded-full text-sm flex items-center justify-center font-bold">2</span>
                Payment Method
              </h2>
              <div className="space-y-2.5">
                {[
                  { value: "WALLET", label: "Trade Wallet", icon: "💳", desc: "Pay from your TradeSphere wallet balance" },
                  { value: "COD",    label: "Cash on Delivery", icon: "💵", desc: "Pay when your order arrives" },
                ].map((m) => (
                  <label key={m.value}
                    className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      form.paymentMethod === m.value ? "border-brand-500 bg-brand-50" : "border-ink-200 bg-white hover:border-ink-300"
                    }`}>
                    <input type="radio" name="paymentMethod" value={m.value} checked={form.paymentMethod === m.value} onChange={handleChange} className="accent-brand-600" />
                    <span className="text-xl">{m.icon}</span>
                    <div>
                      <p className="font-semibold text-ink-900 text-sm">{m.label}</p>
                      <p className="text-xs text-ink-400 mt-0.5">{m.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Order summary */}
          <div className="w-full lg:w-80 flex-shrink-0">
            <div className="card p-6 sticky top-24">
              <h2 className="font-display font-bold text-ink-900 text-lg mb-5 flex items-center gap-2">
                <span className="w-7 h-7 bg-brand-100 text-brand-700 rounded-full text-sm flex items-center justify-center font-bold">3</span>
                Order Summary
              </h2>

              <div className="space-y-3 max-h-48 overflow-y-auto mb-4">
                {cart.map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-sand-100 flex items-center justify-center text-lg flex-shrink-0">
                      {item.imageUrl ? <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover rounded-lg" /> : "🛍️"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-ink-900 line-clamp-1">{item.name}</p>
                      <p className="text-xs text-ink-400">Qty: {item.quantity || 1}</p>
                    </div>
                    <span className="text-xs font-semibold text-ink-900">₹{((item.price || 0) * (item.quantity || 1)).toLocaleString()}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-ink-100 pt-4 space-y-2.5 text-sm">
                <div className="flex justify-between text-ink-600"><span>Subtotal</span><span>₹{subtotal.toLocaleString()}</span></div>
                <div className="flex justify-between text-ink-600"><span>Shipping</span>
                  {shipping === 0 ? <span className="text-success-600 font-medium">FREE</span> : <span>₹{shipping}</span>}
                </div>
                <div className="border-t border-ink-100 pt-2.5 flex justify-between font-bold text-base text-ink-900">
                  <span>Total</span><span>₹{total.toLocaleString()}</span>
                </div>
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 text-base mt-6">
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Placing Order...
                  </span>
                ) : `Place Order · ₹${total.toLocaleString()}`}
              </button>

              <div className="mt-4 space-y-1.5">
                {[{ icon: "🔒", text: "Secure Escrow Payment" }, { icon: "✅", text: "AI Verified Products" }].map((b, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-ink-400">
                    <span>{b.icon}</span><span>{b.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
