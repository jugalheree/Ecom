import { Link } from "react-router-dom";
import HowItWorks from "./HowItWorks";
import BuyerVendorSection from "./BuyerVendorSection";
import PlatformStats from "./PlatformStats";
import TrustArchitecture from "./TrustArchitecture";
import FinalCTA from "./FinalCTA";

const stats = [
  { value: "1,200+", label: "Active Vendors" },
  { value: "45K+", label: "Products Listed" },
  { value: "18K+", label: "Monthly Trades" },
  { value: "99.9%", label: "Secure Transactions" },
];

const categories = [
  { name: "Electronics", icon: "⚡", bg: "from-blue-500 to-blue-700", link: "/market?cat=electronics" },
  { name: "Fashion", icon: "👗", bg: "from-pink-500 to-rose-600", link: "/market?cat=fashion" },
  { name: "Groceries", icon: "🛒", bg: "from-emerald-500 to-green-700", link: "/market?cat=groceries" },
  { name: "Industrial", icon: "⚙️", bg: "from-orange-500 to-amber-600", link: "/market?cat=industrial" },
  { name: "Home & Living", icon: "🏠", bg: "from-teal-500 to-cyan-700", link: "/market?cat=home" },
  { name: "Beauty", icon: "✨", bg: "from-purple-500 to-violet-700", link: "/market?cat=beauty" },
  { name: "Sports", icon: "🏆", bg: "from-red-500 to-rose-700", link: "/market?cat=sports" },
  { name: "Books", icon: "📚", bg: "from-indigo-500 to-indigo-700", link: "/market?cat=books" },
];

const deals = [
  { name: "Wireless Headphones Pro", price: "₹2,499", original: "₹4,999", discount: "50%", badge: "Flash Deal", color: "bg-brand-600" },
  { name: "Smart Watch Series 5", price: "₹5,999", original: "₹9,999", discount: "40%", badge: "Top Seller", color: "bg-navy-600" },
  { name: "Running Shoes Ultra", price: "₹1,899", original: "₹2,999", discount: "37%", badge: "Limited Stock", color: "bg-emerald-600" },
  { name: "Portable Bluetooth Speaker", price: "₹1,299", original: "₹2,499", discount: "48%", badge: "Best Value", color: "bg-purple-600" },
];

const trustBadges = [
  { icon: "🔒", label: "Secure Escrow Payments" },
  { icon: "✅", label: "AI-Verified Products" },
  { icon: "🚚", label: "Fast Delivery" },
  { icon: "↩️", label: "Easy Returns" },
];

