import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useCartStore } from "../store/cartStore";
import { useAuthStore } from "../store/authStore";
import { useToastStore } from "../store/toastStore";
import { orderAPI, userAPI, couponAPI } from "../services/apis/index";
import AddressPicker from "../components/ui/AddressPicker";

export default function Checkout() {
  const cart = useCartStore((s) => s.cart);
  const clearCart = useCartStore((s) => s.clearCart);
  const syncGuestCart = useCartStore((s) => s.syncGuestCartToBackend);
  const user = useAuthStore((s) => s.user);
  const showToast = useToastStore((s) => s.showToast);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    street: "", area: "", city: "", state: "", pincode: "",
    paymentMethod: "TRADE_WALLET",
  });
  const [loading, setLoading] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [coupon, setCoupon] = useState(null); // { discountAmount, code, description }
  const [couponLoading, setCouponLoading] = useState(false);

  // Pre-fill name/phone from user profile if logged in
  useEffect(() => {
    if (user) setForm((f) => ({ ...f, name: f.name || user.name || "", phone: f.phone || user.phone || "" }));
  }, [user]);

  // Load saved addresses
  useEffect(() => {
    if (!user) return;
    userAPI.getAddresses()
      .then((res) => {
        const addrs = res.data?.data || [];
        setSavedAddresses(addrs);
        if (addrs.length > 0) {
          setSelectedAddressId(addrs[0]._id);
          setShowNewForm(false);
        } else {
          setShowNewForm(true);
        }
      })
      .catch(() => setShowNewForm(true));
  }, [user]);

  const subtotal = cart.reduce((sum, item) => {
    const price = item.priceAtTime || item.price || item.productId?.price || 0;
    return sum + price * (item.quantity || 1);
  }, 0);
  const shipping = subtotal > 499 ? 0 : 49;
  const discount = coupon?.discountAmount || 0;
  const total = Math.max(0, subtotal + shipping - discount);

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    try {
      const res = await couponAPI.validate(couponCode.trim(), subtotal);
      setCoupon(res.data?.data);
      showToast({ message: `Coupon applied! You save ₹${res.data?.data?.discountAmount}`, type: "success" });
    } catch (err) {
      showToast({ message: err?.response?.data?.message || "Invalid coupon", type: "error" });
      setCoupon(null);
    } finally { setCouponLoading(false); }
  };

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  // ── Guest gate ────────────────────────────────────────────────────────────
  if (!user) {
    return (
      <div className="min-h-screen bg-sand-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="card p-10 text-center">
            <div className="text-6xl mb-6">🔐</div>
            <h2 className="text-2xl font-display font-bold text-ink-900 mb-2">Sign in to checkout</h2>
            <p className="text-ink-500 text-sm mb-8 leading-relaxed">
              You have <strong>{cart.length} item{cart.length !== 1 ? "s" : ""}</strong> in your cart. Sign in or create an account to complete your purchase — your cart is saved.
            </p>
            <div className="space-y-3">
              <Link to="/login?redirect=/checkout">
                <button className="btn-primary w-full py-3">Sign In to Continue →</button>
              </Link>
              <Link to="/register?redirect=/checkout">
                <button className="w-full py-3 rounded-xl border-2 border-ink-200 text-sm font-semibold text-ink-700 hover:border-ink-400 transition-all">
                  Create Account
                </button>
              </Link>
              <button onClick={() => navigate("/cart")} className="w-full text-sm text-ink-400 hover:text-ink-600 py-2">← Back to Cart</button>
            </div>

            {/* Cart preview */}
            <div className="mt-8 pt-6 border-t border-ink-100 space-y-2.5">
              {cart.slice(0, 3).map((item, i) => (
                <div key={i} className="flex items-center gap-3 text-sm text-left">
                  <div className="w-10 h-10 rounded-lg bg-sand-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                    {item.imageUrl ? <img src={item.imageUrl} alt="" className="w-full h-full object-cover" /> : "🛍️"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-ink-800 truncate">{item.name || "Product"}</p>
                    <p className="text-ink-400 text-xs">Qty {item.quantity || 1}</p>
                  </div>
                  <span className="font-bold text-ink-900">₹{((item.priceAtTime || item.price || 0) * (item.quantity || 1)).toLocaleString()}</span>
                </div>
              ))}
              {cart.length > 3 && <p className="text-xs text-ink-400 text-center">+{cart.length - 3} more items</p>}
              <div className="flex items-center justify-between font-bold text-ink-900 pt-2 border-t border-ink-100">
                <span>Total</span>
                <span>₹{total.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

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

  const handleOrder = async (e) => {
    e.preventDefault();

    // Build delivery address from saved or new form
    let deliveryAddress;
    if (selectedAddressId && !showNewForm) {
      const saved = savedAddresses.find((a) => a._id === selectedAddressId);
      if (!saved) { showToast({ message: "Please select a delivery address", type: "error" }); return; }
      deliveryAddress = {
        name: form.name || user?.name || "",
        phone: form.phone || user?.phone || "",
        street: saved.buildingNameOrNumber,
        area: saved.area,
        city: saved.city,
        state: saved.state,
        pincode: saved.pincode,
      };
    } else {
      if (!form.name || !form.phone || !form.street || !form.city || !form.pincode) {
        showToast({ message: "Please fill all required fields", type: "error" }); return;
      }
      if (!/^\d{10}$/.test(form.phone)) {
        showToast({ message: "Enter valid 10-digit phone", type: "error" }); return;
      }
      if (!/^\d{6}$/.test(form.pincode)) {
        showToast({ message: "Enter valid 6-digit pincode", type: "error" }); return;
      }
      deliveryAddress = {
        name: form.name, phone: form.phone,
        street: form.street, area: form.area,
        city: form.city, state: form.state, pincode: form.pincode,
      };
    }

    setLoading(true);
    try {
      await syncGuestCart();
      const selectedProductIds = cart.map((c) => c.productId?._id || c.productId || c._id).filter(Boolean);
      const res = await orderAPI.placeOrder({
        selectedProductIds,
        deliveryAddress,
        paymentMethod: form.paymentMethod,
        couponCode: coupon?.code || undefined,
      });
      const orderId = res.data?.data?._id;
      // TRADE_WALLET orders are auto-confirmed by backend; COD needs no payment step
      // If payment status is still PENDING (e.g. future UPI), call payOrder
      const orderData = res.data?.data;
      if (orderId && orderData?.paymentStatus === "PENDING" && form.paymentMethod !== "COD") {
        try { await orderAPI.payOrder(orderId); } catch (payErr) {
          showToast({ message: "Order placed but payment failed. Please pay from your orders page.", type: "warning" });
        }
      }
      clearCart();
      showToast({ message: "Order placed successfully! 🎉", type: "success" });
      navigate(`/orders/${orderId || ""}`);
    } catch (err) {
      showToast({ message: err?.response?.data?.message || err?.message || "Failed to place order", type: "error" });
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-sand-50 py-10">
      <div className="container-app max-w-5xl">
        <div className="mb-8">
          <p className="section-label">Order</p>
          <h1 className="text-3xl font-display font-bold text-ink-900 mt-1">Checkout</h1>
        </div>

        <form onSubmit={handleOrder} className="flex flex-col lg:flex-row gap-8">
          {/* Left */}
          <div className="flex-1 space-y-6">
            {/* Delivery address */}
            <div className="card p-6">
              <h2 className="font-display font-bold text-ink-900 text-lg mb-5 flex items-center gap-2">
                <span className="w-7 h-7 bg-brand-100 text-brand-700 rounded-full text-sm flex items-center justify-center font-bold">1</span>
                Delivery Address
              </h2>

              {/* Saved addresses */}
              {savedAddresses.length > 0 && (
                <div className="space-y-2 mb-4">
                  {savedAddresses.map((addr) => (
                    <label key={addr._id} className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedAddressId === addr._id && !showNewForm ? "border-brand-500 bg-brand-50" : "border-ink-200 bg-white hover:border-ink-300"}`}>
                      <input type="radio" name="savedAddress" checked={selectedAddressId === addr._id && !showNewForm}
                        onChange={() => { setSelectedAddressId(addr._id); setShowNewForm(false); }} className="mt-0.5 accent-brand-600" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold uppercase tracking-wide text-ink-500">{addr.addressType}</span>
                          {selectedAddressId === addr._id && !showNewForm && <span className="text-xs text-brand-600 font-semibold">✓ Selected</span>}
                        </div>
                        <p className="text-sm text-ink-800 mt-0.5">
                          {addr.buildingNameOrNumber}, {addr.area}, {addr.city} — {addr.pincode}
                        </p>
                        <p className="text-xs text-ink-400">{addr.state}</p>
                      </div>
                      <button type="button" onClick={async (e) => {
                        e.preventDefault();
                        try {
                          await userAPI.deleteAddress(addr._id);
                          const updated = savedAddresses.filter((a) => a._id !== addr._id);
                          setSavedAddresses(updated);
                          if (selectedAddressId === addr._id) {
                            if (updated.length > 0) setSelectedAddressId(updated[0]._id);
                            else { setSelectedAddressId(null); setShowNewForm(true); }
                          }
                        } catch {}
                      }} className="text-xs text-red-400 hover:text-red-600 flex-shrink-0 mt-0.5">Remove</button>
                    </label>
                  ))}
                  <button type="button" onClick={() => { setShowNewForm(true); setSelectedAddressId(null); }}
                    className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 border-dashed transition-all text-sm font-semibold ${showNewForm ? "border-brand-500 text-brand-700 bg-brand-50" : "border-ink-200 text-ink-500 hover:border-ink-400 hover:text-ink-700"}`}>
                    <span className="text-lg">+</span> Use a different address
                  </button>
                </div>
              )}

              {/* Contact fields always visible */}
              <div className="grid sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-semibold text-ink-700 mb-1.5">Full Name *</label>
                  <input name="name" value={form.name} onChange={handleChange} placeholder="Recipient name" className="input-base" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-ink-700 mb-1.5">Phone *</label>
                  <input name="phone" value={form.phone} onChange={handleChange} placeholder="10-digit mobile" className="input-base" type="tel" />
                </div>
              </div>

              {/* New address form */}
              {showNewForm && (
                <div className="pt-4 border-t border-ink-100 space-y-4">
                  {/* Google Maps address search */}
                  <div>
                    <label className="block text-sm font-semibold text-ink-700 mb-1.5">
                      🗺️ Search Address
                    </label>
                    <AddressPicker
                      onSelect={(addr) => {
                        setForm((f) => ({
                          ...f,
                          street: addr.street || f.street,
                          area:   addr.area   || f.area,
                          city:   addr.city   || f.city,
                          state:  addr.state  || f.state,
                          pincode: addr.pincode || f.pincode,
                        }));
                      }}
                      placeholder="Search locality, landmark, city…"
                    />
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-semibold text-ink-700 mb-1.5">House / Flat / Street *</label>
                      <input name="street" value={form.street} onChange={handleChange} placeholder="House no, building, street" className="input-base" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-ink-700 mb-1.5">Area / Locality</label>
                      <input name="area" value={form.area} onChange={handleChange} placeholder="Area or locality" className="input-base" />
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
                    <div className="sm:col-span-2">
                      <label className="flex items-center gap-2 text-sm text-ink-600 cursor-pointer select-none">
                        <input type="checkbox" id="saveAddr" className="accent-brand-600 w-4 h-4"
                          onChange={async (e) => {
                            if (e.target.checked && form.street && form.city && form.pincode) {
                              try {
                                const res = await userAPI.createAddress({
                                  buildingNameOrNumber: form.street,
                                  area: form.area || "-",
                                  city: form.city,
                                  state: form.state || "-",
                                  country: "India",
                                  pincode: form.pincode,
                                  addressType: "HOME",
                                });
                                setSavedAddresses((prev) => [res.data?.data, ...prev]);
                                showToast({ message: "Address saved!", type: "success" });
                              } catch {}
                            }
                          }} />
                        Save this address for future orders
                      </label>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Payment */}
            <div className="card p-6">
              <h2 className="font-display font-bold text-ink-900 text-lg mb-5 flex items-center gap-2">
                <span className="w-7 h-7 bg-brand-100 text-brand-700 rounded-full text-sm flex items-center justify-center font-bold">2</span>
                Payment Method
              </h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {[
                  { value: "TRADE_WALLET", label: "Trade Wallet", icon: "💳", desc: "Pay from wallet balance" },
                  { value: "TRADE_WALLET", label: "Trade Wallet", icon: "👛", desc: "Use wallet balance" },
                  { value: "COD", label: "Cash on Delivery", icon: "💵", desc: "Pay on arrival" },
                  { value: "UPI", label: "UPI", icon: "📱", desc: "GPay, PhonePe, etc." },
                ].map((pm) => (
                  <label key={pm.value} className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${form.paymentMethod === pm.value ? "border-brand-500 bg-brand-50" : "border-ink-200 bg-white hover:border-ink-300"}`}>
                    <input type="radio" name="paymentMethod" value={pm.value} checked={form.paymentMethod === pm.value} onChange={handleChange} className="sr-only" />
                    <span className="text-xl">{pm.icon}</span>
                    <div>
                      <p className="text-sm font-semibold text-ink-900">{pm.label}</p>
                      <p className="text-xs text-ink-400">{pm.desc}</p>
                    </div>
                    {form.paymentMethod === pm.value && <span className="ml-auto text-brand-500">✓</span>}
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Order summary */}
          <div className="w-full lg:w-80 flex-shrink-0">
            <div className="card p-6 sticky top-24">
              <h2 className="text-lg font-display font-bold text-ink-900 mb-5">Order Summary</h2>
              <div className="space-y-3 mb-5 max-h-64 overflow-y-auto">
                {cart.map((item, i) => {
                  const price = item.priceAtTime || item.price || item.productId?.price || 0;
                  return (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-sand-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {item.imageUrl ? <img src={item.imageUrl} alt="" className="w-full h-full object-cover" /> : "🛍️"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-ink-800 line-clamp-2">{item.name || item.productId?.title || "Product"}</p>
                        <p className="text-xs text-ink-400 mt-0.5">Qty {item.quantity || 1}</p>
                      </div>
                      <span className="text-sm font-bold text-ink-900 flex-shrink-0">₹{(price * (item.quantity || 1)).toLocaleString()}</span>
                    </div>
                  );
                })}
              </div>
              <div className="border-t border-ink-100 pt-4 space-y-2.5">
                <div className="flex justify-between text-sm text-ink-600">
                  <span>Subtotal ({cart.length} items)</span>
                  <span>₹{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm text-ink-600">
                  <span>Delivery</span>
                  <span className={shipping === 0 ? "text-green-600 font-semibold" : ""}>{shipping === 0 ? "Free" : `₹${shipping}`}</span>
                </div>
                {shipping === 0 && (
                  <p className="text-xs text-green-600 bg-green-50 px-2.5 py-1.5 rounded-lg">🎉 You saved ₹49 on delivery!</p>
                )}
                {/* Coupon input */}
                {!coupon ? (
                  <div className="flex gap-2 pt-1">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), applyCoupon())}
                      placeholder="Promo code"
                      className="flex-1 px-3 py-2 rounded-xl border-2 border-ink-200 text-sm focus:outline-none focus:border-ink-900 transition-all"
                    />
                    <button type="button" onClick={applyCoupon} disabled={couponLoading || !couponCode.trim()}
                      className="px-4 py-2 rounded-xl bg-ink-900 text-white text-sm font-semibold disabled:opacity-40 hover:bg-ink-700 transition-all">
                      {couponLoading ? "..." : "Apply"}
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-3 py-2">
                    <div>
                      <p className="text-xs font-bold text-green-700">🏷️ {coupon.code}</p>
                      <p className="text-xs text-green-600">{coupon.description || "Discount applied"}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-green-700">−₹{discount.toLocaleString()}</p>
                      <button type="button" onClick={() => { setCoupon(null); setCouponCode(""); }}
                        className="text-xs text-red-400 hover:text-red-600">Remove</button>
                    </div>
                  </div>
                )}
                {discount > 0 && (
                  <div className="flex justify-between text-sm text-green-600 font-semibold">
                    <span>Coupon Discount</span>
                    <span>−₹{discount.toLocaleString()}</span>
                  </div>
                )}
                <div className="border-t border-ink-100 pt-3 flex justify-between font-bold text-ink-900 text-base">
                  <span>Total</span>
                  <span>₹{total.toLocaleString()}</span>
                </div>
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 mt-5 text-sm">
                {loading ? <span className="flex items-center justify-center gap-2"><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Placing Order...</span> : `Place Order • ₹${total.toLocaleString()}`}
              </button>
              <p className="text-center text-xs text-ink-400 mt-3">🔒 Secure checkout — your data is protected</p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}