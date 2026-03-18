export default function TrustArchitecture() {
  const pillars = [
    { icon: "🤖", title: "AI Trust Score", desc: "Every product is evaluated using intelligent parameters — vendor history, product quality, return rates, and buyer feedback — to produce a real trust score.", color: "border-brand-200 bg-brand-50" },
    { icon: "🔒", title: "Escrow Wallet", desc: "Payments are held securely in escrow and only released to vendors after the buyer confirms successful delivery. No risk, no fraud.", color: "border-emerald-200 bg-emerald-50" },
    { icon: "📋", title: "Verified Vendors", desc: "Every vendor goes through document verification and admin approval before they can list a single product on TradeSphere.", color: "border-navy-200 bg-navy-50" },
    { icon: "🛡️", title: "Dispute Resolution", desc: "Dedicated dispute and claim management system ensures fair resolution for both buyers and vendors in every transaction.", color: "border-purple-200 bg-purple-50" },
  ];
  return (
    <section className="py-20 bg-white">
      <div className="container-app">
        <div className="text-center mb-12">
          <p className="section-label mb-2">Why Trust Us</p>
          <h2 className="text-4xl font-display font-bold text-ink-900">Built on Trust & Transparency</h2>
          <p className="text-ink-500 mt-3 text-sm max-w-xl mx-auto leading-relaxed">
            TradeSphere was built from the ground up with safety and fairness at its core.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {pillars.map((p, i) => (
            <div key={i} className={`rounded-2xl border-2 ${p.color} p-6 hover:shadow-card-hover hover:-translate-y-1 transition-all duration-200`}>
              <span className="text-3xl block mb-4">{p.icon}</span>
              <h3 className="font-display font-bold text-ink-900 text-lg mb-2">{p.title}</h3>
              <p className="text-ink-500 text-sm leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