export default function Home() {
  return (
    <div className="overflow-hidden">

      {/* ── HERO ── */}
      <section className="relative bg-gradient-to-br from-ink-950 via-navy-950 to-ink-900 overflow-hidden">
        {/* decorative circles */}
        <div className="absolute top-0 right-0 w-[700px] h-[700px] bg-brand-500/10 rounded-full -translate-y-1/3 translate-x-1/3 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-navy-500/15 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl pointer-events-none" />

        <div className="container-app py-24 md:py-32 relative z-10">
          <div className="max-w-3xl">
            <span className="badge-brand mb-6 inline-flex animate-fade-in">🛒 India's Smartest B2B & B2C Platform</span>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-display text-white leading-[1.08] tracking-tight mt-4 animate-fade-up stagger-1">
              Shop Smarter,<br />
              <span className="gradient-text italic font-light">Sell Better.</span>
            </h1>

            <p className="text-lg md:text-xl text-ink-300 max-w-xl mt-6 leading-relaxed animate-fade-up stagger-2">
              TradeSphere brings buyers and vendors together with AI-verified products, secure escrow wallets, and a trusted trading ecosystem.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 mt-8 animate-fade-up stagger-3">
              <Link to="/market">
                <button className="btn-primary px-8 py-3.5 text-base">Shop Now →</button>
              </Link>
              <Link to="/register">
                <button className="btn-outline border-white/20 text-white hover:border-brand-400 hover:bg-brand-500/10 px-8 py-3.5 text-base">
                  Sell on TradeSphere
                </button>
              </Link>
            </div>

            {/* Trust row */}
            <div className="flex flex-wrap gap-4 mt-10 animate-fade-up stagger-4">
              {trustBadges.map((b, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-ink-300">
                  <span>{b.icon}</span>
                  <span>{b.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Stats bar */}
        <div className="border-t border-white/10 bg-white/5 backdrop-blur-sm">
          <div className="container-app py-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              {stats.map((s, i) => (
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
                {["Free Shipping over ₹499", "AI Verified Products", "Secure Escrow Payments", "Easy Returns", "1200+ Verified Vendors", "Shop with Confidence"].map((item, i) => (
                  <span key={i} className="text-white text-sm font-medium flex items-center gap-3">
                    <span className="w-1.5 h-1.5 bg-white/60 rounded-full inline-block" />
                    {item}
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
            <Link to="/market" className="text-sm font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1">
              View all <span>→</span>
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {categories.map((cat, i) => (
              <Link key={i} to={cat.link}
                className="group flex flex-col items-center gap-2.5 p-4 bg-white rounded-2xl border border-ink-100 hover:border-brand-200 hover:shadow-card-hover transition-all duration-200 cursor-pointer">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${cat.bg} flex items-center justify-center text-xl shadow-sm group-hover:scale-110 transition-transform duration-200`}>
                  {cat.icon}
                </div>
                <span className="text-xs font-semibold text-ink-700 text-center">{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── FLASH DEALS ── */}
      <section className="py-16 bg-white">
        <div className="container-app">
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="section-label mb-1">🔥 Limited Time</p>
              <h2 className="text-3xl font-display text-ink-900">Today's Best Deals</h2>
            </div>
            <Link to="/market" className="text-sm font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1">
              All deals <span>→</span>
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {deals.map((d, i) => (
              <Link to="/market" key={i}
                className="group card p-5 flex flex-col gap-3 hover:shadow-card-hover transition-all duration-200 hover:-translate-y-1">
                <div className="w-full h-36 rounded-xl bg-sand-100 flex items-center justify-center text-5xl">
                  🛍️
                </div>
                <div>
                  <span className={`${d.color} text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full`}>
                    {d.badge}
                  </span>
                  <h3 className="text-sm font-semibold text-ink-900 mt-2 leading-snug">{d.name}</h3>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-lg font-bold text-ink-900">{d.price}</span>
                    <span className="text-sm text-ink-400 line-through">{d.original}</span>
                    <span className="text-xs font-bold text-success-600 bg-green-50 px-1.5 py-0.5 rounded-md">{d.discount} off</span>
                  </div>
                </div>
                <button className="btn-primary w-full text-sm py-2">Add to Cart</button>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── VENDOR PROMO BANNER ── */}
      <section className="py-16 bg-gradient-to-br from-navy-900 to-ink-950">
        <div className="container-app">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="max-w-xl">
              <p className="section-label text-brand-400 mb-2">For Sellers</p>
              <h2 className="text-4xl md:text-5xl font-display text-white leading-tight">
                Grow your business<br />
                <span className="text-brand-400 italic font-light">without limits.</span>
              </h2>
              <p className="text-ink-300 mt-4 leading-relaxed">
                Join 1,200+ vendors already selling on TradeSphere. Get AI-powered insights, escrow-protected payments, and a dedicated store — all in one platform.
              </p>
              <div className="flex gap-3 mt-6">
                <Link to="/register">
                  <button className="btn-primary px-6 py-3">Start Selling Free →</button>
                </Link>
                <Link to="/how-it-works">
                  <button className="btn-outline border-white/20 text-white hover:border-brand-400 hover:bg-brand-500/10 px-6 py-3">Learn More</button>
                </Link>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
              {[
                { value: "₹0", label: "Setup Cost", icon: "✅" },
                { value: "2.5%", label: "Transaction Fee", icon: "💳" },
                { value: "24hr", label: "Onboarding", icon: "⚡" },
                { value: "AI", label: "Trust Score", icon: "🤖" },
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

      {/* Sub-pages */}
      <HowItWorks />
      <BuyerVendorSection />
      <PlatformStats />
      <TrustArchitecture />
      <FinalCTA />
    </div>
  );
}
