import type { PropsWithChildren } from "react";
import { useCallback, useMemo, useState } from "react";
import { ToastContext, type Toast, type ToastType } from "./ToastContext";

export const ToastProvider = ({ children }: PropsWithChildren) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const remove = useCallback((id: number) => setToasts((items) => items.filter((x) => x.id !== id)), []);
  const show = useCallback((message: string, type: ToastType = "info") => {
    const id = Date.now();
    setToasts((items) => [...items.slice(-2), { id, message, type }]);
    window.setTimeout(() => remove(id), 4000);
  }, [remove]);

  const value = useMemo(() => ({ toasts, show, remove }), [toasts, show, remove]);

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
};