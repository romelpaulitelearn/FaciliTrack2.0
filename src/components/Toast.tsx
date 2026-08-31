import { useEffect } from "react";
import { CheckCircle, XCircle, Info, X } from "lucide-react";
import type { Toast } from "../types";

interface ToastContainerProps {
  toasts: Toast[];
  onRemove: (id: string) => void;
}

export default function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  return (
    <div style={{ position: "fixed", top: 16, right: 16, zIndex: 60, display: "flex", flexDirection: "column", gap: 8 }}>
      {toasts.map((t) => <ToastItem key={t.id} toast={t} onRemove={onRemove} />)}
    </div>
  );
}

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
  useEffect(() => {
    const timer = setTimeout(() => onRemove(toast.id), 3500);
    return () => clearTimeout(timer);
  }, [toast.id, onRemove]);

  const configs = {
    success: { bg: "#27AE60", icon: <CheckCircle size={15} /> },
    error:   { bg: "#E74C3C", icon: <XCircle size={15} /> },
    info:    { bg: "#2D7A4F", icon: <Info size={15} /> },
  };
  const { bg, icon } = configs[toast.type];

  return (
    <div className="slide-up" style={{
      display: "flex", alignItems: "center", gap: 10,
      background: bg, color: "white",
      padding: "10px 14px", borderRadius: 8,
      boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
      minWidth: 240, maxWidth: 320, fontSize: 13,
    }}>
      {icon}
      <span style={{ flex: 1 }}>{toast.message}</span>
      <button onClick={() => onRemove(toast.id)}
        style={{ background: "none", border: "none", cursor: "pointer", color: "white", opacity: 0.7, display: "flex", padding: 0 }}>
        <X size={13} />
      </button>
    </div>
  );
}
