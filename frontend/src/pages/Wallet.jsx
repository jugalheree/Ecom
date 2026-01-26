import { useState } from "react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import { useWalletStore } from "../store/walletStore";

export default function Wallet() {
  const balance = useWalletStore((s) => s.balance);
  const held = useWalletStore((s) => s.held);
  const transactions = useWalletStore((s) => s.transactions);
  const addMoney = useWalletStore((s) => s.addMoney);
  const withdrawMoney = useWalletStore((s) => s.withdrawMoney);

  const [showAdd, setShowAdd] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [amount, setAmount] = useState("");

  const available = balance - held;

  function handleAdd() {
    const val = Number(amount);
    if (val > 0) {
      addMoney(val);
      setAmount("");
      setShowAdd(false);
    }
  }

  function handleWithdraw() {
    const val = Number(amount);
    if (val > 0 && val <= available) {
      withdrawMoney(val);
      setAmount("");
      setShowWithdraw(false);
    }
  }

  return (
    <div className="container-app py-12">
      <h1>My Wallet</h1>
      <p className="text-slate-600 mt-1">
        Manage your funds, escrow, and transaction history.
      </p>

      {/* BALANCE CARDS */}
      <div className="grid md:grid-cols-3 gap-6 mt-8">
        <Card>
          <p className="text-slate-500 text-sm">Total Balance</p>
          <h2 className="text-3xl font-bold mt-1">₹{balance}</h2>
        </Card>

        <Card>
          <p className="text-slate-500 text-sm">Held in Escrow</p>
          <h2 className="text-3xl font-bold mt-1">₹{held}</h2>
        </Card>

        <Card>
          <p className="text-slate-500 text-sm">Available</p>
          <h2 className="text-3xl font-bold mt-1 text-green-600">
            ₹{available}
          </h2>
        </Card>
      </div>

      {/* ACTION BAR */}
      <Card className="mt-6 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-slate-600">
          Add money to your wallet or withdraw your available balance.
        </p>
        <div className="flex gap-3">
          <Button onClick={() => setShowAdd(true)}>Add money</Button>
          <Button variant="outline" onClick={() => setShowWithdraw(true)}>
            Withdraw
          </Button>
        </div>
      </Card>

      {/* TRANSACTIONS */}
      <div className="mt-10">
        <h2 className="text-xl font-semibold">Recent activity</h2>

        {transactions.length === 0 ? (
          <div className="mt-10 text-center">
            <div className="text-4xl mb-2">💳</div>
            <p className="font-medium">No transactions yet</p>
            <p className="text-slate-600 mt-1">
              Your wallet activity will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-3 mt-4">
            {transactions.map((tx, i) => (
              <Card key={i} className="flex justify-between items-center">
                <div>
                  <p className="font-medium">{tx.title}</p>
                  <p className="text-sm text-slate-600">{tx.date}</p>
                </div>
                <p
                  className={`font-semibold ${
                    tx.amount > 0 ? "text-green-600" : "text-red-500"
                  }`}
                >
                  {tx.amount > 0 ? "+" : "-"}₹{Math.abs(tx.amount)}
                </p>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* ADD MONEY MODAL */}
      {showAdd && (
        <Modal
          title="Add money"
          amount={amount}
          setAmount={setAmount}
          onClose={() => setShowAdd(false)}
          onConfirm={handleAdd}
          confirmText="Add money"
        />
      )}

      {/* WITHDRAW MODAL */}
      {showWithdraw && (
        <Modal
          title="Withdraw money"
          amount={amount}
          setAmount={setAmount}
          onClose={() => setShowWithdraw(false)}
          onConfirm={handleWithdraw}
          confirmText="Withdraw"
          subtitle={`Available balance: ₹${available}`}
        />
      )}
    </div>
  );
}

/* ---------- Modal Component ---------- */

function Modal({
  title,
  subtitle,
  amount,
  setAmount,
  onClose,
  onConfirm,
  confirmText,
}) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-md rounded-xl p-6 space-y-4">
        <div>
          <h2 className="text-xl font-semibold">{title}</h2>
          {subtitle && (
            <p className="text-sm text-slate-600 mt-1">{subtitle}</p>
          )}
        </div>

        <Input
          label="Amount"
          type="number"
          placeholder="Enter amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onConfirm}>{confirmText}</Button>
        </div>
      </div>
    </div>
  );
}
