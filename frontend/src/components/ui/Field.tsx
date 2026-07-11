import type { InputHTMLAttributes, SelectHTMLAttributes } from "react";

export const Field = ({ label, ...props }: InputHTMLAttributes<HTMLInputElement> & { label: string }) => {
    return (
        <label className="grid gap-1 text-sm font-medium text-slate-700">
            <span>{label}</span>
            <input className="rounded-md border border-slate-300 bg-white px-3 py-2 outline-none focus:border-primary-600" {...props} />
        </label>
    )
}

export const SelectField = ({ label, children, ...props }: SelectHTMLAttributes<HTMLSelectElement> & { label: string }) => {
    return (
        <label className="grid gap-1 text-sm font-medium text-slate-700">
            <span>{label}</span>
            <select className="rounded-md border border-slate-300 bg-white px-3 py-2 outline-none focus:border-primary-600" {...props}>{children}</select>
        </label>
    )
}

