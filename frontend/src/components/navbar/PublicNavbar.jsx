import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { useCartStore } from "../../store/cartStore";
import { useWishlistStore } from "../../store/wishlistStore";
import { marketplaceAPI } from "../../services/apis/index";

export default function PublicNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const searchRef = useRef(null);
  const cart = useCartStore((s) => s.cart);
  const wishlist = useWishlistStore((s) => s.wishlist);
  const cartCount = cart.length;
  const wishlistCount = wishlist.length;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) setShowSuggestions(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (searchQuery.trim().length < 2) { setSuggestions([]); return; }
    const timer = setTimeout(async () => {
      try {
        const res = await marketplaceAPI.getSearchSuggestions(searchQuery.trim());
        setSuggestions(res.data?.data || []);
        setShowSuggestions(true);
      } catch { setSuggestions([]); }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setShowSuggestions(false);
    navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-white/95 backdrop-blur-xl shadow-soft border-b border-ink-100" : "bg-white/90 backdrop-blur-sm"}`}>
      <div className="container-app h-[68px] flex items-center gap-3">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 flex-shrink-0 mr-1">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-brand">
            <span className="text-white font-display font-bold text-sm italic">T</span>
          </div>
          <span className="text-lg font-display font-bold text-ink-900 hidden sm:block">Trade<span className="text-brand-600">Sphere</span></span>
        </Link>

        {/* Left Nav Links */}
        <div className="hidden md:flex items-center gap-0.5 flex-shrink-0">
          <Link to="/market" className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all ${location.pathname === "/market" ? "text-brand-600 bg-brand-50 font-semibold" : "text-ink-600 hover:text-ink-900 hover:bg-ink-50"}`}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            Marketplace
          </Link>
          <Link to="/login" className="px-3 py-2 rounded-xl text-sm font-medium text-ink-600 hover:text-ink-900 hover:bg-ink-50 transition-all">Sign In</Link>
          <Link to="/register"><button className="btn-primary px-4 py-2 text-sm ml-1">Get Started →</button></Link>
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-lg" ref={searchRef}>
          <form onSubmit={handleSearch} className="relative">
            <div className="relative flex items-center">
              <svg className="absolute left-3.5 text-ink-400 pointer-events-none" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                placeholder="Search products, brands..."
                className="w-full pl-10 pr-10 py-2.5 rounded-xl border-2 border-ink-200 bg-white text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 transition-all"
              />
              {searchQuery && (
                <button type="button" onClick={() => { setSearchQuery(""); setSuggestions([]); }} className="absolute right-3 text-ink-400 hover:text-ink-600">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              )}
            </div>
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-2xl border border-ink-100 shadow-card-hover overflow-hidden z-50">
                {suggestions.slice(0, 6).map((s, i) => (
                  <button key={i} type="button" onClick={() => { const q = s.title || s; setSearchQuery(q); setShowSuggestions(false); navigate(`/search?q=${encodeURIComponent(q)}`); }}
                    className="w-full text-left px-4 py-2.5 text-sm text-ink-700 hover:bg-sand-50 flex items-center gap-3 transition-colors">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-ink-400"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                    <span>{s.title || s}</span>
                    {s.category && <span className="ml-auto text-xs text-ink-400">{s.category}</span>}
                  </button>
                ))}
                <button type="submit" className="w-full text-left px-4 py-2.5 text-sm font-semibold text-brand-600 hover:bg-brand-50 border-t border-ink-100 flex items-center gap-2">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                  Search for "{searchQuery}"
                </button>
              </div>
            )}
          </form>
        </div>

        {/* Wishlist + Cart */}
        <div className="flex items-center gap-0.5 flex-shrink-0">
          <Link to="/wishlist" className="relative p-2 rounded-xl text-ink-500 hover:text-ink-900 hover:bg-ink-50 transition-all" title="Wishlist">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
            {wishlistCount > 0 && <span className="absolute -top-0.5 -right-0.5 min-w-[17px] h-[17px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-0.5">{wishlistCount > 9 ? "9+" : wishlistCount}</span>}
          </Link>
          <Link to="/cart" className="relative p-2 rounded-xl text-ink-500 hover:text-ink-900 hover:bg-ink-50 transition-all" title="Cart">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/></svg>
            {cartCount > 0 && <span className="absolute -top-0.5 -right-0.5 min-w-[17px] h-[17px] bg-brand-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-0.5">{cartCount > 9 ? "9+" : cartCount}</span>}
          </Link>
          <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 rounded-xl text-ink-500 hover:bg-ink-50 transition-all ml-1">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {mobileOpen ? <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></> : <><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></>}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-ink-100 shadow-card-hover px-4 pb-4 space-y-1">
          <form onSubmit={(e) => { e.preventDefault(); setMobileOpen(false); if (searchQuery.trim()) navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`); }} className="pt-3 pb-2">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search products..." className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-ink-200 bg-sand-50 text-sm focus:outline-none focus:border-brand-400"/>
            </div>
          </form>
          <Link to="/market" onClick={() => setMobileOpen(false)} className="block px-3 py-2.5 text-sm font-medium text-ink-600 hover:bg-ink-50 rounded-lg">Marketplace</Link>
          <Link to="/login" onClick={() => setMobileOpen(false)} className="block px-3 py-2.5 text-sm font-medium text-ink-600 hover:bg-ink-50 rounded-lg">Sign In</Link>
          <Link to="/register" onClick={() => setMobileOpen(false)} className="block mt-2"><button className="btn-primary w-full text-sm py-2.5">Get Started →</button></Link>
        </div>
      )}
    </nav>
  );
}
