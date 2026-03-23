export default function SkeletonCard() {
  return (
    <div className="card overflow-hidden">
      <div className="skeleton aspect-square w-full" />
      <div className="p-4 space-y-2.5">
        <div className="skeleton h-3 w-1/3 rounded" />
        <div className="skeleton h-4 w-3/4 rounded" />
        <div className="skeleton h-4 w-1/2 rounded" />
        <div className="skeleton h-9 w-full rounded-xl mt-2" />
      </div>
    </div>
  );
}
