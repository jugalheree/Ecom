export default function SkeletonCard() {
  return (
    <div className="bg-white border-2 border-ink-100 rounded-2xl p-4 space-y-3 overflow-hidden relative">
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-ink-100/60 to-transparent" />
      <div className="h-44 bg-ink-100 rounded-xl" />
      <div className="h-3.5 bg-ink-100 rounded-lg w-3/4" />
      <div className="h-3 bg-ink-100 rounded-lg w-1/2" />
      <div className="h-3 bg-ink-100 rounded-lg w-1/3" />
      <div className="h-10 bg-ink-100 rounded-xl mt-4" />
    </div>
  );
}
