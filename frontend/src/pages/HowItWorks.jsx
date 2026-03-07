export default function HowItWorks() {
  const buyerSteps = [
    { step: "01", title: "Discover products", desc: "Browse AI-verified products from trusted vendors across all categories." },
    { step: "02", title: "Pay securely", desc: "Payments go into escrow wallet to protect both buyer and seller." },
    { step: "03", title: "Track orders", desc: "Monitor delivery, vendor actions, and order progress in real time." },
    { step: "04", title: "Release payment", desc: "Funds are released only after successful order completion." },
  ];
  const vendorSteps = [
    { step: "01", title: "List products", desc: "Add products, manage stock, pricing, and availability easily." },
    { step: "02", title: "Receive orders", desc: "Smart order flow notifies you instantly when a buyer places an order." },
    { step: "03", title: "Fulfill & manage", desc: "Process orders, track performance, and manage inventory." },
    { step: "04", title: "Grow & trade", desc: "Access wallet, analytics, and vendor-to-vendor trading tools." },
  ];

  const StepRow = ({ steps, color }) => (
    <div className="grid md:grid-cols-4 gap-0 relative">
      <div className="absolute top-7 left-8 right-8 h-px bg-ink-200 hidden md:block" />
      {steps.map((item, i) => (
        <div key={i} className="relative flex flex-col items-center text-center px-4 group">
          <div className={`w-14 h-14 rounded-2xl ${color} text-white flex items-center justify-center font-display font-bold text-lg mb-5 shadow-sm relative z-10 group-hover:scale-110 transition-transform duration-300`}>
            {item.step}
          </div>
          <h4 className="font-display font-bold text-ink-900 mb-2">{item.title}</h4>
          <p className="text-sm text-ink-500 leading-relaxed">{item.desc}</p>
        </div>
      ))}
    </div>
  );

  return (
    <section className="w-full py-24 md:py-32 bg-white">
      <div className="container-app">
        <div className="max-w-2xl mx-auto text-center mb-16">
          <p className="text-xs font-display font-bold uppercase tracking-widest text-primary-600 mb-4">How it works</p>
          <h2 className="text-4xl md:text-5xl font-display font-bold text-ink-900 mb-5">Simple, secure, smart</h2>
          <p className="text-ink-500 text-sm leading-relaxed">
            A unified platform with AI trust scoring, secure wallet escrow, and smart trade flow.
          </p>
        </div>

        <div className="space-y-16">
          <div>
            <div className="flex items-center gap-3 mb-10 justify-center">
              <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center text-white text-sm">🛍️</div>
              <h3 className="text-lg font-display font-bold text-ink-900">For buyers</h3>
            </div>
            <StepRow steps={buyerSteps} color="bg-gradient-to-br from-primary-500 to-primary-600" />
          </div>

          <div className="border-t border-ink-100 pt-16">
            <div className="flex items-center gap-3 mb-10 justify-center">
              <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-white text-sm">🏪</div>
              <h3 className="text-lg font-display font-bold text-ink-900">For vendors</h3>
            </div>
            <StepRow steps={vendorSteps} color="bg-gradient-to-br from-emerald-500 to-emerald-600" />
          </div>
        </div>
      </div>
    </section>
  );
}
