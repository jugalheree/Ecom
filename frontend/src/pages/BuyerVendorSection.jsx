import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { Link } from "react-router-dom";

export default function BuyerVendorSection() {
  return (
    <section className="w-full py-24 bg-white dark:bg-slate-900">
      <div className="max-w-7xl mx-auto px-4">

        {/* TITLE */}
        <div className="max-w-2xl mb-16">
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">
            Built for buyers and vendors
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mt-3">
            TradeSphere is designed as a complete ecosystem — empowering buyers with trust and vendors with tools to scale.
          </p>
        </div>

        {/* TWO COLUMNS */}
        <div className="grid md:grid-cols-2 gap-10">

          {/* BUYERS */}
          <Card className="p-10 border border-slate-200 dark:border-slate-800">
            <h3 className="text-2xl font-semibold mb-4">
              For buyers
            </h3>

            <ul className="space-y-3 text-slate-600 dark:text-slate-400">
              <li>• AI-verified products and vendor trust scoring</li>
              <li>• Secure escrow wallet protection</li>
              <li>• Smart discovery and recommendations</li>
              <li>• Order tracking and transparent flow</li>
              <li>• Wishlist, cart, and quick checkout</li>
            </ul>

            <div className="mt-8">
              <Link to="/market">
                <Button>Explore marketplace</Button>
              </Link>
            </div>
          </Card>

          {/* VENDORS */}
          <Card className="p-10 border border-slate-200 dark:border-slate-800">
            <h3 className="text-2xl font-semibold mb-4">
              For vendors
            </h3>

            <ul className="space-y-3 text-slate-600 dark:text-slate-400">
              <li>• Vendor dashboard and analytics</li>
              <li>• Product, stock, and order management</li>
              <li>• Secure wallet and automated payouts</li>
              <li>• Vendor-to-vendor trading system</li>
              <li>• Smart alerts and performance insights</li>
            </ul>

            <div className="mt-8">
              <Link to="/register">
                <Button variant="outline">Start selling</Button>
              </Link>
            </div>
          </Card>

        </div>
      </div>
    </section>
  );
}
