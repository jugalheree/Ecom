import { Outlet } from "react-router-dom";
import VendorNavbar from "../navbar/VendorNavbar";

export default function VendorLayout() {
  return (
    <div className="flex flex-col min-h-screen bg-sand-50">
      <VendorNavbar />
      <main className="flex-1 overflow-x-hidden">
        <Outlet />
      </main>
    </div>
  );
}
