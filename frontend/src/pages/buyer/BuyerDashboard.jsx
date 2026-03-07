import { useAuthStore } from "../../store/authStore";
import { useCartStore } from "../../store/cartStore";
import { useWishlistStore } from "../../store/wishlistStore";
import { useOrderStore } from "../../store/orderStore";
import { useWalletStore } from "../../store/walletStore";
import { useNavigate } from "react-router-dom";
import TrustCard from "../../components/trust/TrustCard";
import OrdersChart from "../../components/charts/OrdersChart";

const SPENDING_DATA = [
  { month: "Sep", orders: 3 },
  { month: "Oct", orders: 5 },
  { month: "Nov", orders: 4 },
  { month: "Dec", orders: 7 },
  { month: "Jan", orders: 6 },
  { month: "Feb", orders: 4 },
];

export default function BuyerDashboard() {
  const { user } = useAuthStore();
  const cart = useCartStore((s) => s.cart);
  const wishlist = useWishlistStore((s) => s.wishlist);
  const orders = useOrderStore((s) => s.orders);
  const wallet = useWalletStore((s) => s.balance);
  const navigate = useNavigate();

  const statCards = [
    { label: "Wallet Balance", value: `₹${wallet}`, icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
    ), accent: "text-emerald-600 bg-emerald-50 border-emerald-100", link: "/wallet" },
    { label: "My Orders", value: orders.length, icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
    ), accent: "text-blue-600 bg-blue-50 border-blue-100", link: "/orders" },
    { label: "Wishlist", value: wishlist.length, icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
    ), accent: "text-pink-600 bg-pink-50 border-pink-100", link: "/wishlist" },
    { label: "Cart Items", value: cart.length, icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
    ), accent: "text-primary-600 bg-primary-50 border-primary-100", link: "/cart" },
  ];

  return (
    <div className="min-h-screen bg-ink-50 mt-[72px]">
      {/* Header */}
      <div className="bg-white border-b border-ink-100 px-8 py-7">
        <p className="text-[10px] font-display font-bold uppercase tracking-[0.15em] text-primary-600 mb-1">My Account</p>
        <h1 className="text-2xl font-display font-bold text-ink-900">Welcome back, {user?.name?.split(" ")[0]}</h1>
        <p className="text-ink-400 text-sm mt-0.5">Here's what's happening with your account.</p>
      </div>

      <div className="container-app py-6 space-y-5">
        {/* Stats */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((s, i) => (
            <button key={i} onClick={() => navigate(s.link)}
              className="bg-white rounded-2xl border border-ink-100 p-5 hover:shadow-md hover:border-ink-200 transition-all duration-200 text-left group">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-9 h-9 rounded-xl border flex items-center justify-center ${s.accent}`}>
                  {s.icon}
                </div>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-ink-200 group-hover:text-ink-400 transition-colors">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </div>
              <p className="text-[11px] font-display font-bold uppercase tracking-widest text-ink-400 mb-1">{s.label}</p>
              <p className="text-2xl font-display font-bold text-ink-900">{s.value}</p>
            </button>
          ))}
        </div>

        {/* Trust + Stats */}
        <div className="grid md:grid-cols-3 gap-4">
          <TrustCard title="Buyer rating" rating={4.7} reviews={56} badge="Reliable buyer" />
          <div className="bg-white rounded-2xl border border-ink-100 p-5">
            <p className="text-[11px] font-display font-bold uppercase tracking-widest text-ink-400 mb-3">Orders Completed</p>
            <p className="text-3xl font-display font-bold text-ink-900">42</p>
          </div>
          <div className="bg-white rounded-2xl border border-ink-100 p-5">
            <p className="text-[11px] font-display font-bold uppercase tracking-widest text-ink-400 mb-3">Wishlist Items</p>
            <p className="text-3xl font-display font-bold text-ink-900">{wishlist.length}</p>
          </div>
        </div>

        {/* Chart */}
        <div className="bg-white rounded-2xl border border-ink-100 p-5">
          <h3 className="font-display font-bold text-ink-900 text-sm mb-0.5">Order Activity</h3>
          <p className="text-[11px] text-ink-400 mb-4">Orders placed per month</p>
          <OrdersChart data={SPENDING_DATA} />
        </div>

        {/* Recent orders */}
        <div className="bg-white rounded-2xl border border-ink-100 p-5">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="font-display font-bold text-ink-900 text-sm">Recent Orders</h3>
              <p className="text-[11px] text-ink-400 mt-0.5">Your latest transactions</p>
            </div>
            <button onClick={() => navigate("/orders")}
              className="text-[11px] font-display font-semibold text-primary-600 hover:text-primary-700 border border-primary-100 bg-primary-50 px-3 py-1.5 rounded-lg transition-colors">
              View all →
            </button>
          </div>
          {orders.length === 0 ? (
            <div className="text-center py-10">
              <div className="w-12 h-12 bg-ink-50 border border-ink-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-ink-300"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
              </div>
              <p className="text-sm text-ink-400 mb-4">No orders yet</p>
              <button onClick={() => navigate("/market")}
                className="text-sm font-display font-semibold bg-ink-900 text-white px-5 py-2 rounded-xl hover:bg-ink-800 transition-all active:scale-[0.97]">
                Start shopping
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {orders.slice(0, 5).map((o, i) => (
                <div key={i} className="flex justify-between items-center p-3.5 bg-ink-50 rounded-xl hover:bg-ink-100 transition-colors">
                  <div>
                    <p className="font-display font-semibold text-ink-900 text-sm">Order #{i + 1}</p>
                    <p className="text-[11px] text-ink-400 mt-0.5">Completed</p>
                  </div>
                  <p className="font-display font-bold text-ink-900">₹{o.total}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
