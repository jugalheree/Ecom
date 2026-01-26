import { Link } from "react-router-dom";
import Button from "../ui/Button";

export default function PublicNavbar() {
  return (
    <nav className="bg-white border-b sticky top-0 z-50">
      <div className="container-app h-16 flex items-center justify-between">

        {/* LOGO */}
        <Link to="/" className="text-xl font-bold text-green-600">
          TradeSphere
        </Link>

        {/* RIGHT SIDE */}
        <div className="flex items-center gap-6 text-sm font-medium text-slate-700">

          <Link to="/market" className="hover:text-green-600 transition">
            Marketplace
          </Link>

          <Link to="/login">
            <Button>Login</Button>
          </Link>

        </div>
      </div>
    </nav>
  );
}
