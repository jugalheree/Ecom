import { useState } from "react";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";

export default function WalletClaims() {
  const [claims, setClaims] = useState([
    {
      id: 1,
      amount: 3200,
      reason: "Order #201 completed",
      status: "Pending",
      date: "2026-01-20",
    },
    {
      id: 2,
      amount: 5400,
      reason: "Bulk order settlement",
      status: "Approved",
      date: "2026-01-18",
    },
  ]);

  const [form, setForm] = useState({
    amount: "",
    reason: "",
  });

  const submitClaim = () => {
    if (!form.amount || !form.reason) return;

    setClaims([
      {
        id: Date.now(),
        amount: Number(form.amount),
        reason: form.reason,
        status: "Pending",
        date: new Date().toISOString().slice(0, 10),
      },
      ...claims,
    ]);

    setForm({ amount: "", reason: "" });
  };

  const statusColor = (status) => {
    if (status === "Approved") return "bg-green-100 text-green-700";
    if (status === "Rejected") return "bg-red-100 text-red-700";
    return "bg-yellow-100 text-yellow-700";
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">

      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">
          Wallet claims
        </h1>
        <p className="text-slate-600 mt-1">
          Submit and track your escrow release requests.
        </p>
      </div>

      {/* TOP GRID */}
      <div className="grid md:grid-cols-3 gap-6">

        {/* CLAIM FORM */}
        <Card className="p-6 md:col-span-1">
          <h3 className="font-semibold text-lg mb-2">
            Submit new claim
          </h3>
          <p className="text-sm text-slate-600 mb-4">
            Request release of locked escrow funds.
          </p>

          <Input
            label="Claim amount"
            type="number"
            placeholder="Enter amount"
            value={form.amount}
            onChange={(e) =>
              setForm({ ...form, amount: e.target.value })
            }
          />

          <Input
            label="Reason"
            placeholder="Example: Order #203 delivered"
            value={form.reason}
            onChange={(e) =>
              setForm({ ...form, reason: e.target.value })
            }
          />

          <Button className="w-full mt-4" onClick={submitClaim}>
            Submit claim
          </Button>
        </Card>

        {/* ESCROW INFO */}
        <Card className="p-6 md:col-span-2">
          <h3 className="font-semibold text-lg mb-3">
            How claims work
          </h3>

          <ul className="text-sm text-slate-600 space-y-2 list-disc pl-5">
            <li>Claims can only be made on locked escrow funds.</li>
            <li>Each claim is reviewed before approval.</li>
            <li>Once approved, funds move to available balance.</li>
            <li>Rejected claims can be resubmitted.</li>
          </ul>

          <div className="mt-5 p-4 rounded-xl bg-blue-50 text-sm text-blue-700">
            🛡 Claims protect both buyers and vendors by ensuring money is
            released only after valid order completion.
          </div>
        </Card>
      </div>

      {/* CLAIM HISTORY */}
      <Card className="p-6">
        <h3 className="font-semibold text-lg mb-4">
          Claim history
        </h3>

        {claims.length === 0 ? (
          <p className="text-slate-500 text-sm">
            No claims submitted yet.
          </p>
        ) : (
          <div className="space-y-3">
            {claims.map((c) => (
              <div
                key={c.id}
                className="flex justify-between items-center border-b last:border-b-0 pb-3 last:pb-0"
              >
                <div>
                  <p className="font-medium">₹{c.amount}</p>
                  <p className="text-sm text-slate-500">
                    {c.reason} • {c.date}
                  </p>
                </div>

                <span
                  className={`text-xs px-3 py-1 rounded-full ${statusColor(
                    c.status
                  )}`}
                >
                  {c.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
