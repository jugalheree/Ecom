import { Link } from "react-router-dom";

export default function FinalCTA() {
  return (
    <section className="py-20 bg-gradient-to-br from-brand-600 to-brand-800 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.1),transparent_60%)]" />
      <div className="container-app relative z-10 text-center">
        <p className="text-brand-100 text-sm font-semibold uppercase tracking-widest mb-4">Get Started Today</p>
        <h2 className="text-4xl md:text-5xl font-display font-bold text-white leading-tight mb-4">
          Ready to trade smarter?
        </h2>
        <p className="text-brand-100 text-sm max-w-xl mx-auto leading-relaxed mb-10">
          Join over 1,200 vendors and thousands of buyers already on TradeSphere. No setup fee. No hidden charges. Just commerce, done right.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/register">
            <button className="bg-white text-brand-700 font-bold px-8 py-4 rounded-xl hover:bg-sand-50 transition-all shadow-lg hover:shadow-xl active:scale-[0.97] text-sm">
              Create Free Account →
            </button>
          </Link>
          <Link to="/market">
            <button className="border-2 border-white/30 text-white font-semibold px-8 py-4 rounded-xl hover:bg-white/10 transition-all text-sm">
              Browse Marketplace
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}
