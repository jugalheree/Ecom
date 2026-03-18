import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { useToastStore } from "../store/toastStore";
import api from "../services/api";

const roles = [
  { value: "BUYER", label: "Buyer", desc: "Browse & purchase products", icon: "🛍️" },
  { value: "VENDOR", label: "Vendor", desc: "Sell & manage your store", icon: "🏪" },
  { value: "EMPLOYEE", label: "Delivery", desc: "Deliver orders", icon: "🚚" },
  { value: "ADMIN", label: "Admin", desc: "Manage the platform", icon: "⚙️" },
];

export default function Register() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const showToast = useToastStore((s) => s.showToast);
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", role: "BUYER", isB2B: false });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  async function handleRegister(e) {
    e.preventDefault();
    if (!form.name || !form.password) { showToast({ message: "Name and password are required", type: "error" }); return; }
    if (!form.email && !form.phone) { showToast({ message: "Email or phone is required", type: "error" }); return; }
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) { showToast({ message: "Invalid email address", type: "error" }); return; }
    if (form.phone && !/^\d{10}$/.test(form.phone)) { showToast({ message: "Enter valid 10-digit phone", type: "error" }); return; }
    if (form.password.length < 6) { showToast({ message: "Password must be at least 6 characters", type: "error" }); return; }
    setLoading(true);
    try {
      const payload = { name: form.name, password: form.password, role: form.role };
      if (form.email) payload.email = form.email;
      if (form.phone) payload.phone = form.phone;
      if (form.role === "BUYER") payload.isB2B = form.isB2B;
      const response = await api.post("/api/auth/register", payload);
      const { data } = response.data;
      login({ user: data.user, token: data.accessToken, role: data.user.role.toLowerCase() });
      showToast({ message: "Welcome to TradeSphere!", type: "success" });
      if (form.role === "VENDOR") navigate("/vendor/setup");
      else if (form.role === "ADMIN") navigate("/admin/dashboard");
      else if (form.role === "EMPLOYEE") navigate("/delivery/dashboard");
      else navigate("/market");
    } catch (error) {
      showToast({ message: error.message || "Registration failed", type: "error" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between w-[42%] bg-gradient-to-br from-navy-950 via-ink-950 to-ink-900 p-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-brand-500/10 rounded-full -translate-y-1/3 translate-x-1/3 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-navy-500/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl pointer-events-none" />

        <Link to="/" className="relative z-10 flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-brand">
            <span className="text-white font-display font-bold italic">T</span>
          </div>
          <span className="text-xl font-display font-bold text-white">Trade<span className="text-brand-400">Sphere</span></span>
        </Link>

        <div className="relative z-10 space-y-6">
          <h2 className="text-4xl font-display font-bold text-white leading-tight">
            Your marketplace<br />
            <span className="text-brand-400 italic font-light">journey starts here.</span>
          </h2>
          <p className="text-ink-400 text-sm leading-relaxed max-w-xs">
            Whether you're shopping or selling, TradeSphere gives you the tools, trust, and technology to succeed.
          </p>
          <div className="space-y-3 pt-2">
            {[
              { icon: "🔒", text: "Escrow-protected payments" },
              { icon: "🤖", text: "AI Trust Score for every product" },
              { icon: "📊", text: "Real-time analytics dashboard" },
              { icon: "💬", text: "Dedicated vendor support" },
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-3 text-sm text-ink-300">
                <span className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">{f.icon}</span>
                {f.text}
              </div>
            ))}
          </div>
        </div>
        <p className="relative z-10 text-xs text-ink-500">© {new Date().getFullYear()} TradeSphere.</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6 bg-sand-50 overflow-y-auto">
        <div className="w-full max-w-md py-8">
          {/* Mobile logo */}
          <Link to="/" className="lg:hidden flex items-center gap-2.5 mb-8">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-brand">
              <span className="text-white font-display font-bold italic text-sm">T</span>
            </div>
            <span className="text-lg font-display font-bold text-ink-900">Trade<span className="text-brand-600">Sphere</span></span>
          </Link>

          <div className="mb-8">
            <h1 className="text-3xl font-display font-bold text-ink-900">Create your account</h1>
            <p className="text-ink-500 mt-2 text-sm">Choose how you want to use TradeSphere</p>
          </div>

          {/* Role selector */}
          <div className="grid grid-cols-2 gap-2.5 mb-6">
            {roles.map((r) => (
              <button key={r.value} type="button"
                onClick={() => setForm({ ...form, role: r.value, isB2B: false })}
                className={`p-4 rounded-xl border-2 text-left transition-all duration-150 ${
                  form.role === r.value
                    ? "border-brand-500 bg-brand-50 shadow-soft"
                    : "border-ink-200 bg-white hover:border-ink-300"
                }`}>
                <span className="text-xl mb-2 block">{r.icon}</span>
                <p className="font-semibold text-ink-900 text-sm">{r.label}</p>
                <p className="text-xs text-ink-500 mt-0.5">{r.desc}</p>
              </button>
            ))}
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-ink-700 mb-1.5">Full Name</label>
              <input name="name" value={form.name} onChange={handleChange} placeholder="Your full name" className="input-base" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-ink-700 mb-1.5">Email Address</label>
              <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="you@example.com" className="input-base" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-ink-700 mb-1.5">Phone Number <span className="text-ink-400 font-normal">(optional)</span></label>
              <input type="tel" name="phone" value={form.phone} onChange={handleChange} placeholder="10-digit mobile number" className="input-base" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-ink-700 mb-1.5">Password</label>
              <input type="password" name="password" value={form.password} onChange={handleChange} placeholder="At least 6 characters" className="input-base" />
            </div>

            {form.role === "BUYER" && (
              <label className="flex items-center gap-3 p-4 bg-white rounded-xl border-2 border-ink-200 cursor-pointer hover:border-brand-300 transition-colors">
                <div className="relative flex-shrink-0">
                  <input type="checkbox" name="isB2B" checked={form.isB2B} onChange={handleChange} className="sr-only" />
                  <div className={`w-11 h-6 rounded-full transition-colors ${form.isB2B ? "bg-brand-500" : "bg-ink-300"}`} />
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.isB2B ? "translate-x-6" : "translate-x-1"}`} />
                </div>
                <div>
                  <p className="font-semibold text-ink-900 text-sm">B2B Buyer</p>
                  <p className="text-xs text-ink-500 mt-0.5">Access bulk pricing and B2B-only products</p>
                </div>
              </label>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-sm mt-2">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Creating account...
                </span>
              ) : "Create Account →"}
            </button>
          </form>

          <p className="text-center text-sm text-ink-500 mt-6">
            Already have an account?{" "}
            <Link to="/login" className="text-brand-600 font-semibold hover:text-brand-700">Sign in →</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
