export default function SkeletonCard() {
  return (
    <div className="bg-white border border-stone-200 rounded-2xl p-4 space-y-3 animate-pulse">
      <div className="h-36 bg-stone-200 rounded-xl"></div>
      <div className="h-4 bg-stone-200 rounded w-3/4"></div>
      <div className="h-4 bg-stone-200 rounded w-1/2"></div>
      <div className="h-10 bg-stone-200 rounded-xl"></div>
    </div>
  );
}
