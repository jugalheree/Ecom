import { Outlet } from "react-router-dom";
import AdminNavbar from "../navbar/AdminNavbar";

export default function AdminLayout() {
  return (
    <div className="flex flex-col min-h-screen bg-sand-50">
      <AdminNavbar />
      <main className="flex-1 overflow-x-hidden">
        <Outlet />
      </main>
    </div>
  );
}
