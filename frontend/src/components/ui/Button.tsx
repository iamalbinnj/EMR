import type { ButtonHTMLAttributes } from "react";

export const Button = ({ className = "", ...props }: ButtonHTMLAttributes<HTMLButtonElement>) => {
    return (
        <button className={`rounded-md px-4 py-2 font-medium disabled:cursor-not-allowed disabled:opacity-50 ${props.type === "button" ? "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50" : "bg-primary-600 text-white hover:bg-primary-700"} ${className}`} {...props} />
    )
}

