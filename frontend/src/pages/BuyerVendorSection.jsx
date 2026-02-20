import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { Link } from "react-router-dom";

export default function BuyerVendorSection() {
  return (
    <section className="w-full py-24 md:py-32 bg-stone-50">
      <div className="container-app">
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-display font-bold text-stone-900 mb-6">
            Built on trust and smart systems
          </h2>
          <p className="text-xl text-stone-600 max-w-3xl mx-auto leading-relaxed">
            TradeSphere is designed as a complete ecosystem — empowering buyers
            with trust and vendors with tools to scale.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Buyer Side */}
          <Card className="p-10 border-2 border-stone-200 hover:border-primary-300 transition-all duration-300 bg-white">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-2xl shadow-lg">
                🛒
              </div>
              <h3 className="text-3xl font-display font-bold text-stone-900">
                Buyer side
              </h3>
            </div>

            <ul className="space-y-4 text-stone-600 mb-8">
              <li className="flex items-start gap-3">
                <span className="text-primary-600 font-bold mt-1">✓</span>
                <span>AI-verified products and vendor trust scoring</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary-600 font-bold mt-1">✓</span>
                <span>Secure escrow wallet protection</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary-600 font-bold mt-1">✓</span>
                <span>Smart discovery and recommendations</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary-600 font-bold mt-1">✓</span>
                <span>Order tracking and transparent flow</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary-600 font-bold mt-1">✓</span>
                <span>Wishlist, cart, and quick checkout</span>
              </li>
            </ul>

            <Link to="/market">
              <Button className="w-full text-lg py-4">
                Explore marketplace
              </Button>
            </Link>
          </Card>

          {/* Vendor Side */}
          <Card className="p-10 border-2 border-stone-200 hover:border-primary-300 transition-all duration-300 bg-white">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-2xl shadow-lg">
                🏪
              </div>
              <h3 className="text-3xl font-display font-bold text-stone-900">
                Vendor side
              </h3>
            </div>

            <ul className="space-y-4 text-stone-600 mb-8">
              <li className="flex items-start gap-3">
                <span className="text-primary-600 font-bold mt-1">✓</span>
                <span>Vendor dashboard and analytics</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary-600 font-bold mt-1">✓</span>
                <span>Product, stock, and order management</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary-600 font-bold mt-1">✓</span>
                <span>Secure wallet and automated payouts</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary-600 font-bold mt-1">✓</span>
                <span>Vendor-to-vendor trading system</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary-600 font-bold mt-1">✓</span>
                <span>Smart alerts and performance insights</span>
              </li>
            </ul>

            <Link to="/register">
              <Button variant="outline" className="w-full text-lg py-4 border-2">
                Start selling
              </Button>
            </Link>
          </Card>
        </div>
      </div>
    </section>
  );
}
