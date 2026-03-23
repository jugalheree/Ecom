import { Link } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { useCartStore } from "../../store/cartStore";
import { useWishlistStore } from "../../store/wishlistStore";
import { useWalletStore } from "../../store/walletStore";

const MOCK_BUYER_RATING = { avg: 4.3, total: 12, badge: "Trusted Buyer" };

function MiniStars({ value, size = 12 }) {
  return (
    <span className="inline-flex items-center gap-0.5">
      {[1,2,3,4,5].map(s => (
        <svg key={s} width={size} height={size} viewBox="0 0 24 24"
          fill={s <= Math.round(value) ? "#ff7d07" : "#d9d9de"} stroke="none">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      ))}
    </span>
  );
}

export default function BuyerDashboard() {
  const { user } = useAuthStore();
  const cart = useCartStore((s) => s.cart);
  const { wishlist } = useWishlistStore();
  const balance = useWalletStore((s) => s.balance);
  const held = useWalletStore((s) => s.held);

  const tiles = [
    { label: "Cart Items",      value: cart.length,                          icon: "🛒", link: "/cart",      color: "bg-brand-50 border-brand-200 text-brand-700" },
    { label: "Wishlist",        value: wishlist.length,                      icon: "🤍", link: "/wishlist",  color: "bg-pink-50 border-pink-200 text-pink-700" },
    { label: "Wallet Balance",  value: `₹${(balance - held).toLocaleString()}`, icon: "💳", link: "/wallet", color: "bg-emerald-50 border-emerald-200 text-emerald-700" },
    { label: "Browse Products", value: "Marketplace",                        icon: "🛍️", link: "/market",    color: "bg-navy-50 border-navy-200 text-navy-700" },
  ];

  const quickLinks = [
    { label: "My Orders",    link: "/orders",       icon: "📦" },
    { label: "Track Order",  link: "/orders",       icon: "🚚" },
    { label: "My Ratings",   link: "/ratings",      icon: "⭐" },
    { label: "Trade Wallet", link: "/wallet/trade", icon: "💰" },
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

        {/* ── Buyer Rating Card ── */}
        <Link to="/ratings"
          className="block mb-6 rounded-2xl p-5 border hover:shadow-md hover:-translate-y-0.5 transition-all"
          style={{ background: "linear-gradient(135deg,#fafafa,#f3f3f7)", border: "2px solid #e8e8f0" }}>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
                style={{ background: "linear-gradient(135deg,#fff7ed,#ffedd5)", border: "1px solid #fed7aa" }}>
                ⭐
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-ink-400 mb-1">Your Buyer Rating</p>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-ink-900 font-display">{MOCK_BUYER_RATING.avg}</span>
                  <div>
                    <MiniStars value={MOCK_BUYER_RATING.avg} size={13} />
                    <p className="text-xs text-ink-400 mt-0.5">{MOCK_BUYER_RATING.total} ratings from vendors</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl mb-1"
                style={{ background: "#fff7ed", border: "1px solid #fed7aa" }}>
                <span>🏅</span>
                <span className="text-sm font-bold text-orange-700">{MOCK_BUYER_RATING.badge}</span>
              </div>
              <p className="text-xs text-ink-400">View my reviews →</p>
            </div>
          </div>
        </Link>

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