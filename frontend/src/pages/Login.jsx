import { Link, useNavigate } from "react-router-dom";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import { useAuthStore } from "../store/authStore";
import { useState } from "react";

export default function Login() {
  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <Card className="w-full max-w-md space-y-4">
        <h2>Login</h2>

        <Input
          label="Email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <Input
          label="Password"
          type="password"
          placeholder="Enter password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <Button
          className="w-full"
          onClick={() => {
          const userData = {
            user: { name: "Jugal" },
            token: "demo-token",
            role: "buyer",
          };

          login(userData);

          if (userData.role === "vendor") navigate("/vendor/dashboard");
          else navigate("/buyer/dashboard");
          }}
        >
          Login
        </Button>

        <p className="text-sm text-slate-600 text-center">
          Don’t have an account?{" "}
          <Link to="/register" className="text-blue-600">
            Register
          </Link>
        </p>
      </Card>
    </div>
  );
}
