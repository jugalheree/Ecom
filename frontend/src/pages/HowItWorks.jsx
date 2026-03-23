export default function HowItWorks() {
  const buyerSteps = [
    { step: "01", title: "Discover Products", desc: "Browse AI-verified products from trusted vendors across all categories." },
    { step: "02", title: "Pay Securely", desc: "Payments go into escrow wallet to protect both buyer and seller." },
    { step: "03", title: "Track Orders", desc: "Monitor delivery, vendor actions, and order progress in real time." },
    { step: "04", title: "Release Payment", desc: "Funds are released only after successful order completion." },
  ];
  const vendorSteps = [
    { step: "01", title: "List Products", desc: "Add products, manage stock, pricing, and availability with ease." },
    { step: "02", title: "Receive Orders", desc: "Get notified instantly when a buyer places an order." },
    { step: "03", title: "Fulfill Orders", desc: "Process orders, track performance, and manage inventory." },
    { step: "04", title: "Get Paid", desc: "Funds released to your wallet after delivery confirmation." },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container-app">
        <div className="text-center mb-14">
          <p className="section-label mb-2">Simple Process</p>
          <h2 className="text-4xl font-display font-bold text-ink-900">How TradeSphere Works</h2>
          <p className="text-ink-500 mt-3 max-w-xl mx-auto text-sm leading-relaxed">
            Whether you're buying or selling, our platform makes every step safe, simple, and transparent.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-10">
          {/* Buyer flow */}
          <div className="card p-8">
            <div className="flex items-center gap-3 mb-7">
              <div className="w-10 h-10 rounded-xl bg-brand-600 text-white flex items-center justify-center text-xl">🛍️</div>
              <h3 className="text-lg font-display font-bold text-ink-900">For Buyers</h3>
            </div>
            <div className="space-y-5">
              {buyerSteps.map((s, i) => (
                <div key={i} className="flex gap-4">
                  <div className="w-9 h-9 rounded-xl bg-brand-50 border border-brand-200 text-brand-700 text-xs font-bold flex items-center justify-center flex-shrink-0">{s.step}</div>
                  <div>
                    <p className="font-semibold text-ink-900 text-sm">{s.title}</p>
                    <p className="text-xs text-ink-500 mt-0.5 leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Vendor flow */}
          <div className="card p-8">
            <div className="flex items-center gap-3 mb-7">
              <div className="w-10 h-10 rounded-xl bg-navy-600 text-white flex items-center justify-center text-xl">🏪</div>
              <h3 className="text-lg font-display font-bold text-ink-900">For Vendors</h3>
            </div>
            <div className="space-y-5">
              {vendorSteps.map((s, i) => (
                <div key={i} className="flex gap-4">
                  <div className="w-9 h-9 rounded-xl bg-navy-50 border border-navy-200 text-navy-700 text-xs font-bold flex items-center justify-center flex-shrink-0">{s.step}</div>
                  <div>
                    <p className="font-semibold text-ink-900 text-sm">{s.title}</p>
                    <p className="text-xs text-ink-500 mt-0.5 leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
