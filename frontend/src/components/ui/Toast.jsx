import { useEffect } from "react";
import { useToastStore } from "../../store/toastStore";

export default function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  useEffect(() => {
    if (toasts.length > 0) {
      const timer = setTimeout(() => removeToast(toasts[0].id), 3500);
      return () => clearTimeout(timer);
    }
  }, [toasts, removeToast]);

  const icons = { success: "✓", error: "✕", info: "i" };
  const styles = {
    success: "bg-emerald-600 border-emerald-500",
    error: "bg-red-600 border-red-500",
    info: "bg-primary-600 border-primary-500",
  };

  return (
    <div className="fixed top-5 right-5 space-y-2.5 z-[999] pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-white text-sm font-medium shadow-lg animate-fade-up pointer-events-auto ${styles[t.type] || styles.info}`}
        >
          <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold flex-shrink-0">
            {icons[t.type] || icons.info}
          </span>
          {t.message}
        </div>
      ))}
    </div>
  );
}
