import { Link } from "react-router-dom";

export default function BuyerVendorSection() {
  return (
    <section className="w-full py-24 md:py-32 bg-ink-50">
      <div className="container-app">
        <div className="text-center mb-14">
          <p className="text-xs font-display font-bold uppercase tracking-widest text-primary-600 mb-4">Ecosystem</p>
          <h2 className="text-4xl md:text-5xl font-display font-bold text-ink-900 mb-5">Built on trust and smart systems</h2>
          <p className="text-ink-500 max-w-2xl mx-auto text-sm leading-relaxed">
            TradeSphere is a complete ecosystem — empowering buyers with trust and vendors with tools to scale.
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          {[
            {
              icon: "🛍️", iconBg: "bg-blue-500", title: "Buyer side",
              items: ["AI-verified products and vendor trust scoring", "Secure escrow wallet protection", "Smart discovery and recommendations", "Order tracking and transparent flow", "Wishlist, cart, and quick checkout"],
              cta: "Explore marketplace", href: "/market", ctaVariant: "dark"
            },
            {
              icon: "🏪", iconBg: "bg-emerald-500", title: "Vendor side",
              items: ["Vendor dashboard and analytics", "Product, stock, and order management", "Secure wallet and automated payouts", "Vendor-to-vendor trading system", "Smart alerts and performance insights"],
              cta: "Start selling", href: "/register", ctaVariant: "outline"
            }
          ].map((side, i) => (
            <div key={i} className="bg-white rounded-2xl border-2 border-ink-200 hover:border-primary-300 transition-all duration-300 p-8 flex flex-col hover:shadow-lg">
              <div className="flex items-center gap-3 mb-6">
                <div className={`w-12 h-12 rounded-xl ${side.iconBg} flex items-center justify-center text-xl shadow-sm`}>{side.icon}</div>
                <h3 className="text-2xl font-display font-bold text-ink-900">{side.title}</h3>
              </div>
              <ul className="space-y-3 flex-1 mb-8">
                {side.items.map((item, j) => (
                  <li key={j} className="flex items-start gap-3 text-sm text-ink-600">
                    <span className="mt-0.5 w-4 h-4 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-xs flex-shrink-0 font-bold">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
              <Link to={side.href}>
                <button className={`w-full py-3 rounded-xl font-display font-semibold text-sm transition-all active:scale-[0.98] ${
                  side.ctaVariant === "dark"
                    ? "bg-ink-900 text-white hover:bg-ink-800 shadow-sm"
                    : "border-2 border-ink-200 text-ink-700 hover:border-ink-400 hover:bg-ink-50"
                }`}>
                  {side.cta} →
                </button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
