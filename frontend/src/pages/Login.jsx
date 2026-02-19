import { Link, useNavigate } from "react-router-dom";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
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

  const handleLogin = async (e) => {
    e?.preventDefault();

    if (!email || !password) {
      showToast({ message: "Please fill all fields", type: "error" });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showToast({ message: "Invalid email address", type: "error" });
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/api/auth/login", { email, password });

      const { data } = response.data;

      login({
        user: data.user,
        token: data.accessToken,
        role: data.user.role.toLowerCase(),
      });

      showToast({ message: "Welcome back!", type: "success" });

      const role = data.user.role;
      if (role === "VENDOR") navigate("/vendor/dashboard");
      else if (role === "ADMIN") navigate("/admin/dashboard");
      else if (role === "DELIVERY") navigate("/delivery/dashboard");
      else navigate("/buyer/dashboard");
    } catch (error) {
      showToast({
        message: error.message || "Login failed",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 to-primary-50/20 flex items-center justify-center px-4">

      <Card className="w-full max-w-lg p-10 space-y-8 border-2 border-stone-200">

        <div className="text-center">
          <h2 className="text-3xl font-display font-bold text-stone-900">
            Welcome back
          </h2>
          <p className="text-stone-500 mt-2">
            Sign in to continue trading
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">

          <Input
            label="Email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />

          <Input
            label="Password"
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />

          <Button type="submit" className="w-full py-3">
            {loading ? "Logging in..." : "Login"}
          </Button>

        </form>

        <p className="text-sm text-stone-600 text-center">
          Don’t have an account?{" "}
          <Link
            to="/register"
            className="text-primary-600 font-medium hover:text-primary-700"
          >
            Create one
          </Link>
        </p>

      </Card>
    </div>
  );
}
