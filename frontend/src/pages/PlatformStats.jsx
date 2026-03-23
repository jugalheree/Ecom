export default function PlatformStats() {
  const stats = [
    { value: "1,200+", label: "Active Vendors", desc: "Verified sellers", icon: "🏪" },
    { value: "45,000+", label: "Products Listed", desc: "AI-scored items", icon: "📦" },
    { value: "18K+", label: "Monthly Trades", desc: "B2B & B2C combined", icon: "🔄" },
    { value: "99.9%", label: "Secure Transactions", desc: "Escrow-protected", icon: "🔒" },
  ];
  return (
    <section className="py-20 bg-gradient-to-br from-ink-950 to-navy-950 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,125,7,0.08),transparent_70%)]" />
      <div className="container-app relative z-10">
        <div className="text-center mb-12">
          <p className="section-label text-brand-400 mb-2">By the Numbers</p>
          <h2 className="text-4xl font-display font-bold text-white">Built for Buyers and Vendors</h2>
          <p className="text-ink-400 mt-3 text-sm max-w-lg mx-auto">India's most trusted multi-vendor marketplace, growing every day.</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((s, i) => (
            <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center hover:bg-white/10 transition-colors">
              <span className="text-3xl block mb-3">{s.icon}</span>
              <p className="text-3xl md:text-4xl font-display font-bold text-white mb-1">{s.value}</p>
              <p className="font-semibold text-white/80 text-sm">{s.label}</p>
              <p className="text-ink-500 text-xs mt-1">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
