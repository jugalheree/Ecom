export default function Badge({ children, type = "default" }) {
  const styles = {
    default: "bg-ink-100 text-ink-700 border-ink-200",
    success: "bg-emerald-50 text-emerald-700 border-emerald-200",
    warning: "bg-amber-50 text-amber-700 border-amber-200",
    danger: "bg-red-50 text-red-700 border-red-200",
    info: "bg-primary-50 text-primary-700 border-primary-200",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-display font-semibold uppercase tracking-wider border ${styles[type]}`}>
      {children}
    </span>
  );
}
