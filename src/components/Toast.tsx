"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";

type ToastContextValue = { showToast: (message: string) => void };
const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast debe usarse dentro de <ToastProvider>");
  return ctx;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [message, setMessage] = useState<string | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((msg: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setMessage(msg);
    timeoutRef.current = setTimeout(() => setMessage(null), 3400);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {message && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[200] rounded-[14px] bg-ink text-white text-sm font-bold px-4 py-3 shadow-popover max-w-[90vw] text-center">
          {message}
        </div>
      )}
    </ToastContext.Provider>
  );
}
