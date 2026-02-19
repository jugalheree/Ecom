import Card from "../components/ui/Card";

export default function HowItWorks() {
  return (
    <section className="w-full py-24 md:py-32 bg-white">
      <div className="container-app">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-display font-bold text-stone-900 mb-6">
            How it works
          </h2>
          <p className="text-xl text-stone-600 leading-relaxed">
            A unified platform designed for both buyers and vendors — with AI
            trust scoring, secure wallet escrow, and smart trade flow.
          </p>
        </div>

        <div className="mb-20">
          <h3 className="text-2xl font-display font-semibold mb-12 text-stone-900 text-center">
            For buyers
          </h3>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              {
                step: 1,
                title: "Discover products",
                desc: "Browse AI-verified products from trusted vendors across categories.",
              },
              {
                step: 2,
                title: "Pay securely",
                desc: "Payments go into escrow wallet to protect both buyer and seller.",
              },
              {
                step: 3,
                title: "Track orders",
                desc: "Monitor delivery, vendor actions, and order progress in real time.",
              },
              {
                step: 4,
                title: "Release payment",
                desc: "Funds are released only after successful order completion.",
              },
            ].map((item) => (
              <Card key={item.step} className="p-6 text-center border-2 border-stone-200 hover:border-primary-300 transition-all duration-300">
                <div className="w-12 h-12 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-bold text-lg mb-4 mx-auto">
                  {item.step}
                </div>
                <h4 className="font-semibold text-lg mb-2 text-stone-900">
                  {item.title}
                </h4>
                <p className="text-sm text-stone-600 leading-relaxed">
                  {item.desc}
                </p>
              </Card>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-2xl font-display font-semibold mb-12 text-stone-900 text-center">
            For vendors
          </h3>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              {
                step: 1,
                title: "List products",
                desc: "Add products, manage stock, pricing, and availability.",
              },
              {
                step: 2,
                title: "Receive orders",
                desc: "Smart order flow notifies you instantly when a buyer places an order.",
              },
              {
                step: 3,
                title: "Fulfill & manage",
                desc: "Process orders, track performance, and manage inventory.",
              },
              {
                step: 4,
                title: "Grow & trade",
                desc: "Access wallet, analytics, and vendor-to-vendor trading tools.",
              },
            ].map((item) => (
              <Card key={item.step} className="p-6 text-center border-2 border-stone-200 hover:border-primary-300 transition-all duration-300">
                <div className="w-12 h-12 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-bold text-lg mb-4 mx-auto">
                  {item.step}
                </div>
                <h4 className="font-semibold text-lg mb-2 text-stone-900">
                  {item.title}
                </h4>
                <p className="text-sm text-stone-600 leading-relaxed">
                  {item.desc}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
