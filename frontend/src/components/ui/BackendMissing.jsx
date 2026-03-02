export default function BackendMissing({ endpoint, method = "GET", todo }) {
  return (
    <div className="w-full bg-amber-50 border-2 border-amber-200 rounded-2xl p-5 my-4">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0 mt-0.5">
          <span className="text-amber-600 text-sm font-bold">!</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="text-xs font-display font-bold uppercase tracking-wider text-amber-700">Backend route missing</span>
            <code className="text-xs font-mono bg-amber-100 border border-amber-200 px-2 py-0.5 rounded-lg">
              <span className="text-emerald-700 font-bold">{method}</span> {endpoint}
            </code>
          </div>
          <ul className="space-y-1">
            {(Array.isArray(todo) ? todo : [todo]).map((item, i) => (
              <li key={i} className="text-xs text-amber-800 flex gap-2">
                <span className="text-amber-400 font-bold flex-shrink-0">→</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
