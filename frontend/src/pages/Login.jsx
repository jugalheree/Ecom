import { Link, useNavigate } from "react-router-dom";
import Input from "../components/ui/Input";
import { useAuthStore } from "../store/authStore";
import { useToastStore } from "../store/toastStore";
import { useState } from "react";
import api from "../services/api";

export default function Login() {
  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();
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
      const { data } = response.data;
      login({ user: data.user, token: data.accessToken, role: data.user.role.toLowerCase() });
      showToast({ message: "Welcome back!", type: "success" });
      const role = data.user.role;
      if (role === "VENDOR") navigate("/vendor/dashboard");
      else if (role === "ADMIN") navigate("/admin/dashboard");
      else if (role === "DELIVERY") navigate("/delivery/dashboard");
      else navigate("/buyer/dashboard");
    } catch (error) {
      showToast({ message: error.message || "Login failed", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between w-[45%] bg-ink-950 p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-900/30 via-ink-950 to-ink-950" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-500/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent-500/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl" />

        <div className="relative z-10 flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-400 flex items-center justify-center shadow-glow">
            <span className="text-white font-display font-bold text-sm">TS</span>
          </div>
          <span className="text-white font-display font-bold text-xl">TradeSphere</span>
        </div>

        <div className="relative z-10 space-y-6">
          <h2 className="text-4xl font-display font-bold text-white leading-tight">
            Trade smarter,<br />
            <span className="gradient-text">grow faster.</span>
          </h2>
          <p className="text-ink-400 leading-relaxed text-sm max-w-sm">
            Join thousands of businesses using TradeSphere's AI-powered platform for B2B and B2C commerce.
          </p>
          <div className="grid grid-cols-2 gap-4 pt-4">
            {[
              { label: "Active Vendors", value: "1,200+" },
              { label: "Products Listed", value: "45K+" },
              { label: "Monthly Trades", value: "18K+" },
              { label: "Success Rate", value: "99.9%" },
            ].map((s) => (
              <div key={s.label} className="bg-white/5 border border-white/10 rounded-xl p-4">
                <p className="text-xl font-display font-bold text-white">{s.value}</p>
                <p className="text-xs text-ink-400 mt-1 font-medium">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-xs text-ink-600">© 2024 TradeSphere. All rights reserved.</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md animate-fade-up">
          <div className="mb-8">
            <h1 className="text-3xl font-display font-bold text-ink-900 mb-2">Welcome back</h1>
            <p className="text-ink-500 text-sm">Sign in to continue trading on TradeSphere.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <Input
              label="Email address"
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />

            <div className="relative">
              <Input
                label="Password"
                type={showPw ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-3 bottom-3 text-ink-400 hover:text-ink-600 text-xs font-medium transition-colors"
              >
                {showPw ? "Hide" : "Show"}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-ink-900 text-white py-3.5 rounded-xl font-display font-semibold text-sm hover:bg-ink-800 transition-all shadow-sm hover:shadow-md active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : "Sign in →"}
            </button>
          </form>

          <p className="text-sm text-ink-500 text-center mt-8">
            Don't have an account?{" "}
            <Link to="/register" className="text-primary-600 font-semibold hover:text-primary-700 transition-colors">
              Create one free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
