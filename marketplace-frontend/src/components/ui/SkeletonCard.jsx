export default function SkeletonCard() {
    return (
      <div className="bg-white dark:bg-slate-800 border rounded-xl p-4 space-y-3 animate-pulse">
        <div className="h-32 bg-slate-200 dark:bg-slate-700 rounded"></div>
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
        <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded"></div>
      </div>
    );
  }
  