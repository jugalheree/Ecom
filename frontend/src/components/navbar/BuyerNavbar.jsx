import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { useCartStore } from "../../store/cartStore";
import { useWishlistStore } from "../../store/wishlistStore";
import { useState, useRef, useEffect, useCallback } from "react";
import { marketplaceAPI } from "../../services/apis/index";

export default function BuyerNavbar() {
  const { user, logout } = useAuthStore();
  const cart = useCartStore((s) => s.cart);
  const wishlist = useWishlistStore((s) => s.wishlist);
  const cartCount = cart.length;
  const wishlistCount = wishlist.length;
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropOpen, setDropOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const searchRef = useRef(null);
  const dropRef = useRef(null);
  const debounceTimer = useRef(null);

  const navLinks = [
    {
      to: "/market",
      label: "Shop",
      icon: "M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z",
    },
    {
      to: "/buyer/dashboard",
      label: "Dashboard",
      icon: "M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z",
    },
    {
      to: "/orders",
      label: "Orders",
      icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",
    },
    {
      to: "/wallet",
      label: "Wallet",
      icon: "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z",
    },
  ];

  const fetchSuggestions = useCallback((q) => {
    clearTimeout(debounceTimer.current);
    if (q.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    debounceTimer.current = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const res = await marketplaceAPI.getSearchSuggestions(q);
        setSuggestions(res.data?.data || []);
        setShowSuggestions(true);
      } catch {
        setSuggestions([]);
      } finally {
        setSearchLoading(false);
      }
    }, 280);
  }, []);

  const handleSearchInput = (e) => {
    setSearchQuery(e.target.value);
    fetchSuggestions(e.target.value);
  };
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim().length < 2) return;
    setShowSuggestions(false);
    navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
  };
  const handleSuggestionClick = (s) => {
    setSearchQuery(s);
    setShowSuggestions(false);
    navigate(`/search?q=${encodeURIComponent(s)}`);
  };

  useEffect(() => {
    const h = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target))
        setShowSuggestions(false);
      if (dropRef.current && !dropRef.current.contains(e.target))
        setDropOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const isActive = (path) => location.pathname === path;

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm"
      style={{ borderBottom: "3px solid #ff7d07" }}
    >
      {/* Top row */}
      <div className="container-app flex items-center justify-between h-14 gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 flex-shrink-0">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-display font-bold text-sm italic shadow-brand"
            style={{
              background: "linear-gradient(135deg, #ff7d07 0%, #c74400 100%)",
            }}
          >
            T
          </div>
          <span className="text-base font-display font-bold text-ink-900 hidden sm:block tracking-tight">
            Trade<span style={{ color: "#f05f00" }}>Sphere</span>
          </span>
        </Link>

        {/* Search — center */}
        <div
          ref={searchRef}
          className="relative flex-1 max-w-md hidden md:block"
        >
          <form onSubmit={handleSearchSubmit}>
            <div className="relative flex items-center">
              <svg
                className="absolute left-3.5 text-ink-400 pointer-events-none flex-shrink-0"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchInput}
                onFocus={() =>
                  searchQuery.length >= 2 && setShowSuggestions(true)
                }
                placeholder="Search products, brands..."
                className="w-full pl-9 pr-4 py-2 rounded-xl text-sm outline-none transition-all"
                style={{
                  background: "#fff8ed",
                  border: "1.5px solid #ffdba0",
                  color: "#131318",
                }}
              />
              {searchLoading && (
                <div className="absolute right-3 w-4 h-4 border-2 border-orange-200 border-t-orange-500 rounded-full animate-spin" />
              )}
            </div>
          </form>
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-xl border border-orange-100 shadow-card-hover overflow-hidden z-50">
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => handleSuggestionClick(s)}
                  className="w-full text-left px-4 py-2.5 text-sm text-ink-700 hover:bg-orange-50 transition-colors flex items-center gap-2.5"
                >
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right icons */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {/* Wishlist */}
          <Link
            to="/wishlist"
            title="Wishlist"
            className="relative p-2 rounded-xl transition-all hover:bg-orange-50 group"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-ink-400 group-hover:text-orange-500 transition-colors"
            >
              <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
            </svg>
            {wishlistCount > 0 && (
              <span
                className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1"
                style={{ background: "#ef4444" }}
              >
                {wishlistCount > 9 ? "9+" : wishlistCount}
              </span>
            )}
          </Link>

          {/* Cart */}
          <Link
            to="/cart"
            title="Cart"
            className="relative p-2 rounded-xl transition-all hover:bg-orange-50 group"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-ink-400 group-hover:text-orange-500 transition-colors"
            >
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" />
            </svg>
            {cartCount > 0 && (
              <span
                className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1"
                style={{ background: "#ff7d07" }}
              >
                {cartCount > 9 ? "9+" : cartCount}
              </span>
            )}
          </Link>

          <div
            className="w-px h-5 mx-1 hidden sm:block"
            style={{ background: "#e9e9ee" }}
          />

          {/* User */}
          <div className="relative" ref={dropRef}>
            <button
              onClick={() => setDropOpen(!dropOpen)}
              className="flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-xl hover:bg-orange-50 transition-all"
            >
              <div
                className="w-7 h-7 rounded-lg text-white flex items-center justify-center font-bold text-xs shadow-brand flex-shrink-0"
                style={{
                  background: "linear-gradient(135deg,#ff9d2e,#f05f00)",
                }}
              >
                {user?.name?.[0]?.toUpperCase() || "U"}
              </div>
              <span className="text-sm font-semibold text-ink-700 hidden sm:block">
                {user?.name?.split(" ")[0]}
              </span>
              <svg
                width="11"
                height="11"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2.5"
                fill="none"
                className={`text-ink-400 hidden sm:block transition-transform duration-200 ${
                  dropOpen ? "rotate-180" : ""
                }`}
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>

            {dropOpen && (
              <div
                className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-card-hover overflow-hidden z-50"
                style={{ border: "1.5px solid #ffefd0" }}
              >
                <div
                  className="px-4 py-3"
                  style={{
                    background: "linear-gradient(135deg,#fff8ed,#ffefd0)",
                    borderBottom: "1px solid #ffdba0",
                  }}
                >
                  <p className="font-bold text-ink-900 text-sm">{user?.name}</p>
                  <p
                    className="text-[10px] font-bold uppercase tracking-widest mt-0.5"
                    style={{ color: "#f05f00" }}
                  >
                    Buyer Account
                  </p>
                </div>
                <div className="p-1.5">
                  {[
                    { label: "Account Settings", path: "/profile" },
                  ].map((item) => (
                    <button
                      key={item.path}
                      onClick={() => {
                        navigate(item.path);
                        setDropOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg text-sm text-ink-600 hover:text-ink-900 hover:bg-orange-50 transition-all"
                    >
                      {item.label}
                    </button>
                  ))}
                  <div
                    className="my-1"
                    style={{ borderTop: "1px solid #ffefd0" }}
                  />
                  <button
                    onClick={() => {
                      logout();
                      navigate("/");
                      setDropOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 transition-all"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="lg:hidden p-2 rounded-xl hover:bg-orange-50 transition-all ml-1"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-ink-500"
            >
              {menuOpen ? (
                <>
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </>
              ) : (
                <>
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </>
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Bottom row — nav links with brand color bar */}
      <div
        className="hidden lg:block"
        style={{
          background:
            "linear-gradient(90deg,#c74400 0%,#f05f00 40%,#ff7d07 100%)",
        }}
      >
        <div className="container-app flex items-center gap-1 h-9">
          {navLinks.map((l) => {
            const active = isActive(l.to);
            return (
              <Link
                key={l.to}
                to={l.to}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all relative"
                style={{
                  color: active ? "#c74400" : "rgba(255,255,255,0.85)",
                  background: active ? "white" : "transparent",
                  letterSpacing: "0.02em",
                }}
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                >
                  <path d={l.icon} />
                </svg>
                {l.label}
              </Link>
            );
          })}
          {/* Separator + extra quick links */}
          <div
            className="w-px h-4 mx-1"
            style={{ background: "rgba(255,255,255,0.25)" }}
          />
          <Link
            to="/wishlist"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all"
            style={{
              color: isActive("/wishlist")
                ? "#c74400"
                : "rgba(255,255,255,0.85)",
              background: isActive("/wishlist") ? "white" : "transparent",
            }}
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            >
              <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
            </svg>
            Wishlist
          </Link>
          <Link
            to="/ratings"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all"
            style={{
              color: isActive("/ratings")
                ? "#c74400"
                : "rgba(255,255,255,0.85)",
              background: isActive("/ratings") ? "white" : "transparent",
            }}
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            >
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
            Ratings
          </Link>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div
          className="lg:hidden bg-white px-4 pb-4"
          style={{ borderTop: "1px solid #ffefd0" }}
        >
          <form onSubmit={handleSearchSubmit} className="relative mt-3 mb-3">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchInput}
              placeholder="Search..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none"
              style={{ background: "#fff8ed", border: "1.5px solid #ffdba0" }}
            />
          </form>
          <div className="space-y-0.5">
            {[
              ...navLinks,
              { to: "/wishlist", label: "Wishlist" },
              { to: "/ratings", label: "Ratings" },
            ].map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setMenuOpen(false)}
                className="flex items-center px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
                style={{
                  background: isActive(l.to) ? "#fff8ed" : "transparent",
                  color: isActive(l.to) ? "#f05f00" : "#4a4a55",
                }}
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
