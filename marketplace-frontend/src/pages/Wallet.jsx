import { useWalletStore } from "../store/walletStore";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";

export default function Wallet() {
  const { balance, held, transactions, addMoney } = useWalletStore();

  return (
    <div className="container-app py-10 space-y-6">
      <h1>My Wallet</h1>

      {/* BALANCE */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <p className="text-slate-600 text-sm">Available Balance</p>
          <h2 className="mt-1">₹{balance}</h2>
          <Button className="mt-4" onClick={() => addMoney(1000)}>
            Add ₹1000
          </Button>
        </Card>

        <Card>
          <p className="text-slate-600 text-sm">Held in Escrow</p>
          <h2 className="mt-1">₹{held}</h2>
          <p className="text-xs text-slate-500 mt-2">
            Released after order delivery
          </p>
        </Card>
      </div>

      {/* TRANSACTIONS */}
      <Card>
        <h3>Transactions</h3>

        {transactions.length === 0 && (
          <div className="mt-4 text-center">
            <p className="font-medium">No wallet activity yet</p>
            <p className="text-slate-500 text-sm mt-1">
              Your transactions will appear here.
            </p>
          </div>
        )}

        <div className="mt-4 space-y-2">
          {transactions.map((t) => (
            <div
              key={t.id}
              className="flex justify-between text-sm border-b pb-1"
            >
              <span>{t.note}</span>
              <span
                className={
                  t.type === "add" ? "text-green-600" : "text-orange-600"
                }
              >
                ₹{t.amount}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
