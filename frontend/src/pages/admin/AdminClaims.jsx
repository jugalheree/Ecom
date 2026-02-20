import { useEffect, useState } from "react";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Loader from "../../components/ui/Loader";
import api from "../../services/api";
import { useToastStore } from "../../store/toastStore";

export default function AdminClaims() {
  const [data, setData] = useState({ claims: [], total: 0, page: 1, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const showToast = useToastStore((s) => s.showToast);

  const fetchClaims = () => {
    api
      .get("/api/admin/claims", { params: { page: 1, limit: 50 } })
      .then((res) => setData(res.data.data))
      .catch(() => setData({ claims: [], total: 0, page: 1, totalPages: 0 }))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    setLoading(true);
    fetchClaims();
  }, []);

  const handleApprove = (claimId) => {
    api
      .post(`/api/admin/claims/${claimId}/approve`)
      .then(() => {
        showToast({ message: "Claim approved", type: "success" });
        fetchClaims();
      })
      .catch((e) => showToast({ message: e?.message || "Failed to approve", type: "error" }));
  };

  const handleReject = (claimId) => {
    api
      .post(`/api/admin/claims/${claimId}/reject`, { reason: "Rejected by admin" })
      .then(() => {
        showToast({ message: "Claim rejected", type: "success" });
        fetchClaims();
      })
      .catch((e) => showToast({ message: e?.message || "Failed to reject", type: "error" }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  const claims = data.claims || [];

  return (
    <div className="min-h-screen bg-white">
      <div className="container-app py-12">
        <div className="mb-12">
          <h1 className="text-5xl md:text-6xl font-display font-bold text-stone-900 mb-4">
            Claims
          </h1>
          <p className="text-xl text-stone-600">
            Approve or reject user claims ({data.total})
          </p>
        </div>
        <Card className="p-6 border-2 border-stone-200 overflow-hidden hover:border-primary-300 transition-all duration-300">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-stone-200">
                  <th className="pb-3 font-semibold text-stone-700">Claim ID</th>
                  <th className="pb-3 font-semibold text-stone-700">Type</th>
                  <th className="pb-3 font-semibold text-stone-700">Amount</th>
                  <th className="pb-3 font-semibold text-stone-700">Status</th>
                  <th className="pb-3 font-semibold text-stone-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {claims.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-stone-500 text-center">
                      No claims found.
                    </td>
                  </tr>
                ) : (
                  claims.map((c) => (
                    <tr key={c._id} className="border-b border-stone-100 hover:bg-stone-50">
                      <td className="py-3 font-medium text-stone-900">{c.claimId}</td>
                      <td className="py-3 text-stone-600">{c.type}</td>
                      <td className="py-3 text-stone-700">₹{Number(c.amount).toLocaleString()}</td>
                      <td className="py-3">
                        <Badge type={c.status === "PENDING" ? "warning" : c.status === "APPROVED" ? "success" : "danger"}>
                          {c.status}
                        </Badge>
                      </td>
                      <td className="py-3">
                        {c.status === "PENDING" && (
                          <span className="flex gap-2">
                            <Button variant="accent" className="py-1.5 px-3 text-xs" onClick={() => handleApprove(c._id)}>
                              Approve
                            </Button>
                            <Button variant="danger" className="py-1.5 px-3 text-xs" onClick={() => handleReject(c._id)}>
                              Reject
                            </Button>
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
