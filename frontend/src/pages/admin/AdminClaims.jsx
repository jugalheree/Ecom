import { useEffect, useState } from "react";
import api from "../../services/api";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";

export default function AdminClaims() {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchClaims = () => {
    api
      .get("/api/admin/claims?page=1&limit=20")
      .then((res) => {
        setClaims(res.data.data?.claims || []);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchClaims();
  }, []);

  const approve = async (id) => {
    await api.post(`/api/admin/claims/${id}/approve`);
    setClaims((prev) =>
      prev.map((c) =>
        c.claimId === id ? { ...c, status: "APPROVED" } : c
      )
    );
  };

  const reject = async (id) => {
    await api.post(`/api/admin/claims/${id}/reject`, {
      reason: "Rejected by admin",
    });
    setClaims((prev) =>
      prev.map((c) =>
        c.claimId === id ? { ...c, status: "REJECTED" } : c
      )
    );
  };

  const statusColor = (status) => {
    if (status === "APPROVED") return "text-emerald-600";
    if (status === "REJECTED") return "text-red-600";
    if (status === "PENDING") return "text-amber-600";
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="container-app py-12">

        <div className="mb-10">
          <h1 className="text-5xl font-display font-bold text-stone-900 mb-4">
            Admin Claims
          </h1>
          <p className="text-xl text-stone-600">
            Manage refund and dispute claims.
          </p>
        </div>

        <Card className="p-8 border-2 border-stone-200 overflow-x-auto">

          {loading ? (
            <p>Loading claims...</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-200 text-left text-stone-500">
                  <th className="py-3">Claim ID</th>
                  <th>User</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {claims.map((c) => (
                  <tr key={c._id} className="border-b border-stone-200">
                    <td className="py-4 font-medium">{c.claimId}</td>
                    <td>{c.userId}</td>
                    <td>{c.type}</td>
                    <td>₹{c.amount}</td>
                    <td className={statusColor(c.status)}>
                      {c.status}
                    </td>
                    <td>
                      {c.status === "PENDING" && (
                        <div className="flex gap-2">
                          <Button onClick={() => approve(c.claimId)}>
                            Approve
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => reject(c.claimId)}
                          >
                            Reject
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

        </Card>

      </div>
    </div>
  );
}