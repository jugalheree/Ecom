import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { useToastStore } from "../store/toastStore";

export default function ForgotPassword() {
  const showToast = useToastStore((s) => s.showToast);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [devLink, setDevLink] = useState(""); // dev only

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) { showToast({ message: "Enter your email", type: "error" }); return; }
    setLoading(true);
    try {
      const res = await api.post("/api/auth/forgot-password", { email: email.trim().toLowerCase() });
      setSent(true);
      // Dev mode: backend returns resetUrl directly — remove in production
      if (res.data?.data?.resetUrl) setDevLink(res.data.data.resetUrl);
    } catch (err) {
      showToast({ message: err?.response?.data?.message || "Something went wrong", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-sand-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-block text-2xl font-display font-bold text-ink-900 mb-6">TradeSphere</Link>
          <h1 className="text-2xl font-display font-bold text-ink-900">Forgot your password?</h1>
          <p className="text-ink-500 text-sm mt-2">Enter your email and we'll send you a reset link.</p>
        </div>

        <div className="bg-white rounded-2xl border border-ink-200 shadow-sm overflow-hidden">
          {!sent ? (
            <form onSubmit={handleSubmit} className="p-8 space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-ink-500 mb-2">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoFocus
                  className="w-full rounded-xl border-2 border-ink-200 bg-white px-4 py-3 text-sm text-ink-900 placeholder:text-ink-300 focus:outline-none focus:border-ink-900 focus:ring-4 focus:ring-ink-900/5 transition-all"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-50 active:scale-[0.98]"
                style={{ background: "linear-gradient(135deg,#131318 0%,#3e3e48 100%)", boxShadow: "0 4px 20px rgba(19,19,24,0.25)" }}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Sending...
                  </span>
                ) : "Send Reset Link"}
              </button>
            </form>
          ) : (
            <div className="p-8 text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto text-3xl">📧</div>
              <h2 className="text-lg font-display font-bold text-ink-900">Check your inbox</h2>
              <p className="text-sm text-ink-500 leading-relaxed">
                If <strong>{email}</strong> has an account, a password reset link has been sent. Check your spam folder too.
              </p>
              {/* FIX: Dev-only reset link — only rendered in local dev builds, never in production */}
              {import.meta.env.DEV && devLink && (
                <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl text-left">
                  <p className="text-xs font-bold text-amber-700 mb-1">⚠️ Dev mode only — reset link:</p>
                  <Link to={devLink.replace(window.location.origin, "")} className="text-xs text-brand-600 break-all hover:underline">
                    Click here to reset password
                  </Link>
                </div>
              )}
              <button
                onClick={() => { setSent(false); setDevLink(""); }}
                className="text-sm text-ink-400 hover:text-ink-700 transition-colors mt-2"
              >Try a different email</button>
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
