import Card from "../components/ui/Card";

export default function TrustArchitecture() {
  const systems = [
    {
      title: "AI trust scoring",
      desc: "Products and vendors are evaluated through intelligent scoring parameters to ensure quality and reliability.",
      icon: "🎯",
      gradient: "from-primary-500 to-primary-600"
    },
    {
      title: "Secure escrow wallet",
      desc: "Buyer payments are held safely and released only when order conditions are fulfilled.",
      icon: "🔐",
      gradient: "from-emerald-500 to-emerald-600"
    },
    {
      title: "Verified vendor ecosystem",
      desc: "Every vendor passes verification and is continuously performance-rated.",
      icon: "✓",
      gradient: "from-blue-500 to-blue-600"
    },
    {
      title: "Smart order flow",
      desc: "Automated order processing, alerts, and tracking create transparency for all parties.",
      icon: "⚡",
      gradient: "from-accent-500 to-accent-600"
    },
  ];

  return (
    <section className="w-full py-24 md:py-32 bg-white">
      <div className="container-app">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-display font-bold text-stone-900 mb-6">
            Trust & security
          </h2>
          <p className="text-xl text-stone-600 leading-relaxed">
            TradeSphere is engineered as a secure multi-vendor ecosystem with
            financial protection and intelligent monitoring at its core.
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-8">
          {systems.map((s, i) => (
            <Card key={i} className="p-8 border-2 border-stone-200 hover:border-primary-300 transition-all duration-300 group">
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${s.gradient} text-white flex items-center justify-center text-2xl mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                {s.icon}
              </div>
              <h3 className="text-xl font-semibold text-stone-900 mb-3">{s.title}</h3>
              <p className="text-stone-600 leading-relaxed">
                {s.desc}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
