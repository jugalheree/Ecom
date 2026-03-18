export default function Input({ label, error, className = "", ...props }) {
  return (
    <div className="w-full">
      {label && <label className="block text-sm font-semibold text-ink-700 mb-1.5">{label}</label>}
      <input className={`input-base ${error ? "border-danger-500 focus:border-danger-500 focus:ring-danger-100" : ""} ${className}`} {...props} />
      {error && <p className="text-xs text-danger-500 mt-1">{error}</p>}
    </div>
  );
}
