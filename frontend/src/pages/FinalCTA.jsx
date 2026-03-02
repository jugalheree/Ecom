import { Link } from "react-router-dom";

export default function FinalCTA() {
  return (
    <section className="w-full py-24 md:py-32 bg-ink-950 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(20,184,166,0.15),transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(217,70,239,0.08),transparent_60%)]" />
      <div className="absolute inset-0 opacity-[0.03]"
        style={{ backgroundImage: `linear-gradient(rgba(255,255,255,0.5) 1px,transparent 1px),linear-gradient(to right,rgba(255,255,255,0.5) 1px,transparent 1px)`, backgroundSize: "48px 48px" }} />

      <div className="container-app relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-xs font-display font-bold uppercase tracking-widest text-primary-400 mb-6">Get started</p>
          <h2 className="text-5xl md:text-6xl font-display font-bold text-white leading-tight mb-6">
            Build, sell, and trade<br />on a smarter platform
          </h2>
          <p className="text-white/60 text-base max-w-xl mx-auto mb-12 leading-relaxed">
            Join TradeSphere and experience a new way to manage commerce, trust, and growth.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register">
              <button className="bg-white text-ink-900 font-display font-bold text-sm px-8 py-4 rounded-xl hover:bg-ink-100 transition-all shadow-lg active:scale-[0.97]">
                Start trading free →
              </button>
            </Link>
            <Link to="/market">
              <button className="border-2 border-white/20 text-white/80 font-display font-semibold text-sm px-8 py-4 rounded-xl hover:border-white/40 hover:text-white transition-all active:scale-[0.97]">
                Explore marketplace
              </button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
