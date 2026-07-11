import { useToast } from "../../hooks/useToast";

export const ToastList = () => {
    const { toasts, remove } = useToast();
    return (
        <div className="fixed right-4 top-4 z-50 grid w-[min(24rem,calc(100%-2rem))] gap-2">
            {toasts.map((toast) => (
                <button
                    type="button"
                    onClick={() => remove(toast.id)} key={toast.id}
                    className={`rounded-md border px-4 py-3 text-left text-sm shadow-sm ${toast.type === "success" ? "border-secondary-600 bg-secondary-50 text-secondary-700" : toast.type === "error" ? "border-red-300 bg-red-50 text-red-700" : "border-primary-600 bg-primary-50 text-primary-700"}`}>
                    {toast.message}
                </button>
            ))}
        </div>
    )
};
