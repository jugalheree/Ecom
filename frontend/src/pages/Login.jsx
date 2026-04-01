import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { useToastStore } from "../store/toastStore";
import { useCartStore } from "../store/cartStore";
import { useState } from "react";
import api from "../services/api";

export default function Login() {
  const login = useAuthStore((s) => s.login);
  const syncGuestCart = useCartStore((s) => s.syncGuestCartToBackend);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get("redirect");
  const showToast = useToastStore((s) => s.showToast);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const handleLogin = async (e) => {
    e?.preventDefault();
    if (!email || !password) { showToast({ message: "Please fill all fields", type: "error" }); return; }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) { showToast({ message: "Invalid email address", type: "error" }); return; }
    setLoading(true);

    try {
      const response = await api.post("/api/auth/login", { email, password });

      // ✅ FIX: handle both response formats safely
      const data = response.data.data || response.data;

      // ✅ FIX: include token
      login({
        token: data.token,
        user: data.user,
        role: data.user.role.toLowerCase(),
      });

      try { await syncGuestCart(); } catch {}

      showToast({ message: "Welcome back!", type: "success" });

      const isSafeRedirect = redirect && redirect.startsWith("/") && !redirect.startsWith("//");
      if (isSafeRedirect) { navigate(redirect); return; }

      const role = data.user.role;
      if (role === "VENDOR") navigate("/vendor/dashboard");
      else if (role === "ADMIN") navigate("/admin/dashboard");
      else if (role === "EMPLOYEE") navigate("/delivery/dashboard");
      else navigate("/market");

    } catch (error) {
      showToast({ message: error?.response?.data?.message || error.message || "Login failed", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex flex-col justify-between w-[45%] bg-gradient-to-br from-ink-950 via-navy-950 to-ink-900 p-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-brand-500/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-navy-500/15 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-brand">
            <span className="text-white font-display font-bold italic">T</span>
          </div>
          <span className="text-xl font-display font-bold text-white">Trade<span className="text-brand-400">Sphere</span></span>
        </div>

        <div className="relative z-10 space-y-6">
          <h2 className="text-4xl font-display font-bold text-white leading-tight">
            Trade smarter,<br />
            <span className="text-brand-400 italic font-light">grow faster.</span>
          </h2>
          <p className="text-ink-400 leading-relaxed text-sm max-w-sm">
            Join thousands of buyers and vendors on India's most trusted AI-powered marketplace platform.
          </p>

          <div className="space-y-3">
            {[
              { icon: "🔒", text: "Escrow-protected payments" },
              { icon: "✅", text: "AI-verified product listings" },
              { icon: "📦", text: "Real-time order tracking" },
              { icon: "💰", text: "Integrated trade wallet" },
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-3 text-sm text-ink-300">
                <span className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">{f.icon}</span>
                {f.text}
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 text-xs text-ink-500">
          © {new Date().getFullYear()} TradeSphere. All rights reserved.
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 bg-sand-50">
        <div className="w-full max-w-md">
          <Link to="/" className="lg:hidden flex items-center gap-2.5 mb-8">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-brand">
              <span className="text-white font-display font-bold italic text-sm">T</span>
            </div>
            <span className="text-lg font-display font-bold text-ink-900">Trade<span className="text-brand-600">Sphere</span></span>
          </Link>

          <div className="mb-8">
            <h1 className="text-3xl font-display font-bold text-ink-900">Welcome back</h1>
            <p className="text-ink-500 mt-2 text-sm">Sign in to your TradeSphere account</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-ink-700 mb-1.5">Email address</label>
              <input
                type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="input-base"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-semibold text-ink-700">Password</label>
                <button type="button" className="text-xs text-brand-600 font-medium hover:text-brand-700" onClick={() => navigate("/forgot-password")}>Forgot password?</button>
              </div>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input-base pr-11"
                />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-600 transition-colors">
                  {showPw ? "👁️‍🗨️" : "👁️"}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-sm mt-2">
              {loading ? "Signing in..." : "Sign In →"}
            </button>
          </form>

          <p className="text-center text-sm text-ink-500 mt-6">
            Don't have an account?{" "}
            <Link to="/register" className="text-brand-600 font-semibold hover:text-brand-700">Create one free →</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

