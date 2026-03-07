import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Input from "../components/ui/Input";
import { useAuthStore } from "../store/authStore";
import { useToastStore } from "../store/toastStore";
import api from "../services/api";

const roles = [
  { value: "BUYER", label: "Buyer", desc: "Browse & purchase", icon: "🛍️" },
  { value: "VENDOR", label: "Vendor", desc: "Sell & manage trades", icon: "🏪" },
  { value: "ADMIN", label: "Admin", desc: "Manage platform", icon: "⚙️" },
  { value: "DELIVERY", label: "Delivery", desc: "Deliver orders", icon: "🚚" },
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
      else if (form.role === "DELIVERY") navigate("/delivery/dashboard");
      else navigate("/market");
    } catch (error) {
      showToast({ message: error.message || "Registration failed", type: "error" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-ink-50 flex items-start justify-center pt-24 pb-16 px-4">
      <div className="w-full max-w-lg animate-fade-up">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-600 to-primary-400 flex items-center justify-center shadow-sm">
              <span className="text-white font-display font-bold text-sm">TS</span>
            </div>
            <span className="text-xl font-display font-bold text-ink-900">TradeSphere</span>
          </Link>
          <h1 className="text-3xl font-display font-bold text-ink-900 mb-2">Create your account</h1>
          <p className="text-ink-500 text-sm">Choose how you want to use TradeSphere</p>
        </div>

        <div className="bg-white rounded-3xl border border-ink-200 p-8 shadow-sm space-y-7">
          {/* Role Selector */}
          <div>
            <p className="text-xs font-display font-bold uppercase tracking-widest text-ink-400 mb-3">Account type</p>
            <div className="grid grid-cols-2 gap-2.5">
              {roles.map((r) => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setForm({ ...form, role: r.value, isB2B: false })}
                  className={`p-4 rounded-xl border-2 text-left transition-all duration-150 ${
                    form.role === r.value
                      ? "border-primary-500 bg-primary-50 shadow-sm"
                      : "border-ink-200 hover:border-ink-300 hover:bg-ink-50"
                  }`}
                >
                  <span className="text-xl mb-2 block">{r.icon}</span>
                  <p className="font-display font-semibold text-ink-900 text-sm">{r.label}</p>
                  <p className="text-xs text-ink-500 mt-0.5">{r.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleRegister} className="space-y-4">
            <Input label="Full Name" name="name" placeholder="Your full name" value={form.name} onChange={handleChange} disabled={loading} />
            <Input label="Email" type="email" name="email" placeholder="you@company.com (optional if phone given)" value={form.email} onChange={handleChange} disabled={loading} />
            <Input label="Phone" type="tel" name="phone" placeholder="10-digit number (optional if email given)" value={form.phone} onChange={handleChange} disabled={loading} />
            <Input label="Password" type="password" name="password" placeholder="At least 6 characters" value={form.password} onChange={handleChange} disabled={loading} />

            {form.role === "BUYER" && (
              <label className="flex items-center gap-3 p-4 bg-ink-50 rounded-xl border-2 border-ink-200 cursor-pointer hover:border-primary-300 transition-colors group">
                <div className="relative flex-shrink-0">
                  <input type="checkbox" name="isB2B" checked={form.isB2B} onChange={handleChange} className="sr-only" />
                  <div className={`w-11 h-6 rounded-full transition-colors ${form.isB2B ? "bg-primary-500" : "bg-ink-300"}`} />
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.isB2B ? "translate-x-6" : "translate-x-1"}`} />
                </div>
                <div>
                  <p className="font-display font-semibold text-ink-900 text-sm">B2B Buyer</p>
                  <p className="text-xs text-ink-500 mt-0.5">Access bulk pricing and B2B-only products</p>
                </div>
              </label>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-ink-900 text-white py-3.5 rounded-xl font-display font-semibold text-sm hover:bg-ink-800 transition-all shadow-sm hover:shadow-md active:scale-[0.98] disabled:opacity-50 mt-2"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating account...
                </span>
              ) : "Create account →"}
            </button>
          </form>

          <p className="text-sm text-ink-500 text-center">
            Already have an account?{" "}
            <Link to="/login" className="text-primary-600 font-semibold hover:text-primary-700 transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
