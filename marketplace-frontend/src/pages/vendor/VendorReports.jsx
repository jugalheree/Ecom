import VendorLayout from "../../components/layout/VendorLayout";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";

export default function VendorReports() {
  return (
    <VendorLayout>
      <h1>Reports & Analytics</h1>
      <p className="text-slate-600 mt-1">
        Track performance and download reports.
      </p>

      {/* STATS */}
      <div className="grid md:grid-cols-3 gap-6 mt-6">
        <Card>
          <p className="text-slate-600 text-sm">Total Orders</p>
          <h2 className="mt-1">124</h2>
        </Card>

        <Card>
          <p className="text-slate-600 text-sm">Revenue</p>
          <h2 className="mt-1">₹2,45,000</h2>
        </Card>

        <Card>
          <p className="text-slate-600 text-sm">Active Products</p>
          <h2 className="mt-1">18</h2>
        </Card>
      </div>

      {/* DOWNLOAD */}
      <Card className="mt-10 max-w-md">
        <h3>Download reports</h3>

        <div className="flex flex-col gap-3 mt-4">
          <Button>Download Sales Report</Button>
          <Button variant="outline">Download Stock Report</Button>
          <Button variant="outline">Download Wallet Report</Button>
        </div>

        <p className="text-xs text-slate-500 mt-3">
          Reports will be generated based on selected date range (backend).
        </p>
      </Card>
    </VendorLayout>
  );
}
