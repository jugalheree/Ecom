export default function PlatformStats() {
  const stats = [
    { value: "1,200+", label: "Active vendors", desc: "Verified sellers" },
    { value: "45,000+", label: "Products listed", desc: "AI-scored items" },
    { value: "18K+", label: "Monthly trades", desc: "B2B & B2C" },
    { value: "99.9%", label: "Secure transactions", desc: "Escrow-protected" },
  ];
  return (
    <section className="w-full py-24 bg-ink-950 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(20,184,166,0.1),transparent_70%)]" />
      <div className="container-app relative z-10">
        <div className="text-center mb-14">
          <p className="text-xs font-display font-bold uppercase tracking-widest text-primary-400 mb-4">By the numbers</p>
          <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-4">Built for buyers and vendors</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-white/5 rounded-2xl overflow-hidden border border-white/10">
          {stats.map((s, i) => (
            <div key={i} className="bg-ink-950 p-8 text-center hover:bg-white/5 transition-colors duration-300">
              <p className="text-4xl md:text-5xl font-display font-bold text-white mb-2">{s.value}</p>
              <p className="font-display font-semibold text-white/80 text-sm mb-1">{s.label}</p>
              <p className="text-xs text-white/40 uppercase tracking-wider">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
