export default function Loader() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-10">
      <div className="relative w-10 h-10">
        <div className="absolute inset-0 rounded-full border-2 border-ink-200" />
        <div className="absolute inset-0 rounded-full border-2 border-t-primary-500 animate-spin" />
      </div>
      <p className="text-xs font-display font-semibold uppercase tracking-widest text-ink-400">Loading</p>
    </div>
  );
}
