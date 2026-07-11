import { Link } from "react-router-dom";
import { EmptyState, Loading } from "../components/ui/Message";
import { Field, SelectField } from "../components/ui/Field";
import { useScheduler } from "../hooks/useScheduler";

export const SchedulerPage = () => {
    const data = useScheduler();
    return (
        <section className="grid gap-5">
            <div>
                <h1 className="text-2xl font-bold">Appointment Scheduler</h1>
                <p className="text-sm text-slate-500">Select a doctor and date to view slots.</p>
            </div>
            <div className="grid gap-4 rounded-lg border border-slate-200 bg-white p-4 sm:grid-cols-2">
                <SelectField label="Doctor" value={data.doctorId} onChange={(e) => data.setDoctorId(e.target.value)}>
                    <option value="">Select doctor</option>
                    {data.doctors.map((doctor) => (
                        <option key={doctor._id} value={doctor._id}>{doctor.name} — {doctor.departmentId.name}</option>
                    ))}
                </SelectField>
                <Field label="Date" type="date" min={new Date().toISOString().slice(0, 10)} value={data.date} onChange={(e) => data.setDate(e.target.value)} />
            </div>
            {data.slotsLoading
                ? <Loading />
                : !data.doctorId
                    ? <EmptyState>Select a doctor to view their schedule.</EmptyState>
                    : data.slots.length === 0
                        ? <EmptyState>No slots are configured for this date.</EmptyState>
                        : (
                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
                                {data.slots.map((slot) => slot.available
                                    ? (
                                        <Link key={slot.startTime} to={`/book?doctorId=${data.doctorId}&date=${data.date}&time=${slot.startTime}`} className="rounded-md border border-secondary-600 bg-secondary-50 p-3 text-center text-sm font-medium text-secondary-700">
                                            <span className="block">{slot.startTime}</span>
                                            <span className="text-xs">Available</span>
                                        </Link>
                                    )
                                    : (
                                        <div key={slot.startTime} className="rounded-md border border-slate-300 bg-slate-100 p-3 text-center text-sm text-slate-500">
                                            <span className="block">{slot.startTime}</span>
                                            <span className="text-xs">Booked</span>
                                        </div>
                                    )
                                )}
                            </div>
                        )
            }
        </section>
    )
};

