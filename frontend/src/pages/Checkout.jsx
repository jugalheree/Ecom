import { useState } from "react";
import { useCartStore } from "../store/cartStore";
import { useOrderStore } from "../store/orderStore";
import { userAPI } from "../services/apis/index";
import Input from "../components/ui/Input";
import { useNavigate } from "react-router-dom";
import { useToastStore } from "../store/toastStore";
import { useAuthStore } from "../store/authStore";

export default function Checkout() {
  const { cart, clearCart } = useCartStore();
  const { placeOrder, loading: orderLoading } = useOrderStore();
  const navigate = useNavigate();
  const showToast = useToastStore((s) => s.showToast);
  const user = useAuthStore((s) => s.user);

  const [address, setAddress] = useState({ buildingNameOrNumber: "", landmark: "", area: "", city: "", state: "", country: "India", pincode: "", addressType: "HOME" });
  const [scheduledDate, setScheduledDate] = useState("");
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringIntervalDays, setRecurringIntervalDays] = useState(7);
  const [savingAddress, setSavingAddress] = useState(false);
  const [savedAddressId, setSavedAddressId] = useState(null);

  const subtotal = cart.reduce((sum, item) => sum + (item.priceAtTime || 0) * item.quantity, 0);
  const platformFee = Math.round(subtotal * 0.02);
  const total = subtotal + platformFee;

  if (cart.length === 0) return (
    <div className="min-h-screen bg-ink-50 flex items-center justify-center mt-[72px]">
      <div className="text-center">
        <div className="w-16 h-16 bg-white border-2 border-ink-200 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4">🛒</div>
        <h2 className="text-xl font-display font-bold text-ink-900 mb-2">Cart is empty</h2>
        <button onClick={() => navigate("/market")} className="mt-4 bg-ink-900 text-white font-display font-semibold px-6 py-2.5 rounded-xl hover:bg-ink-800 transition-all text-sm">Browse marketplace</button>
      </div>
    </div>
  );

  const handleSaveAddress = async () => {
    if (!address.buildingNameOrNumber || !address.area || !address.city || !address.state || !address.pincode) { showToast({ message: "Please fill all required address fields", type: "error" }); return; }
    if (!/^\d{6}$/.test(address.pincode)) { showToast({ message: "Enter valid 6-digit pincode", type: "error" }); return; }
    setSavingAddress(true);
    try {
      const res = await userAPI.createAddress(address);
      setSavedAddressId(res.data?.data?._id);
      showToast({ message: "Address saved!", type: "success" });
    } catch (err) {
      if (err.status === 409) showToast({ message: "Address already exists, proceeding...", type: "info" });
      else showToast({ message: err.message || "Failed to save address", type: "error" });
    } finally { setSavingAddress(false); }
  };

  const handlePlaceOrder = async () => {
    if (!address.buildingNameOrNumber || !address.area || !address.city || !address.state || !address.pincode) { showToast({ message: "Please fill in your delivery address", type: "error" }); return; }
    const selectedProductIds = cart.map((item) => typeof item.productId === "object" ? item.productId._id : item.productId);
    const orderData = { selectedProductIds };
    if (scheduledDate) { orderData.scheduledDate = scheduledDate; if (isRecurring) { orderData.isRecurring = true; orderData.recurringIntervalDays = Number(recurringIntervalDays); } }
    const result = await placeOrder(orderData);
    if (result.success) { clearCart(); showToast({ type: "success", message: "Order placed successfully!" }); navigate("/orders"); }
    else showToast({ type: "error", message: result.message || "Failed to place order" });
  };

  const Section = ({ title, children }) => (
    <div className="bg-white rounded-2xl border border-ink-200 p-6">
      <h2 className="font-display font-bold text-ink-900 mb-5 flex items-center gap-2">{title}</h2>
      {children}
    </div>
  );

  return (
    <div className="min-h-screen bg-ink-50 mt-[72px]">
      <div className="bg-white border-b border-ink-100">
        <div className="container-app py-8">
          <p className="text-xs font-display font-bold uppercase tracking-widest text-primary-600 mb-2">Checkout</p>
          <h1 className="text-4xl font-display font-bold text-ink-900">Complete your order</h1>
        </div>
      </div>

      <div className="container-app py-8">
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-5">
            <Section title="📍 Delivery address">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="text-xs font-display font-bold uppercase tracking-widest text-ink-500 mb-1.5 block">Address Type</label>
                  <select value={address.addressType} onChange={(e) => setAddress({ ...address, addressType: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-ink-200 rounded-xl text-sm outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 bg-white text-ink-900">
                    <option value="HOME">Home</option>
                    <option value="SHOP">Shop</option>
                    <option value="WAREHOUSE">Warehouse</option>
                  </select>
                </div>
                <Input label="Building / House No *" placeholder="e.g. 42B, Sunrise Apartments" value={address.buildingNameOrNumber} onChange={(e) => setAddress({ ...address, buildingNameOrNumber: e.target.value })} />
                <Input label="Landmark" placeholder="Near park / school" value={address.landmark} onChange={(e) => setAddress({ ...address, landmark: e.target.value })} />
                <Input label="Area / Street *" placeholder="Area or street name" value={address.area} onChange={(e) => setAddress({ ...address, area: e.target.value })} />
                <Input label="City *" placeholder="Enter city" value={address.city} onChange={(e) => setAddress({ ...address, city: e.target.value })} />
                <Input label="State *" placeholder="Enter state" value={address.state} onChange={(e) => setAddress({ ...address, state: e.target.value })} />
                <Input label="Pincode *" placeholder="6-digit pincode" value={address.pincode} onChange={(e) => setAddress({ ...address, pincode: e.target.value })} />
              </div>
              <button onClick={handleSaveAddress} disabled={savingAddress}
                className={`mt-5 text-sm font-display font-semibold px-5 py-2.5 rounded-xl border-2 transition-all disabled:opacity-50 ${savedAddressId ? "border-emerald-500 text-emerald-600 bg-emerald-50" : "border-ink-200 text-ink-700 hover:border-ink-400 hover:bg-ink-50"}`}>
                {savingAddress ? "Saving..." : savedAddressId ? "✓ Address saved" : "Save address"}
              </button>
            </Section>

            <Section title="⚙️ Advanced options">
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-display font-bold uppercase tracking-widest text-ink-500 mb-1.5 block">Schedule delivery (optional)</label>
                  <input type="datetime-local" value={scheduledDate} onChange={(e) => setScheduledDate(e.target.value)}
                    min={new Date(Date.now() + 60000).toISOString().slice(0, 16)}
                    className="w-full px-4 py-3 border-2 border-ink-200 rounded-xl text-sm outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 bg-white" />
                </div>
                {scheduledDate && (
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={isRecurring} onChange={(e) => setIsRecurring(e.target.checked)} className="w-4 h-4 rounded accent-primary-600" />
                    <span className="text-sm font-medium text-ink-700">Make this a recurring order</span>
                  </label>
                )}
                {scheduledDate && isRecurring && <Input label="Repeat every (days)" type="number" min="1" value={recurringIntervalDays} onChange={(e) => setRecurringIntervalDays(e.target.value)} />}
              </div>
            </Section>

            <Section title="📦 Order items">
              <div className="space-y-3">
                {cart.map((item) => {
                  const product = item.productId;
                  const productId = typeof product === "object" ? product._id : product;
                  const title = typeof product === "object" ? product.title : "Product";
                  const price = item.priceAtTime || 0;
                  return (
                    <div key={productId} className="flex justify-between items-center py-3 border-b border-ink-100 last:border-0">
                      <div>
                        <p className="font-medium text-ink-900 text-sm">{title}</p>
                        <p className="text-xs text-ink-400 mt-0.5">Qty {item.quantity} × ₹{price}</p>
                      </div>
                      <p className="font-display font-bold text-ink-900">₹{(price * item.quantity).toLocaleString()}</p>
                    </div>
                  );
                })}
              </div>
            </Section>
          </div>

          <div>
            <div className="bg-white rounded-2xl border border-ink-200 p-6 sticky top-24">
              <h2 className="font-display font-bold text-ink-900 mb-5">Order summary</h2>
              <div className="space-y-3 text-sm text-ink-600">
                <div className="flex justify-between"><span>Subtotal</span><span className="font-medium text-ink-900">₹{subtotal.toLocaleString()}</span></div>
                <div className="flex justify-between"><span>Platform fee (2%)</span><span className="font-medium text-ink-900">₹{platformFee.toLocaleString()}</span></div>
              </div>
              <div className="border-t border-ink-100 my-4" />
              <div className="flex justify-between font-display font-bold text-ink-900 text-lg mb-5"><span>Total</span><span>₹{total.toLocaleString()}</span></div>
              {scheduledDate && (
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-xs text-blue-700 mb-4 font-medium">
                  📅 {new Date(scheduledDate).toLocaleString()}{isRecurring && ` · Repeats every ${recurringIntervalDays} days`}
                </div>
              )}
              <div className="bg-primary-50 border border-primary-100 rounded-xl p-3 mb-5">
                <p className="text-xs text-primary-700 font-medium">🔒 Secured via escrow wallet protection</p>
              </div>
              <button onClick={handlePlaceOrder} disabled={orderLoading}
                className="w-full bg-ink-900 text-white font-display font-semibold py-3.5 rounded-xl hover:bg-ink-800 transition-all shadow-sm hover:shadow-md active:scale-[0.98] disabled:opacity-50">
                {orderLoading ? <span className="flex items-center justify-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Placing order...</span> : "Place order →"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
