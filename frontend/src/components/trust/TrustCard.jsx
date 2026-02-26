export default function TrustCard({ title, rating, reviews, badge }) {
  return (
    <div className="bg-white border border-stone-200 rounded-2xl p-5 hover:shadow-card-hover hover:border-stone-300 transition-all">
      <p className="text-sm text-stone-500 font-medium">{title}</p>

      <div className="flex items-center gap-2 mt-2">
        <p className="text-2xl font-bold text-stone-900">{rating.toFixed(1)}</p>
        <div className="flex text-amber-400 text-lg">
          {"★".repeat(Math.round(rating))}
          <span className="text-stone-200">
            {"★".repeat(5 - Math.round(rating))}
          </span>
        </div>
      </div>

      <p className="text-sm text-stone-600 mt-1">{reviews} reviews</p>

      {badge && (
        <span className="inline-block mt-3 px-3 py-1 rounded-full text-xs bg-primary-50 text-primary-700 font-medium border border-primary-100">
          {badge}
        </span>
      )}
    </div>
  );
}
