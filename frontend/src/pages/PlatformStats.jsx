export default function PlatformStats() {
    const stats = [
      { value: "1,200+", label: "Active vendors" },
      { value: "45,000+", label: "Products listed" },
      { value: "18K+", label: "Monthly trades" },
      { value: "99.9%", label: "Secure transactions" },
    ];
  
    return (
      <section className="w-full py-24 bg-gradient-to-b from-white to-slate-50 dark:from-slate-900 dark:to-slate-950">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
          {stats.map((s, i) => (
            <div key={i}>
              <h3 className="text-4xl md:text-5xl font-semibold tracking-tight text-green-600">
                {s.value}
              </h3>
              <p className="mt-2 text-slate-600 dark:text-slate-400">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </section>
    );
  }
  