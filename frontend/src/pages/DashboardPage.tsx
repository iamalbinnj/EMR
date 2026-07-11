import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export const DashboardPage = () => {
    const { user } = useAuth();
    return (
        <section className="grid gap-6">
            <div>
                <h1 className="text-2xl font-bold">Dashboard</h1>
                <p className="text-slate-500">Welcome, {user?.name}. Choose an action below.</p>
            </div>



            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <Link to="/scheduler" className="rounded-lg border border-slate-200 bg-white p-5">
                    <h2 className="font-semibold text-primary-700">View scheduler</h2>
                    <p className="mt-1 text-sm text-slate-500">Check available and booked time slots.</p>
                </Link>


                <Link to="/appointments" className="rounded-lg border border-slate-200 bg-white p-5">
                    <h2 className="font-semibold text-secondary-700">Appointments</h2>
                    <p className="mt-1 text-sm text-slate-500">Search and manage appointment records.</p>
                </Link>

                
                {user?.role !== "DOCTOR" && (
                    <Link to="/book" className="rounded-lg border border-slate-200 bg-white p-5">
                        <h2 className="font-semibold text-primary-700">Book appointment</h2>
                        <p className="mt-1 text-sm text-slate-500">Select a patient, doctor, and slot.</p>
                    </Link>
                )}
            </div>
        </section>
    )
};

