import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

const link = ({ isActive }: { isActive: boolean }) => `rounded-md px-3 py-2 text-sm font-medium ${isActive ? "bg-primary-600 text-white" : "text-slate-600 hover:bg-slate-100"}`;

export const AppLayout = () => {
    const { user, logout } = useAuth();
    return (
        <div className="min-h-screen">
            <header className="border-b border-slate-200 bg-white">
                <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3">
                    <div>
                        <p className="font-bold text-primary-700">Enterprise EMR</p>
                        <p className="text-xs text-slate-500">Appointment Management</p>
                    </div>
                    <nav className="flex flex-wrap items-center gap-1">
                        <NavLink className={link} to="/">Dashboard</NavLink>
                        <NavLink className={link} to="/scheduler">Scheduler</NavLink>
                        <NavLink className={link} to="/appointments">Appointments</NavLink>
                        {user?.role !== "DOCTOR" && <NavLink className={link} to="/book">Book</NavLink>}
                        {user?.role === "SUPER_ADMIN" && <NavLink className={link} to="/admin/users">Accounts</NavLink>}
                    </nav>
                    <div className="flex items-center gap-3 text-sm">
                        <span className="hidden text-slate-600 sm:inline">{user?.name} - {user?.role.replaceAll("_", " ")}</span>
                        <button type="button" onClick={() => void logout()} className="rounded-md border border-slate-300 px-3 py-2 text-slate-700">Logout</button>
                    </div>
                </div>
            </header>
            <main className="mx-auto max-w-7xl p-4 sm:p-6">
                <Outlet />
            </main>
        </div>
    )
};

