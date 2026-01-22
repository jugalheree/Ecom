import VendorLayout from "../components/layout/VendorLayout";
import Card from "../components/ui/Card";

export default function VendorDashboard() {
  return (
    <VendorLayout>
      <h1>Vendor Dashboard</h1>
    
      <div className="grid md:grid-cols-3 gap-6 mt-6">
        <Card>
          <p className="text-slate-600 text-sm">Total Products</p>
          <h2 className="mt-1">12</h2>
        </Card>

        <Card>
          <p className="text-slate-600 text-sm">Low Stock Alerts</p>
          <h2 className="mt-1 text-red-600">3</h2>
        </Card>

        <Card>
          <p className="text-slate-600 text-sm">Active Trades</p>
          <h2 className="mt-1">2</h2>
        </Card>
      </div>
    </VendorLayout>
  );
}
