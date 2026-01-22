import { Link } from "react-router-dom";

export default function VendorSidebar() {
  return (
    <aside className="w-64 min-h-screen bg-slate-900 text-white p-5">

      <h2 className="text-xl font-bold mb-8">Vendor Panel</h2>

      <nav className="flex flex-col gap-4 text-sm">
        <Link to="/dashboard" className="hover:text-blue-400">
          Dashboard
        </Link>
        <Link to="/vendor/products" className="hover:text-blue-400">
          Products
        </Link>
        <Link to="/vendor/stock" className="hover:text-blue-400">
          Stock
        </Link>
        <Link to="/vendor/trade" className="hover:text-blue-400">
          Trade
        </Link>
        <Link to="/vendor/reports" className="hover:text-blue-400">
          Reports
        </Link>
      </nav>
    </aside>
  );
}
