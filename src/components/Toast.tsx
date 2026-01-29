import React from "react";
import { Check, X, Info } from "lucide-react";

interface ToastItem {
  id: string;
  type: "success" | "error" | "info";
  message: string;
}

interface ToastProps {
  toasts: ToastItem[];
}

const Toast: React.FC<ToastProps> = ({ toasts }) => {
  if (toasts.length === 0) return null;

  const getBgColor = (type: string) =>
    type === "success"
      ? "bg-green-500"
      : type === "error"
        ? "bg-red-500"
        : "bg-blue-500";

  const getIcon = (type: string) => {
    if (type === "success") return <Check className="w-5 h-5 text-white" />;
    if (type === "error") return <X className="w-5 h-5 text-white" />;
    return <Info className="w-5 h-5 text-white" />;
  };

  return (
    <div className="fixed bottom-4 left-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`${getBgColor(toast.type)} flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg text-white animate-fade-in`}
        >
          {getIcon(toast.type)}
          <span className="text-sm font-medium">{toast.message}</span>
        </div>
      ))}
    </div>
  );
};

export default Toast;
