export default function Input({ label, type = "text", className = "", disabled, ...props }) {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label className={`text-xs font-display font-semibold uppercase tracking-wider ${disabled ? "text-ink-400" : "text-ink-500"}`}>
          {label}
        </label>
      )}
      <input
        type={type}
        disabled={disabled}
        className={`px-4 py-3 border-2 border-ink-200 rounded-xl text-sm outline-none transition-all bg-white placeholder:text-ink-400 text-ink-900
          focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10
          hover:border-ink-300
          ${disabled ? "bg-ink-50 text-ink-400 cursor-not-allowed" : ""}
          ${className}`}
        {...props}
      />
    </div>
  );
}
