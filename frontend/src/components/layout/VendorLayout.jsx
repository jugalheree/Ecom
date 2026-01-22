import { useState } from "react";
import VendorSidebar from "./VendorSidebar";

export default function VendorLayout({ children }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      {/* SIDEBAR */}
      <div
        className={`fixed md:static z-50 ${
          open ? "block" : "hidden"
        } md:block`}
      >
        <VendorSidebar />
      </div>

      {/* MAIN */}
      <div className="flex-1 bg-slate-50 min-h-screen">
        {/* TOP BAR (mobile) */}
        <div className="md:hidden bg-white border-b p-4 flex items-center justify-between">
          <h2 className="font-bold">Vendor Panel</h2>
          <button
            className="text-xl"
            onClick={() => setOpen(!open)}
          >
            ☰
          </button>
        </div>

        <main className="p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
