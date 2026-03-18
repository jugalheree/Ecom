export default function BackendMissing({ method = "GET", endpoint = "", todo = "" }) {
  return (
    <div className="mb-5 bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
      <span className="text-xl flex-shrink-0">⚠️</span>
      <div>
        <p className="font-semibold text-amber-800 text-sm">Backend endpoint missing</p>
        <p className="text-xs text-amber-700 mt-0.5 font-mono">
          <span className="font-bold">{method}</span> {endpoint}
        </p>
        {todo && <p className="text-xs text-amber-600 mt-1.5 leading-relaxed">{todo}</p>}
      </div>
    </div>
  );
}
