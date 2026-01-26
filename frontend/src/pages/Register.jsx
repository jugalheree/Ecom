import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import { useAuthStore } from "../store/authStore";

export default function Register() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "buyer",
  });

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleRegister(e) {
    e.preventDefault();

    if (!form.name || !form.email || !form.password) {
      alert("Please fill all fields");
      return;
    }

    // ✅ fake register (later backend API)
    const fakeAuthData = {
      user: { name: form.name, email: form.email },
      token: "demo_token_123",
      role: form.role,
    };

    login(fakeAuthData);

    // role based redirect
    if (form.role === "vendor") {
      navigate("/vendor/dashboard");
    } else {
      navigate("/market");
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <Card className="w-full max-w-md space-y-4">
        <h2>Create account</h2>

        <form onSubmit={handleRegister} className="space-y-4">
          <Input
            label="Name"
            placeholder="Enter name"
            name="name"
            value={form.name}
            onChange={handleChange}
          />

          <Input
            label="Email"
            placeholder="Enter email"
            name="email"
            value={form.email}
            onChange={handleChange}
          />

          <Input
            label="Password"
            type="password"
            placeholder="Create password"
            name="password"
            value={form.password}
            onChange={handleChange}
          />

          <div>
            <label className="text-sm font-medium">Account type</label>
            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              className="border rounded-lg px-3 py-2 w-full mt-1"
            >
              <option value="buyer">Buyer</option>
              <option value="vendor">Vendor</option>
            </select>
          </div>

          <Button type="submit" className="w-full">
            Register
          </Button>
        </form>
      </Card>
    </div>
  );
}
