import { useEffect } from "react";
import { useToastStore } from "../../store/toastStore";

export default function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  useEffect(() => {
    if (toasts.length > 0) {
      const timer = setTimeout(() => {
        removeToast(toasts[0].id);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toasts, removeToast]);

  return (
    <div className="fixed top-5 right-5 space-y-3 z-[999]">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`px-5 py-3 rounded-xl shadow-card-hover text-white text-sm font-medium animate-fade-in
            ${t.type === "success" && "bg-emerald-600"}
            ${t.type === "error" && "bg-red-500"}
            ${t.type === "info" && "bg-primary-600"}
          `}
        >
          {t.message}
        </div>
      ))}
    </div>
  );
}
