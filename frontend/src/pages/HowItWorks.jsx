import Card from "../components/ui/Card";

export default function HowItWorks() {
  return (
    <section className="w-full py-24 bg-slate-50 dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-4">

        {/* TITLE */}
        <div className="max-w-2xl mb-16">
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">
            How TradeSphere works
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mt-3">
            A unified platform designed for both buyers and vendors — with AI trust scoring, secure wallet escrow, and smart trade flow.
          </p>
        </div>

        {/* BUYER FLOW */}
        <div className="mb-20">
          <h3 className="text-2xl font-semibold mb-8">
            For buyers
          </h3>

          <div className="grid md:grid-cols-4 gap-6">
            <Card className="p-6">
              <p className="text-sm text-blue-600 font-medium">Step 1</p>
              <h4 className="font-semibold mt-2">Discover products</h4>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                Browse AI-verified products from trusted vendors across categories.
              </p>
            </Card>

            <Card className="p-6">
              <p className="text-sm text-blue-600 font-medium">Step 2</p>
              <h4 className="font-semibold mt-2">Pay securely</h4>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                Payments go into escrow wallet to protect both buyer and seller.
              </p>
            </Card>

            <Card className="p-6">
              <p className="text-sm text-blue-600 font-medium">Step 3</p>
              <h4 className="font-semibold mt-2">Track orders</h4>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                Monitor delivery, vendor actions, and order progress in real time.
              </p>
            </Card>

            <Card className="p-6">
              <p className="text-sm text-blue-600 font-medium">Step 4</p>
              <h4 className="font-semibold mt-2">Release payment</h4>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                Funds are released only after successful order completion.
              </p>
            </Card>
          </div>
        </div>

        {/* VENDOR FLOW */}
        <div>
          <h3 className="text-2xl font-semibold mb-8">
            For vendors
          </h3>

          <div className="grid md:grid-cols-4 gap-6">
            <Card className="p-6">
              <p className="text-sm text-green-600 font-medium">Step 1</p>
              <h4 className="font-semibold mt-2">List products</h4>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                Add products, manage stock, pricing, and availability.
              </p>
            </Card>

            <Card className="p-6">
              <p className="text-sm text-green-600 font-medium">Step 2</p>
              <h4 className="font-semibold mt-2">Receive orders</h4>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                Smart order flow notifies you instantly when a buyer places an order.
              </p>
            </Card>

            <Card className="p-6">
              <p className="text-sm text-green-600 font-medium">Step 3</p>
              <h4 className="font-semibold mt-2">Fulfill & manage</h4>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                Process orders, track performance, and manage inventory.
              </p>
            </Card>

            <Card className="p-6">
              <p className="text-sm text-green-600 font-medium">Step 4</p>
              <h4 className="font-semibold mt-2">Grow & trade</h4>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                Access wallet, analytics, and vendor-to-vendor trading tools.
              </p>
            </Card>
          </div>
        </div>

      </div>
    </section>
  );
}
