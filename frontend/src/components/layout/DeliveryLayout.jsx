import { Outlet } from "react-router-dom";
import DeliveryNavbar from "../navbar/DeliveryNavbar";

export default function DeliveryLayout() {
  return (
    <div className="flex flex-col min-h-screen bg-sand-50">
      <DeliveryNavbar />
      <main className="flex-1 overflow-x-hidden">
        <Outlet />
      </main>
    </div>
  );
}
