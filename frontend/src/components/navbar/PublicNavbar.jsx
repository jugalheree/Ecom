import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

export default function PublicNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 h-[72px] transition-all duration-300 ${
      scrolled ? "bg-white/95 backdrop-blur-xl shadow-soft border-b border-ink-100" : "bg-white/80 backdrop-blur-sm"
    }`}>
      <div className="container-app h-full flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-brand">
            <span className="text-white font-display font-bold text-sm italic">T</span>
          </div>
          <span className="text-lg font-display font-bold text-ink-900">
            Trade<span className="text-brand-600">Sphere</span>
          </span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-6">
          <Link to="/market" className={`text-sm font-medium transition-colors ${location.pathname === "/market" ? "text-brand-600 font-semibold" : "text-ink-600 hover:text-ink-900"}`}>
            Marketplace
          </Link>
          <Link to="/login" className="text-sm font-medium text-ink-600 hover:text-ink-900 px-4 py-2 rounded-xl hover:bg-ink-50 transition-all">
            Sign In
          </Link>
          <Link to="/register">
            <button className="btn-primary px-5 py-2.5 text-sm">Get Started →</button>
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2.5 rounded-xl text-ink-500 hover:bg-ink-50 transition-all">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {mobileOpen ? <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></> : <><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></>}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-ink-100 shadow-card-hover px-4 pb-4">
          <Link to="/market" onClick={() => setMobileOpen(false)} className="block px-3 py-2.5 text-sm font-medium text-ink-600 hover:bg-ink-50 rounded-lg mt-2">Marketplace</Link>
          <Link to="/login" onClick={() => setMobileOpen(false)} className="block px-3 py-2.5 text-sm font-medium text-ink-600 hover:bg-ink-50 rounded-lg">Sign In</Link>
          <Link to="/register" onClick={() => setMobileOpen(false)} className="block mt-2">
            <button className="btn-primary w-full text-sm">Get Started →</button>
          </Link>
        </div>
      )}
    </nav>
  );
}
