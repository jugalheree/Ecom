import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

export default function PublicNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? "bg-white/90 backdrop-blur-xl shadow-sm border-b border-ink-100" : "bg-transparent"
    }`}>
      <div className="container-app h-20 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-600 to-primary-400 flex items-center justify-center shadow-sm group-hover:shadow-glow transition-shadow">
            <span className="text-white text-xs font-display font-bold">TS</span>
          </div>
          <span className="text-xl font-display font-bold text-ink-900 group-hover:text-primary-600 transition-colors">
            TradeSphere
          </span>
        </Link>

        <div className="flex items-center gap-8">
          <div className="hidden md:flex items-center gap-6">
            <Link to="/market" className={`text-sm font-medium transition-colors ${location.pathname === "/market" ? "text-primary-600" : "text-ink-600 hover:text-ink-900"}`}>
              Marketplace
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login">
              <button className="text-sm font-display font-semibold text-ink-600 hover:text-ink-900 px-4 py-2 rounded-xl hover:bg-ink-100 transition-all">
                Sign In
              </button>
            </Link>
            <Link to="/register">
              <button className="text-sm font-display font-semibold bg-ink-900 text-white px-5 py-2.5 rounded-xl hover:bg-ink-800 transition-all shadow-sm hover:shadow-md active:scale-[0.97]">
                Get Started
              </button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
