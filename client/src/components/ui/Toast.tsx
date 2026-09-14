import { createContext, useCallback, useContext, useState, ReactNode } from "react";
import { CheckCircle2, XCircle } from "lucide-react";

interface ToastMessage {
  id: number;
  text: string;
  tone: "success" | "error";
}

interface ToastContextValue {
  showToast: (text: string, tone?: "success" | "error") => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

let nextId = 1;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback((text: string, tone: "success" | "error" = "success") => {
    const id = nextId++;
    setToasts((prev) => [...prev, { id, text, tone }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div
        className="pointer-events-none fixed inset-x-0 bottom-4 z-[1000] flex flex-col items-center gap-2 px-4"
        aria-live="polite"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex w-full max-w-sm items-center gap-2 rounded-md border px-4 py-3 shadow-popover ${
              toast.tone === "success"
                ? "border-success/20 bg-white text-ink"
                : "border-danger/20 bg-white text-ink"
            }`}
          >
            {toast.tone === "success" ? (
              <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-success" aria-hidden="true" />
            ) : (
              <XCircle className="h-5 w-5 flex-shrink-0 text-danger" aria-hidden="true" />
            )}
            <span className="text-sm">{toast.text}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within a ToastProvider");
  return ctx;
}
