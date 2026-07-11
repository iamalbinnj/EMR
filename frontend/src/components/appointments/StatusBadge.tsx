import type { AppointmentStatus } from "../../types";


const styles: Record<AppointmentStatus, string> = {
    SCHEDULED: "bg-primary-100 text-primary-700",
    ARRIVED: "bg-amber-100 text-amber-700",
    COMPLETED: "bg-secondary-100 text-secondary-700",
    CANCELLED: "bg-red-100 text-red-700"
};


export const StatusBadge = ({ status }: { status: AppointmentStatus }) => {
    return (
        <span className={`rounded-full px-2 py-1 text-xs font-semibold ${styles[status]}`}>{status}</span>
    )
}

