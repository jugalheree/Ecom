import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";

export default function TradeWallet() {
  const navigate = useNavigate();

  const [wallet, setWallet] = useState({
    available: 12500,
    locked: 8600,
    withdrawn: 4200,
  });

  const [amount, setAmount] = useState("");

  const withdraw = () => {
    if (!amount || amount <= 0 || amount > wallet.available) return;

    setWallet((prev) => ({
      available: prev.available - Number(amount),
      locked: prev.locked,
      withdrawn: prev.withdrawn + Number(amount),
    }));

    setAmount("");
  };

  return (
    <div className="min-h-screen bg-white mt-16">
      <div className="container-app py-12 space-y-10">

        {/* HEADER */}
        <div>
          <h1 className="text-5xl md:text-6xl font-display font-bold text-stone-900 mb-4">
            Trade Wallet
          </h1>
          <p className="text-xl text-stone-600">
            Manage escrow funds, available balance and withdrawals.
          </p>
        </div>

        {/* HERO BALANCE */}
        <Card className="p-10 border-2 border-stone-200">
          <p className="text-stone-500 font-medium">Available balance</p>
          <h2 className="text-5xl font-bold text-emerald-600 mt-2">
            ₹{wallet.available.toLocaleString()}
          </h2>

          <div className="flex gap-4 mt-6">
            <Button className="px-8 py-3" onClick={withdraw}>
              Withdraw funds
            </Button>

            <Button
              variant="outline"
              className="px-8 py-3"
              onClick={() => navigate("/wallet/claims")}
            >
              Claims center
            </Button>
          </div>
        </Card>

        {/* STATS */}
        <div className="grid md:grid-cols-3 gap-8">

          <Balance
            title="Locked in escrow"
            value={wallet.locked}
            yellow
          />

          <Balance
            title="Total withdrawn"
            value={wallet.withdrawn}
          />

          <Balance
            title="Lifetime earnings"
            value={wallet.available + wallet.withdrawn}
            green
          />

        </div>

        {/* WITHDRAW + INFO */}
        <div className="grid lg:grid-cols-2 gap-8">

          {/* WITHDRAW PANEL */}
          <Card className="p-8 border-2 border-stone-200">
            <h3 className="text-2xl font-semibold text-stone-900 mb-2">
              Withdraw funds
            </h3>

            <p className="text-stone-600 text-sm mb-6">
              Transfer your available balance to your bank account.
            </p>

            <Input
              label="Amount"
              type="number"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />

            <Button className="w-full mt-6 py-3" onClick={withdraw}>
              Withdraw now
            </Button>
          </Card>

          {/* INFO PANEL */}
          <Card className="p-8 border-2 border-stone-200">
            <h3 className="text-2xl font-semibold text-stone-900 mb-4">
              How your wallet works
            </h3>

            <ul className="text-sm text-stone-600 space-y-3 list-disc pl-5">
              <li>Buyer payments first enter escrow (locked).</li>
              <li>Locked funds cannot be withdrawn.</li>
              <li>After order completion, money becomes available.</li>
              <li>Available funds can be withdrawn anytime.</li>
            </ul>

            <div className="mt-6 p-4 rounded-xl bg-yellow-50 text-sm text-yellow-700">
              🔒 ₹{wallet.locked.toLocaleString()} is currently locked in escrow
              and will be released once related orders are completed.
            </div>
          </Card>

        </div>

      </div>
    </div>
  );
}

/* BALANCE CARD */
function Balance({ title, value, green, yellow }) {
  return (
    <Card className="p-8 border-2 border-stone-200">
      <p className="text-sm text-stone-500">{title}</p>

      <p
        className={`text-3xl font-semibold mt-2 ${
          green
            ? "text-emerald-600"
            : yellow
            ? "text-yellow-600"
            : "text-stone-900"
        }`}
      >
        ₹{value.toLocaleString()}
      </p>
    </Card>
  );
}
