import { Link } from "react-router-dom";

const footerLinks = {
  Shop: [
    { label: "Marketplace", to: "/market" },
    { label: "Cart", to: "/cart" },
    { label: "Orders", to: "/orders" },
    { label: "Wishlist", to: "/wishlist" },
    { label: "Wallet", to: "/wallet" },
  ],
  Vendors: [
    { label: "Vendor Dashboard", to: "/vendor" },
    { label: "Manage Products", to: "/vendor/products" },
    { label: "Vendor Orders", to: "/vendor/orders" },
    { label: "Sales Reports", to: "/vendor/reports" },
    { label: "Setup Store", to: "/vendor/setup" },
  ],
  Company: [
    { label: "How It Works", to: "/how-it-works" },
    { label: "Trust & Safety", to: "/trust" },
    { label: "Platform Stats", to: "/stats" },
    { label: "Become a Vendor", to: "/register" },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-ink-950 text-ink-300">
      {/* Top section */}
      <div className="container-app py-16">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-brand">
                <span className="text-white font-display font-bold text-sm italic">T</span>
              </div>
              <span className="text-xl font-display font-bold text-white">
                Trade<span className="text-brand-400">Sphere</span>
              </span>
            </div>
            <p className="text-ink-400 leading-relaxed text-sm max-w-xs">
              A next-generation B2B & B2C marketplace with AI-verified products, secure escrow wallet, and a complete vendor trading ecosystem built for India.
            </p>
            <div className="flex gap-3 mt-6">
              {["🐦", "📸", "💼", "▶️"].map((icon, i) => (
                <button key={i} className="w-9 h-9 rounded-xl bg-white/10 hover:bg-brand-600 text-sm flex items-center justify-center transition-all">
                  {icon}
                </button>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([section, links]) => (
            <div key={section}>
              <h4 className="text-white font-semibold text-sm mb-4">{section}</h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.to}>
                    <Link to={link.to} className="text-sm text-ink-400 hover:text-white transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Trust badges row */}
      <div className="border-t border-white/10">
        <div className="container-app py-6">
          <div className="flex flex-wrap gap-6 items-center justify-between">
            <div className="flex flex-wrap gap-5">
              {[
                { icon: "🔒", label: "Escrow Protected" },
                { icon: "✅", label: "AI Verified Products" },
                { icon: "🚚", label: "Fast Delivery" },
                { icon: "↩️", label: "Easy Returns" },
              ].map((b, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-ink-400">
                  <span>{b.icon}</span>
                  <span>{b.label}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-ink-500">
              © {new Date().getFullYear()} TradeSphere. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
