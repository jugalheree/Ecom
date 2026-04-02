import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { marketplaceAPI } from "../services/apis/index";
import { useAuthStore } from "../store/authStore";
import HowItWorks from "./HowItWorks";
import BuyerVendorSection from "./BuyerVendorSection";
import PlatformStats from "./PlatformStats";
import TrustArchitecture from "./TrustArchitecture";
import FinalCTA from "./FinalCTA";

const STATS = [
  { value: "1,200+", label: "Active Vendors" },
  { value: "45K+",   label: "Products Listed" },
  { value: "18K+",   label: "Monthly Trades" },
  { value: "99.9%",  label: "Secure Transactions" },
];

const TRUST_BADGES = [
  { icon: "🔒", label: "Secure Escrow Payments" },
  { icon: "✅", label: "AI-Verified Products" },
  { icon: "🚚", label: "Fast Delivery" },
  { icon: "↩️", label: "Easy Returns" },
];

const CAT_ICONS = {
  "Electronics": { icon: "⚡", bg: "from-blue-500 to-blue-700" },
  "Fashion":     { icon: "👗", bg: "from-pink-500 to-rose-600" },
  "Groceries":   { icon: "🛒", bg: "from-emerald-500 to-green-700" },
  "Industrial":  { icon: "⚙️", bg: "from-orange-500 to-amber-600" },
  "Home & Living":{ icon: "🏠", bg: "from-teal-500 to-cyan-700" },
  "Beauty":      { icon: "✨", bg: "from-purple-500 to-violet-700" },
  "Sports":      { icon: "🏆", bg: "from-red-500 to-rose-700" },
  "Books":       { icon: "📚", bg: "from-indigo-500 to-indigo-700" },
  "Food":        { icon: "🍎", bg: "from-green-500 to-emerald-600" },
  "Health":      { icon: "💊", bg: "from-cyan-500 to-teal-600" },
  "Toys":        { icon: "🧸", bg: "from-yellow-500 to-orange-500" },
  "Automotive":  { icon: "🚗", bg: "from-slate-500 to-gray-700" },
};

const POPULAR_SEARCHES = ["Electronics", "Fashion", "Groceries", "Sports", "Home Decor"];

