import { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import api from "../services/api";
import { useToastStore } from "../store/toastStore";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const showToast = useToastStore((s) => s.showToast);

  const token = searchParams.get("token") || "";
  const email = searchParams.get("email") || "";

  const [form, setForm] = useState({ newPassword: "", confirm: "" });
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!token || !email) {
      showToast({ message: "Invalid reset link", type: "error" });
      navigate("/forgot-password");
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.newPassword.length < 6) {
      showToast({ message: "Password must be at least 6 characters", type: "error" }); return;
    }
    if (form.newPassword !== form.confirm) {
      showToast({ message: "Passwords don't match", type: "error" }); return;
    }
    setLoading(true);
    try {
      await api.post("/api/auth/reset-password", { email, token, newPassword: form.newPassword });
      setDone(true);
      showToast({ message: "Password reset! Please log in.", type: "success" });
      setTimeout(() => navigate("/login"), 2500);
    } catch (err) {
      showToast({ message: err?.response?.data?.message || "Reset failed — link may have expired", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const strength = (() => {
    const p = form.newPassword;
    if (!p) return null;
    if (p.length < 6) return { label: "Too short", color: "bg-red-400", width: "25%" };
    if (p.length < 8) return { label: "Weak", color: "bg-orange-400", width: "50%" };
    if (/[A-Z]/.test(p) && /[0-9]/.test(p)) return { label: "Strong", color: "bg-green-500", width: "100%" };
    return { label: "Fair", color: "bg-yellow-400", width: "75%" };
  })();

  return (
    <div className="min-h-screen bg-sand-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-block text-2xl font-display font-bold text-ink-900 mb-6">TradeSphere</Link>
          <h1 className="text-2xl font-display font-bold text-ink-900">Set new password</h1>
          <p className="text-ink-500 text-sm mt-2">
            Resetting password for <strong className="text-ink-700">{decodeURIComponent(email)}</strong>
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-ink-200 shadow-sm overflow-hidden">
          {!done ? (
            <form onSubmit={handleSubmit} className="p-8 space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-ink-500 mb-2">New Password</label>
                <div className="relative">
                  <input
                    type={show ? "text" : "password"}
                    value={form.newPassword}
                    onChange={(e) => setForm((f) => ({ ...f, newPassword: e.target.value }))}
                    placeholder="Min 6 characters"
                    autoFocus
                    className="w-full rounded-xl border-2 border-ink-200 bg-white px-4 py-3 pr-12 text-sm text-ink-900 placeholder:text-ink-300 focus:outline-none focus:border-ink-900 focus:ring-4 focus:ring-ink-900/5 transition-all"
                  />
                  <button type="button" onClick={() => setShow((s) => !s)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-700 text-xs font-semibold">
                    {show ? "Hide" : "Show"}
                  </button>
                </div>
                {strength && (
                  <div className="mt-2 space-y-1">
                    <div className="h-1.5 w-full bg-ink-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-300 ${strength.color}`} style={{ width: strength.width }} />
                    </div>
                    <p className="text-xs text-ink-400">{strength.label}</p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-ink-500 mb-2">Confirm Password</label>
                <input
                  type={show ? "text" : "password"}
                  value={form.confirm}
                  onChange={(e) => setForm((f) => ({ ...f, confirm: e.target.value }))}
                  placeholder="Repeat your password"
                  className={`w-full rounded-xl border-2 bg-white px-4 py-3 text-sm text-ink-900 placeholder:text-ink-300 focus:outline-none focus:ring-4 transition-all ${
                    form.confirm && form.confirm !== form.newPassword
                      ? "border-red-300 focus:border-red-400 focus:ring-red-400/10"
                      : "border-ink-200 focus:border-ink-900 focus:ring-ink-900/5"
                  }`}
                />
                {form.confirm && form.confirm !== form.newPassword && (
                  <p className="text-xs text-red-500 mt-1">Passwords don't match</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || form.newPassword !== form.confirm || !form.newPassword}
                className="w-full py-3.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-50 active:scale-[0.98]"
                style={{ background: "linear-gradient(135deg,#131318 0%,#3e3e48 100%)", boxShadow: "0 4px 20px rgba(19,19,24,0.25)" }}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Resetting...
                  </span>
                ) : "Reset Password"}
              </button>
            </form>
          ) : (
            <div className="p-8 text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto text-3xl">✅</div>
              <h2 className="text-lg font-display font-bold text-ink-900">Password reset!</h2>
              <p className="text-sm text-ink-500">Redirecting you to login...</p>
            </div>
          )}

          <div className="px-8 py-4 border-t border-ink-100 bg-sand-50 text-center">
            <Link to="/login" className="text-sm text-brand-600 hover:text-brand-800 font-semibold transition-colors">
              ← Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
