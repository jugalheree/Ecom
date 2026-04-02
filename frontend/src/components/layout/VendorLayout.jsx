import { Outlet, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import VendorNavbar from "../navbar/VendorNavbar";
import { vendorAPI } from "../../services/apis/index";

function PendingApprovalScreen({ adminRemark }) {
  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6">
      <div className="max-w-lg w-full text-center">
        <div className="w-24 h-24 rounded-3xl mx-auto mb-6 flex items-center justify-center text-5xl"
          style={{ background: "linear-gradient(135deg,#fff7ed,#ffedd5)", border: "2px solid #fed7aa" }}>
          ⏳
        </div>
        <h1 className="text-3xl font-display font-bold text-ink-900 mb-3">Pending Approval</h1>
        <p className="text-ink-500 text-sm leading-relaxed mb-6">
          Your vendor account is under review. Our team typically approves accounts within
          <strong className="text-ink-700"> 24–48 hours</strong>. You will be able to access
          all features once approved.
        </p>
        {adminRemark && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl text-left">
            <p className="text-xs font-bold uppercase tracking-wider text-red-600 mb-1">Admin Note</p>
            <p className="text-sm text-red-700">{adminRemark}</p>
          </div>
        )}
        <div className="bg-white border border-ink-200 rounded-2xl p-5 text-left mb-6 space-y-3">
          <p className="text-xs font-bold uppercase tracking-wider text-ink-400 mb-3">What happens next?</p>
          {[
            { icon: "📄", text: "We review your submitted documents and business details" },
            { icon: "✅", text: "Once approved, you get full access to list products and manage orders" },
            { icon: "📧", text: "You will receive an email notification when your account is approved" },
          ].map((step, i) => (
            <div key={i} className="flex items-start gap-3">
              <span className="text-xl flex-shrink-0 mt-0.5">{step.icon}</span>
              <p className="text-sm text-ink-600">{step.text}</p>
            </div>
          ))}
        </div>
        <div className="flex gap-3 justify-center">
          <Link to="/" className="px-6 py-2.5 rounded-xl border-2 border-ink-200 text-sm font-semibold text-ink-600 hover:bg-ink-50 transition-colors">
            Go to Home
          </Link>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-colors"
            style={{ background: "linear-gradient(135deg,#f05f00,#ff7d07)" }}
          >
            Refresh Status
          </button>
        </div>
      </div>
    </div>
  );
}

export default function VendorLayout() {
  const [verificationStatus, setVerificationStatus] = useState(null);
  const [adminRemark, setAdminRemark] = useState(null);

  useEffect(() => {
    vendorAPI.getProfile()
      .then((r) => {
        setVerificationStatus(r.data?.data?.verificationStatus || "PENDING");
        setAdminRemark(r.data?.data?.adminRemark || null);
      })
      .catch(() => setVerificationStatus("PENDING"));
  }, []);

  const isApproved = verificationStatus === "VERIFIED";
  const isLoading = verificationStatus === null;

  return (
    <div className="flex flex-col min-h-screen bg-sand-50">
      <VendorNavbar />
      <main className="flex-1 overflow-x-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
              <p className="text-sm text-ink-400">Loading your account...</p>
            </div>
          </div>
        ) : isApproved ? (
          <Outlet />
        ) : (
          <PendingApprovalScreen adminRemark={adminRemark} />
        )}
      </main>
    </div>
  );
}