export default function Home() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const role = user?.role?.toLowerCase();
  const [q, setQ] = useState("");
  const [categories, setCategories] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [loadingFeatured, setLoadingFeatured] = useState(true);

  useEffect(() => {
    marketplaceAPI.getCategoryTree()
      .then((res) => {
        const tree = res.data?.data || [];
        setCategories(
          tree.slice(0, 8).map((c) => ({
            _id: c._id,
            name: c.name,
            ...(CAT_ICONS[c.name] || { icon: "🛍️", bg: "from-brand-500 to-brand-700" }),
          }))
        );
      })
      .catch(() => {
        setCategories(Object.entries(CAT_ICONS).slice(0, 8).map(([name, v]) => ({ name, ...v })));
      });

    marketplaceAPI.getMarketplaceProducts({ limit: 4, sort: "newest", saleType: "B2C" })
      .then((res) => setFeatured(res.data?.data?.products || []))
      .catch(() => setFeatured([]))
      .finally(() => setLoadingFeatured(false));
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (q.trim()) navigate(`/search?q=${encodeURIComponent(q.trim())}`);
  };

  // Role-based dashboard shortcuts
  const ROLE_SHORTCUTS = {
    vendor: [
      { label: "My Products",   path: "/vendor/products",  icon: "📦" },
      { label: "Orders",        path: "/vendor/orders",    icon: "🛒" },
      { label: "Marketplace",   path: "/vendor/marketplace", icon: "🏪" },
      { label: "Reports",       path: "/vendor/reports",   icon: "📊" },
    ],
    buyer: [
      { label: "Browse Market", path: "/market",           icon: "🛍️" },
      { label: "My Orders",     path: "/orders",           icon: "📦" },
      { label: "Wishlist",      path: "/wishlist",         icon: "❤️" },
      { label: "My Wallet",     path: "/wallet",           icon: "💳" },
    ],
    admin: [
      { label: "Dashboard",     path: "/admin/dashboard",  icon: "📊" },
      { label: "Vendors",       path: "/admin/vendors",    icon: "🏪" },
      { label: "Orders",        path: "/admin/orders",     icon: "🛒" },
      { label: "Coupons",       path: "/admin/coupons",    icon: "🏷️" },
    ],
  };
  const shortcuts = ROLE_SHORTCUTS[role] || null;

  // ── Logged-in dashboard ──────────────────────────────────────────────────
  if (user) {
    return (
      <div className="min-h-screen bg-sand-50">
        {/* Personalised hero banner */}
        <div className="bg-gradient-to-br from-ink-950 via-navy-950 to-ink-900 pt-[68px]">
          <div className="container-app py-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <p className="text-brand-400 text-sm font-semibold uppercase tracking-widest mb-2">
                  {role === "vendor" ? "Vendor Panel" : role === "admin" ? "Admin Panel" : "Welcome back"}
                </p>
                <h1 className="text-4xl md:text-5xl font-display text-white leading-tight">
                  Hey, {user.name?.split(" ")[0]}! 👋
                </h1>
                <p className="text-ink-300 mt-2 text-base">
                  {role === "vendor" ? "Manage your store, fulfill orders, and grow your business." :
                   role === "admin"  ? "Monitor the platform, approve vendors, and manage operations." :
                   "Browse products, track your orders, and shop securely."}
                </p>
              </div>
              <button onClick={() => navigate(
                  role === "vendor" ? "/vendor/dashboard" :
                  role === "admin"  ? "/admin/dashboard" : "/market")}
                className="flex-shrink-0 btn-primary px-8 py-3.5 text-base">
                {role === "vendor" ? "Vendor Dashboard →" :
                 role === "admin"  ? "Admin Panel →" : "Browse Marketplace →"}
              </button>
            </div>
          </div>
        </div>

        <div className="container-app py-10">
          {/* Quick access grid */}
          {shortcuts && (
            <div className="mb-10">
              <h2 className="text-lg font-display font-bold text-ink-900 mb-4">Quick Access</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {shortcuts.map((s) => (
                  <button key={s.path} onClick={() => navigate(s.path)}
                    className="flex items-center gap-4 p-5 bg-white rounded-2xl border-2 border-ink-100 hover:border-brand-400 hover:shadow-card-hover transition-all text-left group">
                    <span className="text-3xl">{s.icon}</span>
                    <span className="text-sm font-semibold text-ink-800 group-hover:text-brand-700">{s.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Featured products for buyers, category grid for everyone */}
          {role === "buyer" || !role ? (
            <>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-display font-bold text-ink-900">Latest Products</h2>
                <Link to="/market" className="text-sm font-semibold text-brand-600 hover:text-brand-700">View all →</Link>
              </div>
              {loadingFeatured ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  {[1,2,3,4].map(i => <div key={i} className="card overflow-hidden"><div className="skeleton aspect-square w-full"/><div className="p-4 space-y-2"><div className="skeleton h-3 w-1/3 rounded"/><div className="skeleton h-4 w-3/4 rounded"/></div></div>)}
                </div>
              ) : featured.length > 0 ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  {featured.map((p) => (
                    <Link to={`/product/${p._id}`} key={p._id}
                      className="group card overflow-hidden hover:shadow-card-hover transition-all hover:-translate-y-1">
                      <div className="bg-sand-100 aspect-square overflow-hidden">
                        {p.image
                          ? <img src={p.image} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform"/>
                          : <div className="w-full h-full flex items-center justify-center text-5xl text-ink-200">🛍️</div>}
                      </div>
                      <div className="p-4">
                        <p className="text-xs text-ink-400 mb-1 truncate">{p.vendor || "TradeSphere Vendor"}</p>
                        <h3 className="font-semibold text-ink-900 text-sm line-clamp-2">{p.title}</h3>
                        <p className="text-lg font-bold text-ink-900 mt-2">₹{p.price?.toLocaleString()}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : null}

              {/* Category chips */}
              {categories.length > 0 && (
                <div className="mt-10">
                  <h2 className="text-lg font-display font-bold text-ink-900 mb-4">Browse by Category</h2>
                  <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
                    {categories.map((cat, i) => (
                      <Link key={cat._id || i} to="/market"
                        className="group flex flex-col items-center gap-2 p-3 bg-white rounded-2xl border border-ink-100 hover:border-brand-200 hover:shadow-sm transition-all">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${cat.bg} flex items-center justify-center text-lg group-hover:scale-110 transition-transform`}>{cat.icon}</div>
                        <span className="text-[10px] font-semibold text-ink-600 text-center leading-tight">{cat.name}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            // Vendor / Admin: show categories as browse links
            categories.length > 0 && (
              <div>
                <h2 className="text-lg font-display font-bold text-ink-900 mb-4">Marketplace Categories</h2>
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
                  {categories.map((cat, i) => (
                    <Link key={cat._id || i} to="/market"
                      className="group flex flex-col items-center gap-2 p-3 bg-white rounded-2xl border border-ink-100 hover:border-brand-200 hover:shadow-sm transition-all">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${cat.bg} flex items-center justify-center text-lg group-hover:scale-110 transition-transform`}>{cat.icon}</div>
                      <span className="text-[10px] font-semibold text-ink-600 text-center leading-tight">{cat.name}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )
          )}
        </div>
      </div>
    );
  }

  // ── Guest landing page ────────────────────────────────────────────────────
  return (
    <div className="overflow-hidden">

      {/* ── HERO ── */}
      <section className="relative bg-gradient-to-br from-ink-950 via-navy-950 to-ink-900 overflow-hidden">
        <div className="absolute top-0 right-0 w-[700px] h-[700px] bg-brand-500/10 rounded-full -translate-y-1/3 translate-x-1/3 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-navy-500/15 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl pointer-events-none" />

        <div className="container-app py-20 md:py-28 relative z-10">
          <div className="max-w-3xl">
            <span className="badge-brand mb-6 inline-flex">🛒 India's Smartest B2B &amp; B2C Platform</span>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-display text-white leading-[1.08] tracking-tight mt-4">
              Shop Smarter,<br />
              <span className="gradient-text italic font-light">Sell Better.</span>
            </h1>

            <p className="text-lg md:text-xl text-ink-300 max-w-xl mt-6 leading-relaxed">
              TradeSphere brings buyers and vendors together with AI-verified products,
              secure escrow wallets, and a trusted trading ecosystem.
            </p>

            <form onSubmit={handleSearch} className="flex mt-8 max-w-xl">
              <div className="flex-1 relative">
                <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-400 pointer-events-none"
                  width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                <input type="text" value={q} onChange={(e) => setQ(e.target.value)}
                  placeholder="Search products, brands, categories..."
                  className="w-full pl-12 pr-4 py-4 rounded-l-2xl bg-white/10 border border-white/20 text-white placeholder:text-ink-400 text-sm focus:outline-none focus:bg-white/15 focus:border-brand-400 transition-all" />
              </div>
              <button type="submit" className="px-6 py-4 bg-brand-500 hover:bg-brand-600 text-white font-semibold text-sm rounded-r-2xl transition-colors flex-shrink-0">Search</button>
            </form>

            <div className="flex flex-wrap items-center gap-2 mt-4">
              <span className="text-xs text-ink-500">Popular:</span>
              {POPULAR_SEARCHES.map((s) => (
                <button key={s} onClick={() => navigate(`/search?q=${encodeURIComponent(s)}`)}
                  className="text-xs text-ink-400 hover:text-white border border-white/10 hover:border-white/30 px-2.5 py-1 rounded-full transition-all">
                  {s}
                </button>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-8">
              <Link to="/market">
                <button className="btn-primary px-8 py-3.5 text-base">Browse Marketplace →</button>
              </Link>
              <Link to="/register">
                <button className="btn-outline border-white/20 text-white hover:border-brand-400 hover:bg-brand-500/10 px-8 py-3.5 text-base">
                  Sell on TradeSphere
                </button>
              </Link>
            </div>

            <div className="flex flex-wrap gap-4 mt-10">
              {TRUST_BADGES.map((b, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-ink-300">
                  <span>{b.icon}</span><span>{b.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Stats bar */}
        <div className="border-t border-white/10 bg-white/5 backdrop-blur-sm">
          <div className="container-app py-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              {STATS.map((s, i) => (
                <div key={i}>
                  <p className="text-2xl md:text-3xl font-display font-bold text-white">{s.value}</p>
                  <p className="text-xs text-ink-400 font-medium uppercase tracking-wider mt-1">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── TICKER ── */}
      <div className="bg-brand-600 py-3 overflow-hidden">
        <div className="ticker">
          <div className="ticker-track">
            {[1, 2].map((g) => (
              <div key={g} className="ticker-group">
                {["Free Shipping over ₹499","AI Verified Products","Secure Escrow Payments","Easy Returns","1200+ Verified Vendors","Shop with Confidence"].map((item, i) => (
                  <span key={i} className="text-white text-sm font-medium flex items-center gap-3">
                    <span className="w-1.5 h-1.5 bg-white/60 rounded-full inline-block" />{item}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── CATEGORIES ── */}
      <section className="py-16 bg-sand-50">
        <div className="container-app">
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="section-label mb-1">Browse</p>
              <h2 className="text-3xl font-display text-ink-900">Shop by Category</h2>
            </div>
            <Link to="/market" className="text-sm font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1">View all →</Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {categories.length > 0
              ? categories.map((cat, i) => (
                  <Link key={cat._id || i} to="/market"
                    className="group flex flex-col items-center gap-2.5 p-4 bg-white rounded-2xl border border-ink-100 hover:border-brand-200 hover:shadow-card-hover transition-all duration-200">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${cat.bg} flex items-center justify-center text-xl shadow-sm group-hover:scale-110 transition-transform duration-200`}>
                      {cat.icon}
                    </div>
                    <span className="text-xs font-semibold text-ink-700 text-center">{cat.name}</span>
                  </Link>
                ))
              : Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="skeleton h-28 rounded-2xl" />
                ))
            }
          </div>
        </div>
      </section>

      {/* ── FEATURED PRODUCTS ── */}
      <section className="py-16 bg-white">
        <div className="container-app">
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="section-label mb-1">🔥 Just In</p>
              <h2 className="text-3xl font-display text-ink-900">Latest Products</h2>
            </div>
            <Link to="/market" className="text-sm font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1">All products →</Link>
          </div>

          {loadingFeatured ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {[1,2,3,4].map((i) => (
                <div key={i} className="card overflow-hidden">
                  <div className="skeleton aspect-square w-full" />
                  <div className="p-4 space-y-2">
                    <div className="skeleton h-3 w-1/3 rounded" />
                    <div className="skeleton h-4 w-3/4 rounded" />
                    <div className="skeleton h-9 w-full rounded-xl mt-2" />
                  </div>
                </div>
              ))}
            </div>
          ) : featured.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {featured.map((p) => (
                <Link to={`/product/${p._id}`} key={p._id}
                  className="group card overflow-hidden hover:shadow-card-hover transition-all duration-200 hover:-translate-y-1">
                  <div className="bg-sand-100 aspect-square overflow-hidden relative">
                    {p.image
                      ? <img src={p.image} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      : <div className="w-full h-full flex items-center justify-center text-5xl text-ink-200">🛍️</div>
                    }
                    {p.stock < 5 && p.stock > 0 && (
                      <span className="absolute top-2 right-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">Low Stock</span>
                    )}
                  </div>
                  <div className="p-4">
                    <p className="text-xs text-ink-400 mb-1 truncate">{p.vendor || "TradeSphere Vendor"}</p>
                    <h3 className="font-semibold text-ink-900 text-sm line-clamp-2 leading-snug">{p.title}</h3>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-lg font-bold text-ink-900">₹{p.price?.toLocaleString()}</span>
                      {p.minDeliveryDays && (
                        <span className="text-xs text-ink-400">{p.minDeliveryDays}–{p.maxDeliveryDays}d delivery</span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-sand-50 rounded-2xl">
              <div className="text-4xl mb-3">🛍️</div>
              <p className="text-ink-500 text-sm">Products will appear here once vendors list them.</p>
              <Link to="/market" className="inline-block mt-4">
                <button className="btn-primary px-6 py-2.5 text-sm">Browse Marketplace →</button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ── VENDOR PROMO ── */}
      <section className="py-16 bg-gradient-to-br from-navy-900 to-ink-950">
        <div className="container-app">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="max-w-xl">
              <p className="section-label text-brand-400 mb-2">For Sellers</p>
              <h2 className="text-4xl md:text-5xl font-display text-white leading-tight">
                Grow your business<br /><span className="text-brand-400 italic font-light">without limits.</span>
              </h2>
              <p className="text-ink-300 mt-4 leading-relaxed">
                Join 1,200+ vendors already selling on TradeSphere. Get AI-powered insights,
                escrow-protected payments, and a dedicated store — all in one platform.
              </p>
              <div className="flex gap-3 mt-6">
                <Link to="/register"><button className="btn-primary px-6 py-3">Start Selling Free →</button></Link>
                <Link to="/how-it-works"><button className="btn-outline border-white/20 text-white hover:border-brand-400 hover:bg-brand-500/10 px-6 py-3">Learn More</button></Link>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
              {[
                { value: "₹0",   label: "Setup Cost",       icon: "✅" },
                { value: "2.5%", label: "Transaction Fee",  icon: "💳" },
                { value: "24hr", label: "Onboarding",       icon: "⚡" },
                { value: "AI",   label: "Trust Score",      icon: "🤖" },
              ].map((s, i) => (
                <div key={i} className="bg-white/10 backdrop-blur rounded-2xl p-4 text-center border border-white/10">
                  <span className="text-2xl">{s.icon}</span>
                  <p className="text-2xl font-display font-bold text-white mt-1">{s.value}</p>
                  <p className="text-xs text-ink-400 mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <HowItWorks />
      <BuyerVendorSection />
      <PlatformStats />
      <TrustArchitecture />
      <FinalCTA />
    </div>
  );
}
