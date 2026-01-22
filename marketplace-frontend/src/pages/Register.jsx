import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";

export default function Register() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <Card className="w-full max-w-md space-y-4">
        <h2>Create account</h2>

        <Input label="Name" placeholder="Enter name" />
        <Input label="Email" placeholder="Enter email" />
        <Input label="Password" type="password" placeholder="Create password" />

        <select className="border rounded-lg px-3 py-2 w-full">
          <option>Buyer</option>
          <option>Vendor</option>
        </select>

        <Button className="w-full">Register</Button>
      </Card>
    </div>
  );
}
