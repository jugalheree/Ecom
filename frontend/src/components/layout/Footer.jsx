import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="w-full bg-slate-950 text-slate-300">
      <div className="max-w-7xl mx-auto px-4 py-20">

        {/* TOP */}
        <div className="grid md:grid-cols-5 gap-12">

          {/* BRAND */}
          <div className="md:col-span-2">
            <h2 className="text-2xl font-semibold text-white">
              TradeSphere
            </h2>
            <p className="mt-4 text-slate-400 max-w-md">
              TradeSphere is a next-generation B2B & B2C marketplace platform with AI-verified products, secure escrow wallet, and a complete vendor trading ecosystem.
            </p>
          </div>

          {/* PLATFORM */}
          <div>
            <h4 className="text-white font-semibold mb-4">Platform</h4>
            <ul className="space-y-2 text-slate-400">
              <li><Link to="/market" className="hover:text-white">Marketplace</Link></li>
              <li><Link to="/cart" className="hover:text-white">Cart</Link></li>
              <li><Link to="/orders" className="hover:text-white">Orders</Link></li>
              <li><Link to="/wallet" className="hover:text-white">Wallet</Link></li>
              <li><Link to="/wishlist" className="hover:text-white">Wishlist</Link></li>
            </ul>
          </div>

          {/* VENDORS */}
          <div>
            <h4 className="text-white font-semibold mb-4">Vendors</h4>
            <ul className="space-y-2 text-slate-400">
              <li><Link to="/vendor" className="hover:text-white">Vendor dashboard</Link></li>
              <li><Link to="/vendor/products" className="hover:text-white">Manage products</Link></li>
              <li><Link to="/vendor/orders" className="hover:text-white">Vendor orders</Link></li>
              <li><Link to="/vendor/trade" className="hover:text-white">Vendor trading</Link></li>
            </ul>
          </div>

          {/* COMPANY */}
          <div>
            <h4 className="text-white font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-slate-400">
              <li><a href="#" className="hover:text-white">About</a></li>
              <li><a href="#" className="hover:text-white">Security</a></li>
              <li><a href="#" className="hover:text-white">Privacy policy</a></li>
              <li><a href="#" className="hover:text-white">Terms of service</a></li>
              <li><a href="#" className="hover:text-white">Support</a></li>
            </ul>
          </div>
        </div>

        {/* DIVIDER */}
        <div className="border-t border-slate-800 my-12"></div>

        {/* BOTTOM */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-slate-500 text-sm">
          <p>© {new Date().getFullYear()} TradeSphere. All rights reserved.</p>
          <p>Built as a multi-vendor trade and commerce platform.</p>
        </div>

      </div>
    </footer>
  );
}
