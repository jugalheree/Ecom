import { Link } from "react-router-dom";
import Badge from "../components/ui/Badge";
import HowItWorks from "./HowItWorks";
import BuyerVendorSection from "./BuyerVendorSection";
import PlatformStats from "./PlatformStats";
import TrustArchitecture from "./TrustArchitecture";
import FinalCTA from "./FinalCTA";
import heroImage from "../images/heroSection.png";

const stats = [
  { value: "1,200+", label: "Active vendors" },
  { value: "45,000+", label: "Products listed" },
  { value: "18K+", label: "Monthly trades" },
  { value: "99.9%", label: "Secure transactions" },
];

const features = [
  { icon: "✦", title: "AI Trust Score", desc: "Products are evaluated using intelligent parameters to ensure quality and reliability.", color: "text-primary-500", bg: "bg-primary-50 border-primary-100" },
  { icon: "⬡", title: "Secure Wallet", desc: "Escrow-based wallet system protects both buyers and vendors throughout every transaction.", color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-100" },
  { icon: "◈", title: "Vendor Ecosystem", desc: "Vendors can trade stock, manage alerts, and expand supply chains seamlessly.", color: "text-accent-500", bg: "bg-accent-50 border-accent-100" },
];

const categories = [
  { name: "Electronics", icon: "⚡", bg: "bg-blue-500" },
  { name: "Fashion", icon: "✦", bg: "bg-pink-500" },
  { name: "Groceries", icon: "◻", bg: "bg-emerald-500" },
  { name: "Industrial", icon: "⬡", bg: "bg-orange-500" },
];

export default function Home() {
  return (
    <div className="overflow-hidden">
      {/* HERO */}
      <section className="relative min-h-screen flex items-center bg-white pt-20">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(20,184,166,0.08),transparent_60%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(217,70,239,0.04),transparent_60%)]" />
          <div className="absolute inset-0 opacity-[0.015]"
            style={{ backgroundImage: `linear-gradient(#131318 1px,transparent 1px),linear-gradient(to right,#131318 1px,transparent 1px)`, backgroundSize: "48px 48px" }} />
        </div>

        <div className="container-app relative z-10 py-20 md:py-28">
          <div className="max-w-5xl mx-auto">
            <div className="text-center space-y-7">
              <div className="inline-flex animate-fade-up">
                <Badge type="info">✦ AI-Powered B2B & B2C Platform</Badge>
              </div>

              <h1 className="text-6xl md:text-7xl lg:text-8xl font-display font-bold text-ink-900 leading-[1.05] tracking-tight animate-fade-up stagger-1">
                The future of<br />
                <span className="gradient-text">commerce</span>
              </h1>

              <p className="text-lg md:text-xl text-ink-500 max-w-2xl mx-auto leading-relaxed animate-fade-up stagger-2">
                A next-generation platform with AI verification, secure escrow, and intelligent trading for businesses of every size.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2 animate-fade-up stagger-3">
                <Link to="/register">
                  <button className="inline-flex items-center gap-2 bg-ink-900 text-white text-sm font-display font-semibold px-8 py-4 rounded-xl hover:bg-ink-800 transition-all shadow-sm hover:shadow-lg active:scale-[0.97]">
                    Start trading free
                    <span>→</span>
                  </button>
                </Link>
                <Link to="/market">
                  <button className="inline-flex items-center gap-2 border-2 border-ink-200 text-ink-700 text-sm font-display font-semibold px-8 py-4 rounded-xl hover:border-ink-400 hover:bg-ink-50 transition-all active:scale-[0.97]">
                    Browse marketplace
                  </button>
                </Link>
              </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-ink-200 border border-ink-200 rounded-2xl overflow-hidden mt-16 animate-fade-up stagger-4">
              {stats.map((s, i) => (
                <div key={i} className="bg-white px-6 py-6 text-center">
                  <p className="text-3xl font-display font-bold text-ink-900">{s.value}</p>
                  <p className="text-xs text-ink-500 uppercase tracking-wider mt-1 font-medium">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Hero image */}
            <div className="mt-14 relative animate-fade-up stagger-5">
              <div className="absolute inset-0 bg-gradient-to-br from-primary-100/40 to-accent-100/30 rounded-3xl blur-3xl scale-105" />
              <div className="relative bg-white rounded-3xl border-2 border-ink-100 shadow-2xl overflow-hidden px-8 py-8 flex items-center justify-center">
                <img src={heroImage} alt="Platform Preview" className="max-h-[380px] w-auto object-contain" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TICKER */}
      <section className="bg-ink-950 py-5 overflow-hidden border-y border-ink-800">
        <div className="ticker">
          <div className="ticker-track">
            {[1, 2].map((group) => (
              <div key={group} className="ticker-group">
                {["Secure Escrow", "AI Verified Products", "B2B & B2C Commerce", "Vendor Trading Network", "Real-time Analytics", "Escrow Protection"].map((item, i) => (
                  <div key={i} className="ticker-item">
                    <span className="ticker-dot" />
                    {item}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-24 md:py-32 bg-white">
        <div className="container-app">
          <div className="text-center mb-16">
            <p className="text-xs font-display font-bold uppercase tracking-widest text-primary-600 mb-4">Platform Features</p>
            <h2 className="text-4xl md:text-5xl font-display font-bold text-ink-900 mb-5">Everything you need</h2>
            <p className="text-ink-500 max-w-xl mx-auto text-sm leading-relaxed">Built for modern businesses that demand excellence at every touchpoint.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div key={i} className={`group p-8 rounded-2xl border-2 ${f.bg} transition-all duration-300 hover:shadow-lg hover:-translate-y-1`}>
                <div className={`text-3xl font-display font-bold ${f.color} mb-5`}>{f.icon}</div>
                <h3 className="text-xl font-display font-bold text-ink-900 mb-3">{f.title}</h3>
                <p className="text-ink-600 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="py-24 md:py-32 bg-ink-50">
        <div className="container-app">
          <div className="text-center mb-14">
            <p className="text-xs font-display font-bold uppercase tracking-widest text-primary-600 mb-4">Categories</p>
            <h2 className="text-4xl md:text-5xl font-display font-bold text-ink-900 mb-5">Explore categories</h2>
            <p className="text-ink-500 max-w-xl mx-auto text-sm">Find exactly what your business needs.</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {categories.map((cat, i) => (
              <Link key={i} to="/market"
                className="group bg-white rounded-2xl border-2 border-ink-200 hover:border-primary-300 p-8 flex flex-col items-center gap-4 text-center transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
              >
                <div className={`w-14 h-14 ${cat.bg} rounded-2xl flex items-center justify-center text-white text-2xl shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                  {cat.icon}
                </div>
                <span className="font-display font-bold text-ink-900">{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <PlatformStats />
      <HowItWorks />
      <BuyerVendorSection />
      <TrustArchitecture />
      <FinalCTA />
    </div>
  );
}
