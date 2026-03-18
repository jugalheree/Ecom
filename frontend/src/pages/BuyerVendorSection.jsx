import { Link } from "react-router-dom";

export default function BuyerVendorSection() {
  return (
    <section className="py-20 bg-sand-50">
      <div className="container-app">
        <div className="text-center mb-12">
          <p className="section-label mb-2">Choose Your Role</p>
          <h2 className="text-4xl font-display font-bold text-ink-900">One Platform, Two Journeys</h2>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          {/* Buyer card */}
          <div className="card p-8 border-2 border-brand-100 hover:border-brand-300 hover:shadow-card-hover transition-all">
            <div className="w-14 h-14 rounded-2xl bg-brand-600 text-white flex items-center justify-center text-2xl mb-5 shadow-brand">🛍️</div>
            <h3 className="text-2xl font-display font-bold text-ink-900 mb-3">I'm a Buyer</h3>
            <p className="text-ink-500 text-sm leading-relaxed mb-5">
              Discover thousands of AI-verified products from trusted vendors. Shop with confidence knowing every transaction is escrow-protected.
            </p>
            <ul className="space-y-2.5 mb-7">
              {["AI-verified product listings", "Secure escrow payment protection", "Easy returns & dispute resolution", "Real-time order tracking"].map((f, i) => (
                <li key={i} className="flex items-center gap-2.5 text-sm text-ink-700">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f05f00" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                  {f}
                </li>
              ))}
            </ul>
            <Link to="/register">
              <button className="btn-primary w-full py-3">Start Shopping Free →</button>
            </Link>
          </div>

          {/* Vendor card */}
          <div className="card p-8 border-2 border-navy-100 hover:border-navy-300 hover:shadow-card-hover transition-all">
            <div className="w-14 h-14 rounded-2xl bg-navy-700 text-white flex items-center justify-center text-2xl mb-5">🏪</div>
            <h3 className="text-2xl font-display font-bold text-ink-900 mb-3">I'm a Vendor</h3>
            <p className="text-ink-500 text-sm leading-relaxed mb-5">
              List your products, manage inventory, and reach thousands of buyers. Get AI-powered insights and an integrated trade wallet.
            </p>
            <ul className="space-y-2.5 mb-7">
              {["Free store setup in under 24 hours", "AI Trust Score boosts visibility", "Integrated escrow trade wallet", "B2B & B2C order management"].map((f, i) => (
                <li key={i} className="flex items-center gap-2.5 text-sm text-ink-700">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3130d1" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                  {f}
                </li>
              ))}
            </ul>
            <Link to="/register">
              <button className="btn-outline border-navy-300 text-navy-700 hover:bg-navy-50 hover:border-navy-500 w-full py-3">Start Selling Free →</button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
