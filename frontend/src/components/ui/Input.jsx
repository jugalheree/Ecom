export default function Input({
    label,
    type = "text",
    className = "",
    ...props
  }) {
    return (
      <div className="flex flex-col gap-1 w-full">
        {label && (
          <label className="text-sm font-medium text-slate-700">
            {label}
          </label>
        )}
        <input
          type={type}
          className={`px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${className}`}
          {...props}
        />
      </div>
    );
  }
  