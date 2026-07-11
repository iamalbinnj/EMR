export const EmptyState = ({ children }: { children: string }) => {
    return (
        <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">{children}</div>
    )
}

export const Loading = () => {
    return (
        <p className="py-8 text-center text-sm text-slate-500">Loading data...</p>
    )
}

