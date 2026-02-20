import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import { useAuthStore } from "../store/authStore";
import { useToastStore } from "../store/toastStore";
import api from "../services/api";

export default function Register() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const showToast = useToastStore((s) => s.showToast);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "BUYER",
  });

  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function selectRole(role) {
    setForm({ ...form, role });
  }

  async function handleRegister(e) {
    e.preventDefault();

    if (!form.name || !form.email || !form.password) {
      showToast({ message: "Please fill all fields", type: "error" });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      showToast({ message: "Invalid email address", type: "error" });
      return;
    }

    if (form.password.length < 6) {
      showToast({ message: "Password too short", type: "error" });
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/api/auth/register", form);

      const { data } = response.data;

      login({
        user: data.user,
        token: data.accessToken,
        role: data.user.role.toLowerCase(),
      });

      showToast({ message: "Welcome to TradeSphere!", type: "success" });

      if (form.role === "VENDOR") navigate("/vendor/dashboard");
      else if (form.role === "ADMIN") navigate("/admin/dashboard");
      else if (form.role === "DELIVERY") navigate("/delivery/dashboard");
      else navigate("/market");
    } catch (error) {
      showToast({
        message: error.message || "Registration failed",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 to-primary-50/20 flex items-center justify-center mt-16 px-4">

      <Card className="w-full max-w-lg p-10 space-y-8 border-2 border-stone-200">

        <div className="text-center">
          <h2 className="text-3xl font-display font-bold text-stone-900">
            Create your account
          </h2>
          <p className="text-stone-500 mt-2">
            Choose how you want to use TradeSphere
          </p>
        </div>

        {/* ROLE SELECTOR */}
        <div className="grid grid-cols-2 gap-4">

          <RoleCard
            title="Buyer"
            desc="Browse & purchase products"
            active={form.role === "BUYER"}
            onClick={() => selectRole("BUYER")}
          />

          <RoleCard
            title="Vendor"
            desc="Sell & manage trades"
            active={form.role === "VENDOR"}
            onClick={() => selectRole("VENDOR")}
          />

          <RoleCard
            title="Admin"
            desc="Manage platform & users"
            active={form.role === "ADMIN"}
            onClick={() => selectRole("ADMIN")}
          />

          <RoleCard
            title="Delivery"
            desc="Deliver orders & track"
            active={form.role === "DELIVERY"}
            onClick={() => selectRole("DELIVERY")}
          />

        </div>

        {/* FORM */}
        <form onSubmit={handleRegister} className="space-y-5">

          <Input
            label="Name"
            name="name"
            placeholder="Enter name"
            value={form.name}
            onChange={handleChange}
            disabled={loading}
          />

          <Input
            label="Email"
            type="email"
            name="email"
            placeholder="Enter email"
            value={form.email}
            onChange={handleChange}
            disabled={loading}
          />

          <Input
            label="Password"
            type="password"
            name="password"
            placeholder="Create password"
            value={form.password}
            onChange={handleChange}
            disabled={loading}
          />

          <Button type="submit" className="w-full py-3">
            {loading ? "Creating account..." : "Create account"}
          </Button>

        </form>

      </Card>
    </div>
  );
}

/* ROLE CARD */
function RoleCard({ title, desc, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`p-5 rounded-2xl border-2 text-left transition ${
        active
          ? "border-primary-600 bg-primary-50"
          : "border-stone-200 hover:border-primary-300 hover:bg-stone-50"
      }`}
    >
      <h3 className="font-semibold text-stone-900">{title}</h3>
      <p className="text-sm text-stone-500 mt-1">{desc}</p>
    </button>
  );
}
