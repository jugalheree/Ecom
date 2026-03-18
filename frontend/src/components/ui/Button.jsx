export default function Button({ children, variant = "primary", className = "", disabled, onClick, type = "button", ...props }) {
  const base = variant === "primary"   ? "btn-primary"
             : variant === "outline"   ? "btn-outline"
             : variant === "ghost"     ? "btn-ghost"
             : variant === "danger"    ? "btn-primary bg-danger-500 hover:bg-danger-600 shadow-none"
             : "btn-primary";
  return (
    <button type={type} disabled={disabled} onClick={onClick} className={`${base} ${className}`} {...props}>
      {children}
    </button>
  );
}
