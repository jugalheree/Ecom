export default function Badge({ children, type = "default", className = "" }) {
  const styles = {
    default: "badge bg-ink-100 text-ink-600 border border-ink-200",
    info:    "badge-navy",
    success: "badge-success",
    warning: "badge-warn",
    danger:  "badge-danger",
    brand:   "badge-brand",
  };
  return <span className={`${styles[type] || styles.default} ${className}`}>{children}</span>;
}
