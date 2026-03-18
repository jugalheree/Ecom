import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { useCartStore } from "../../store/cartStore";
import { useState, useRef, useEffect, useCallback } from "react";
import { marketplaceAPI } from "../../services/apis/index";

export default function BuyerNavbar() {
  const { user, logout } = useAuthStore();
  const cart = useCartStore((s) => s.cart);
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropOpen, setDropOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const searchRef = useRef(null);
  const debounceTimer = useRef(null);

  const navLinks = [
    { to: "/market", label: "Shop" },
    { to: "/orders", label: "Orders" },
    { to: "/wishlist", label: "Wishlist" },
    { to: "/wallet", label: "Wallet" },
  ];

  const fetchSuggestions = useCallback((q) => {
    clearTimeout(debounceTimer.current);
    if (q.trim().length < 2) { setSuggestions([]); setShowSuggestions(false); return; }
    debounceTimer.current = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const res = await marketplaceAPI.getSearchSuggestions(q);
        setSuggestions(res.data?.data || []);
        setShowSuggestions(true);
      } catch { setSuggestions([]); }
      finally { setSearchLoading(false); }
    }, 280);
  }, []);

  const handleSearchInput = (e) => { setSearchQuery(e.target.value); fetchSuggestions(e.target.value); };
  const handleSearchSubmit = (e) => { e.preventDefault(); if (searchQuery.trim().length < 2) return; setShowSuggestions(false); navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`); };
  const handleSuggestionClick = (s) => { setSearchQuery(s); setShowSuggestions(false); navigate(`/search?q=${encodeURIComponent(s)}`); };

  useEffect(() => {
    const h = (e) => { if (searchRef.current && !searchRef.current.contains(e.target)) setShowSuggestions(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const cartCount = cart.length;
  const isActive = (path) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-[72px] bg-white border-b border-ink-100 shadow-sm">
      <div className="container-app h-full flex items-center gap-3">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 flex-shrink-0 mr-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-brand">
            <span className="text-white font-display font-bold text-sm italic">T</span>
          </div>
          <span className="text-lg font-display font-bold text-ink-900 hidden sm:block">
            Trade<span className="text-brand-600">Sphere</span>
          </span>
        </Link>

        {/* Search */}
        <div ref={searchRef} className="relative flex-1 max-w-lg hidden md:block">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchInput}
              onFocus={() => searchQuery.length >= 2 && setShowSuggestions(true)}
              placeholder="Search products, brands, categories..."
              className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-ink-200 bg-sand-50 focus:bg-white focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none text-sm text-ink-900 placeholder-ink-400 transition-all"
            />
            <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-brand-600 transition-colors">
              {searchLoading
                ? <div className="w-4 h-4 border-2 border-ink-200 border-t-brand-500 rounded-full animate-spin" />
                : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              }
            </button>
          </form>
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl border border-ink-200 shadow-card-hover overflow-hidden z-50">
              {suggestions.map((s, i) => (
                <button key={i} onClick={() => handleSuggestionClick(s)} className="w-full text-left px-4 py-2.5 text-sm text-ink-700 hover:bg-brand-50 hover:text-brand-700 transition-colors flex items-center gap-2.5">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Desktop nav links */}
        <div className="hidden lg:flex items-center gap-0.5">
          {navLinks.map((l) => (
            <Link key={l.to} to={l.to}
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${isActive(l.to) ? "bg-brand-50 text-brand-700 font-semibold" : "text-ink-500 hover:text-ink-900 hover:bg-ink-50"}`}>
              {l.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-1 ml-auto lg:ml-0">
          {/* Cart */}
          <Link to="/cart" className="relative p-2.5 rounded-xl text-ink-500 hover:text-brand-600 hover:bg-brand-50 transition-all">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 min-w-[18px] px-1 bg-brand-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
                {cartCount}
              </span>
            )}
          </Link>

          {/* User dropdown */}
          <div className="relative">
            <button onClick={() => setDropOpen(!dropOpen)}
              className="flex items-center gap-2 px-2.5 py-2 rounded-xl hover:bg-ink-50 transition-all">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 text-white flex items-center justify-center font-bold text-sm shadow-brand">
                {user?.name?.[0]?.toUpperCase() || "U"}
              </div>
              <span className="text-sm font-medium text-ink-700 hidden sm:block">{user?.name?.split(" ")[0]}</span>
              <svg width="12" height="12" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" fill="none" className={`text-ink-400 transition-transform ${dropOpen ? "rotate-180" : ""}`}><polyline points="6 9 12 15 18 9"/></svg>
            </button>

            {dropOpen && (
              <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-card-hover border border-ink-100 overflow-hidden z-50">
                <div className="px-4 py-3 border-b border-ink-100 bg-sand-50">
                  <p className="font-semibold text-ink-900 text-sm">{user?.name}</p>
                  <p className="text-[10px] text-brand-600 font-semibold mt-0.5 uppercase tracking-wider">Buyer Account</p>
                </div>
                <div className="p-1.5">
                  {[
                    { label: "Dashboard", path: "/buyer/dashboard" },
                    { label: "My Orders", path: "/orders" },
                    { label: "Wishlist", path: "/wishlist" },
                    { label: "Wallet", path: "/wallet" },
                  ].map((item) => (
                    <button key={item.path} onClick={() => { navigate(item.path); setDropOpen(false); }}
                      className="w-full text-left px-3 py-2 rounded-lg text-sm text-ink-600 hover:text-ink-900 hover:bg-sand-50 transition-all">
                      {item.label}
                    </button>
                  ))}
                  <div className="border-t border-ink-100 my-1" />
                  <button onClick={() => { logout(); navigate("/"); setDropOpen(false); }}
                    className="w-full text-left px-3 py-2 rounded-lg text-sm text-red-500 hover:bg-red-50 hover:text-red-700 transition-all">
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Mobile hamburger */}
          <button onClick={() => setMenuOpen(!menuOpen)} className="lg:hidden p-2.5 rounded-xl text-ink-500 hover:bg-ink-50 transition-all ml-1">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {menuOpen ? <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></> : <><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></>}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="lg:hidden bg-white border-t border-ink-100 shadow-card-hover px-4 pb-4">
          {/* Mobile search */}
          <form onSubmit={handleSearchSubmit} className="relative mt-3 mb-2">
            <input type="text" value={searchQuery} onChange={handleSearchInput} placeholder="Search products..."
              className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-ink-200 bg-sand-50 outline-none text-sm text-ink-900 placeholder-ink-400" />
            <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            </button>
          </form>
          {navLinks.map((l) => (
            <Link key={l.to} to={l.to} onClick={() => setMenuOpen(false)}
              className={`block px-3 py-2.5 rounded-lg text-sm font-medium mb-0.5 ${isActive(l.to) ? "bg-brand-50 text-brand-700" : "text-ink-600 hover:bg-ink-50"}`}>
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
