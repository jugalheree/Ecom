export default function TrustArchitecture() {
  const systems = [
    { title: "AI trust scoring", desc: "Products and vendors are evaluated through intelligent scoring to ensure quality.", icon: "✦", color: "text-primary-500 bg-primary-50 border-primary-100" },
    { title: "Secure escrow wallet", desc: "Buyer payments are held safely and released only when order conditions are fulfilled.", icon: "⬡", color: "text-emerald-600 bg-emerald-50 border-emerald-100" },
    { title: "Verified vendor ecosystem", desc: "Every vendor passes verification and is continuously performance-rated.", icon: "◈", color: "text-blue-600 bg-blue-50 border-blue-100" },
    { title: "Smart order flow", desc: "Automated order processing, alerts, and tracking create transparency for all parties.", icon: "◎", color: "text-accent-500 bg-accent-50 border-accent-100" },
  ];
  return (
    <section className="w-full py-24 md:py-32 bg-white">
      <div className="container-app">
        <div className="max-w-2xl mx-auto text-center mb-14">
          <p className="text-xs font-display font-bold uppercase tracking-widest text-primary-600 mb-4">Security</p>
          <h2 className="text-4xl md:text-5xl font-display font-bold text-ink-900 mb-5">Trust & security</h2>
          <p className="text-ink-500 text-sm leading-relaxed">
            TradeSphere is engineered as a secure multi-vendor ecosystem with financial protection and intelligent monitoring at its core.
          </p>
        </div>
        <div className="grid md:grid-cols-4 gap-5">
          {systems.map((s, i) => (
            <div key={i} className={`p-6 rounded-2xl border-2 ${s.color} hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 group`}>
              <div className="text-3xl font-display font-bold mb-5 group-hover:scale-110 transition-transform duration-300 inline-block">{s.icon}</div>
              <h3 className="font-display font-bold text-ink-900 mb-2">{s.title}</h3>
              <p className="text-ink-500 text-sm leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
