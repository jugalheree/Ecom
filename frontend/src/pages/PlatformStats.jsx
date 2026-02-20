export default function PlatformStats() {
  const stats = [
    { value: "1,200+", label: "Active vendors" },
    { value: "45,000+", label: "Products listed" },
    { value: "18K+", label: "Monthly trades" },
    { value: "99.9%", label: "Secure transactions" },
  ];

  return (
    <section className="w-full py-24 md:py-32 bg-white">
      <div className="container-app">
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-display font-bold text-stone-900 mb-6">
            Built for buyers and vendors
          </h2>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {stats.map((s, i) => (
            <div key={i} className="text-center animate-fade-in" style={{ animationDelay: `${i * 0.1}s` }}>
              <h3 className="text-5xl md:text-6xl font-display font-bold tracking-tight text-stone-900 mb-3">
                {s.value}
              </h3>
              <p className="text-lg text-stone-600 font-medium uppercase tracking-wide">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
