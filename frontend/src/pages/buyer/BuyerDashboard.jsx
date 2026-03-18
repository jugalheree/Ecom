import { Link } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { useCartStore } from "../../store/cartStore";
import { useWishlistStore } from "../../store/wishlistStore";
import { useWalletStore } from "../../store/walletStore";

export default function BuyerDashboard() {
  const { user } = useAuthStore();
  const cart = useCartStore((s) => s.cart);
  const { wishlist } = useWishlistStore();
  const balance = useWalletStore((s) => s.balance);
  const held = useWalletStore((s) => s.held);

  const tiles = [
    { label: "Cart Items",        value: cart.length,              icon: "🛒", link: "/cart",      color: "bg-brand-50 border-brand-200 text-brand-700" },
    { label: "Wishlist",          value: wishlist.length,          icon: "🤍", link: "/wishlist",  color: "bg-pink-50 border-pink-200 text-pink-700" },
    { label: "Wallet Balance",    value: `₹${(balance - held).toLocaleString()}`, icon: "💳", link: "/wallet", color: "bg-emerald-50 border-emerald-200 text-emerald-700" },
    { label: "Browse Products",   value: "Marketplace",            icon: "🛍️", link: "/market",    color: "bg-navy-50 border-navy-200 text-navy-700" },
  ];

  const quickLinks = [
    { label: "My Orders",     link: "/orders",    icon: "📦" },
    { label: "Track Order",   link: "/orders",    icon: "🚚" },
    { label: "Ratings",       link: "/ratings",   icon: "⭐" },
    { label: "Trade Wallet",  link: "/wallet/trade", icon: "💰" },
  ];

  return (
    <div className="min-h-screen bg-sand-50 py-10">
      <div className="container-app max-w-4xl">
        {/* Greeting */}
        <div className="mb-8">
          <p className="section-label">Welcome back</p>
          <h1 className="text-3xl font-display font-bold text-ink-900 mt-1">
            Hello, {user?.name?.split(" ")[0] || "Shopper"} 👋
          </h1>
          <p className="text-ink-500 text-sm mt-1">Here's a quick overview of your account.</p>
        </div>

        {/* Stat tiles */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {tiles.map((t, i) => (
            <Link key={i} to={t.link}
              className={`card p-5 border-2 ${t.color} hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 block`}>
              <span className="text-2xl">{t.icon}</span>
              <p className="text-2xl font-bold mt-2 text-ink-900">{t.value}</p>
              <p className="text-xs font-semibold mt-0.5 opacity-80">{t.label}</p>
            </Link>
          ))}
        </div>

        {/* Quick links */}
        <div className="card p-6">
          <h2 className="font-display font-bold text-ink-900 text-lg mb-4">Quick Actions</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {quickLinks.map((l, i) => (
              <Link key={i} to={l.link}
                className="flex items-center gap-3 p-4 rounded-xl bg-sand-50 hover:bg-brand-50 hover:border-brand-200 border border-ink-100 transition-all group">
                <span className="text-xl">{l.icon}</span>
                <span className="text-sm font-semibold text-ink-700 group-hover:text-brand-700 transition-colors">{l.label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* CTA if cart not empty */}
        {cart.length > 0 && (
          <div className="mt-5 bg-gradient-to-r from-brand-600 to-brand-700 rounded-2xl p-6 flex items-center justify-between gap-4">
            <div>
              <p className="text-white font-display font-bold text-lg">You have {cart.length} item{cart.length !== 1 ? "s" : ""} in your cart</p>
              <p className="text-brand-100 text-sm mt-0.5">Complete your purchase before items sell out!</p>
            </div>
            <Link to="/checkout">
              <button className="btn-outline border-white text-white hover:bg-white hover:text-brand-700 px-6 py-3 flex-shrink-0">Checkout →</button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
