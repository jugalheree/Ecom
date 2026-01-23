import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import HowItWorks from "./HowItWorks";
import BuyerVendorSection from "./BuyerVendorSection";

export default function Home() {
  return (
    <div>
      {/* HERO */}
      <section className="bg-gradient-to-br from-blue-50 to-white">
        <div className="container-app py-20 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <Badge type="info">AI Powered Marketplace</Badge>
            <h1 className="mt-4">Trade smarter. Grow faster.</h1>
            <p className="text-slate-600 mt-4 max-w-xl">
              A next-generation B2B & B2C trade platform with AI product scoring,
              secure wallet escrow, vendor-to-vendor trading and smart order flow.
            </p>

            <div className="mt-6 flex gap-3">
              <Button>Explore Market</Button>
              <Button variant="outline">Start Selling</Button>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-md h-80 flex items-center justify-center text-slate-400">
            Hero illustration / product showcase
          </div>
        </div>
      </section>

      {/* TRUST STRIP */}
      <section className="border-y bg-white">
        <div className="container-app py-10 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {["Secure Wallet", "AI Verified Products", "B2B & B2C", "Vendor Trading"].map((t) => (
            <div key={t} className="font-semibold text-slate-700">{t}</div>
          ))}
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="container-app py-16">
        <h2>Popular Categories</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-8">
          {["Electronics", "Fashion", "Groceries", "Industrial"].map((c) => (
            <Card key={c} className="h-32 flex items-center justify-center font-semibold hover:shadow-md transition cursor-pointer">
              {c}
            </Card>
          ))}
        </div>
      </section>

      {/* WHY US */}
      <section className="bg-slate-100">
        <div className="container-app py-16 grid md:grid-cols-3 gap-6">
          <Card>
            <h3>AI Trust Score</h3>
            <p className="text-slate-600 mt-2 text-sm">
              Products are evaluated using intelligent parameters to ensure quality and reliability.
            </p>
          </Card>

          <Card>
            <h3>Secure Trade Wallet</h3>
            <p className="text-slate-600 mt-2 text-sm">
              Escrow-based wallet system protects both buyers and vendors.
            </p>
          </Card>

          <Card>
            <h3>Vendor Ecosystem</h3>
            <p className="text-slate-600 mt-2 text-sm">
              Vendors can trade stock, manage alerts, and expand supply chains.
            </p>
          </Card>
          
        </div>
        <HowItWorks />
        <BuyerVendorSection />
      </section>
    </div>
  );
}
