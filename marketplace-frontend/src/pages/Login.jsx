import { Link } from "react-router-dom";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import { useAuthStore } from "../store/authStore";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();
  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <Card className="w-full max-w-md space-y-4">
        <h2>Login</h2>

        <Input label="Email" placeholder="Enter your email" />
        <Input label="Password" type="password" placeholder="Enter password" />

        <Button
          className="w-full"
          onClick={() => {
            login({
              user: { name: "Demo User" },
              token: "demo-token",
              role: "vendor", // change to "buyer" to test later
            });
            navigate("/dashboard");
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
