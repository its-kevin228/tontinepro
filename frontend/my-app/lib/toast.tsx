"use client";

import { createContext, useContext, useState, useCallback, useRef } from "react";
import { CheckCircle2, XCircle, X } from "lucide-react";

type ToastType = "success" | "error";

interface Toast {
  id: number;
  type: ToastType;
  message: string;
}

interface ToastContextType {
  success: (message: string) => void;
  error: (message: string) => void;
}

const ToastContext = createContext<ToastContextType>({
  success: () => {},
  error: () => {},
});

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const counter = useRef(0);

  const add = useCallback((type: ToastType, message: string) => {
    const id = ++counter.current;
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const remove = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ success: (m) => add("success", m), error: (m) => add("error", m) }}>
      {children}

      {/* Conteneur des toasts */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] flex flex-col gap-2 items-center pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`flex items-center gap-3 px-5 py-3 rounded-2xl shadow-xl text-sm font-bold pointer-events-auto animate-in slide-in-from-bottom-4 fade-in duration-300 ${
              t.type === "success"
                ? "bg-[#272343] text-white"
                : "bg-[#f25f4c] text-white"
            }`}
          >
            {t.type === "success" ? (
              <CheckCircle2 className="h-4 w-4 text-[#ffd803] shrink-0" />
            ) : (
              <XCircle className="h-4 w-4 text-white shrink-0" />
            )}
            <span>{t.message}</span>
            <button
              onClick={() => remove(t.id)}
              className="ml-2 opacity-60 hover:opacity-100 transition-opacity"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
