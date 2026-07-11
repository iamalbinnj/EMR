import { createContext } from "react";

export type ToastType = "success" | "error" | "info";

export interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

export interface ToastValue {
  toasts: Toast[];
  show: (message: string, type?: ToastType) => void;
  remove: (id: number) => void;
}

export const ToastContext = createContext<ToastValue | null>(null);
