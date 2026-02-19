import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="w-full bg-stone-900 text-stone-300 border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid md:grid-cols-5 gap-12">
          <div className="md:col-span-2">
            <h2 className="text-2xl font-bold font-display text-white mb-4">
              TradeSphere
            </h2>
            <p className="text-stone-400 max-w-md leading-relaxed">
              A next-generation B2B & B2C marketplace platform with AI-verified
              products, secure escrow wallet, and a complete vendor trading
              ecosystem.
            </p>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Platform</h4>
            <ul className="space-y-3 text-stone-400">
              <li>
                <Link to="/market" className="hover:text-white transition-colors duration-200">
                  Marketplace
                </Link>
              </li>
              <li>
                <Link to="/cart" className="hover:text-white transition-colors duration-200">
                  Cart
                </Link>
              </li>
              <li>
                <Link to="/orders" className="hover:text-white transition-colors duration-200">
                  Orders
                </Link>
              </li>
              <li>
                <Link to="/wallet" className="hover:text-white transition-colors duration-200">
                  Wallet
                </Link>
              </li>
              <li>
                <Link
                  to="/wishlist"
                  className="hover:text-white transition-colors duration-200"
                >
                  Wishlist
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Vendors</h4>
            <ul className="space-y-3 text-stone-400">
              <li>
                <Link
                  to="/vendor"
                  className="hover:text-white transition-colors duration-200"
                >
                  Vendor dashboard
                </Link>
              </li>
              <li>
                <Link
                  to="/vendor/products"
                  className="hover:text-white transition-colors duration-200"
                >
                  Manage products
                </Link>
              </li>
              <li>
                <Link
                  to="/vendor/orders"
                  className="hover:text-white transition-colors duration-200"
                >
                  Vendor orders
                </Link>
              </li>
              <li>
                <Link
                  to="/vendor/trade"
                  className="hover:text-white transition-colors duration-200"
                >
                  Vendor trading
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Company</h4>
            <ul className="space-y-3 text-stone-400">
              <li>
                <a href="#" className="hover:text-white transition-colors duration-200">
                  About
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors duration-200">
                  Security
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors duration-200">
                  Privacy policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors duration-200">
                  Terms of service
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors duration-200">
                  Support
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-stone-800 my-12"></div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-stone-500 text-sm">
          <p>© {new Date().getFullYear()} TradeSphere. All rights reserved.</p>
          <p className="text-stone-600">Built as a multi-vendor trade and commerce platform.</p>
        </div>
      </div>
    </footer>
  );
}
