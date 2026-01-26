import Card from "../components/ui/Card";

export default function TrustArchitecture() {
  const systems = [
    {
      title: "AI trust scoring",
      desc: "Products and vendors are evaluated through intelligent scoring parameters to ensure quality and reliability.",
    },
    {
      title: "Secure escrow wallet",
      desc: "Buyer payments are held safely and released only when order conditions are fulfilled.",
    },
    {
      title: "Verified vendor ecosystem",
      desc: "Every vendor passes verification and is continuously performance-rated.",
    },
    {
      title: "Smart order flow",
      desc: "Automated order processing, alerts, and tracking create transparency for all parties.",
    },
  ];

  return (
    <section className="w-full py-24 bg-white dark:bg-slate-900">
      <div className="max-w-7xl mx-auto px-4">

        <div className="max-w-2xl mb-14">
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">
            Built on trust and smart systems
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mt-3">
            TradeSphere is engineered as a secure multi-vendor ecosystem with financial protection and intelligent monitoring at its core.
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-8">
          {systems.map((s, i) => (
            <Card key={i} className="p-8">
              <h3 className="text-lg font-semibold">{s.title}</h3>
              <p className="mt-2 text-slate-600 dark:text-slate-400 text-sm">
                {s.desc}
              </p>
            </Card>
          ))}
        </div>

      </div>
    </section>
  );
}
