import { Link } from "react-router-dom";
import Button from "../ui/Button";

export default function PublicNavbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-stone-200/50">
      <div className="container-app h-20 flex items-center justify-between">
        <Link
          to="/"
          className="text-2xl font-bold font-display text-stone-900 hover:text-primary-600 transition-colors duration-200"
        >
          TradeSphere
        </Link>

        <div className="flex items-center gap-8">
          <div className="hidden md:flex items-center gap-8">
            <Link
              to="/market"
              className="text-sm font-medium text-stone-700 hover:text-stone-900 transition-colors duration-200"
            >
              Marketplace
            </Link>
            <Link
              to="/"
              className="text-sm font-medium text-stone-700 hover:text-stone-900 transition-colors duration-200"
            >
              {/* Features
            </Link>
            <Link
              to="/"
              className="text-sm font-medium text-stone-700 hover:text-stone-900 transition-colors duration-200"
            > */}
              {/* About */}
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <Link to="/login">
              <Button variant="ghost" className="hidden sm:inline-flex text-sm">
                Sign In
              </Button>
            </Link>
            <Link to="/register">
              <Button className="text-sm">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
