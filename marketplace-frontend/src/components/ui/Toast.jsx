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
          className={`px-4 py-2 rounded-lg shadow-md text-white text-sm
            ${t.type === "success" && "bg-green-600"}
            ${t.type === "error" && "bg-red-600"}
            ${t.type === "info" && "bg-blue-600"}
          `}
        >
          {t.message}
        </div>
      ))}
    </div>
  );
}
