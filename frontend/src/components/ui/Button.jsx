export default function Button({
    children,
    variant = "primary",
    className = "",
    ...props
  }) {
    const base =
      "px-4 py-2 rounded-lg font-medium transition active:scale-95 focus:outline-none focus:ring-2";
  
    const variants = {
      primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-300",
      secondary: "bg-slate-900 text-white hover:bg-slate-800 focus:ring-slate-400",
      outline: "border border-slate-300 hover:bg-slate-100 focus:ring-slate-300",
      ghost: "hover:bg-slate-100 focus:ring-slate-200",
      danger: "bg-red-500 text-white hover:bg-red-600 focus:ring-red-300",
    };
  
    return (
      <button
        className={`${base} ${variants[variant]} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
  