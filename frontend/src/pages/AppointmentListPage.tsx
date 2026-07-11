import { Button } from "../components/ui/Button";
import { Field, SelectField } from "../components/ui/Field";
import { EmptyState, Loading } from "../components/ui/Message";
import { StatusBadge } from "../components/appointments/StatusBadge";
import { useAppointments } from "../hooks/useAppointments";
import { useAuth } from "../hooks/useAuth";

export const AppointmentListPage = () => {
    const data = useAppointments();
    const { user } = useAuth();
    return (
        <section className="grid gap-5">
            <div>
                <h1 className="text-2xl font-bold">Appointments</h1>
            </div>
            <div className="grid gap-4 rounded-lg border border-slate-200 bg-white p-4 sm:grid-cols-2">
                <Field label="Patient search" placeholder="Name, mobile, or patient ID" value={data.search} onChange={(e) => { data.setSearch(e.target.value); data.setPage(1); }} />
                <SelectField label="Status" value={data.status} onChange={(e) => { data.setStatus(e.target.value); data.setPage(1); }}>
                    <option value="">All statuses</option>
                    <option>SCHEDULED</option>
                    <option>ARRIVED</option>
                    <option>COMPLETED</option>
                    <option>CANCELLED</option>
                </SelectField>
            </div>{data.loading ? <Loading /> : data.appointments.length === 0 ? <EmptyState>No appointments match your filters.</EmptyState> : (<div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
                <table className="w-full min-w-[850px] text-left text-sm">
                    <thead className="bg-slate-100 text-xs uppercase text-slate-600">
                        <tr>
                            <th className="p-3">Date & time</th>
                            <th className="p-3">Patient</th>
                            <th className="p-3">Doctor</th>
                            <th className="p-3">Purpose</th>
                            <th className="p-3">Status</th>
                            <th className="p-3">Actions</th>
                        </tr></thead><tbody>{data.appointments.map((item) => (
                            <tr key={item._id} className="border-t border-slate-200">
                                <td className="p-3 font-medium">{item.date}<br />
                                    <span className="text-slate-500">{item.slotStartTime}–{item.slotEndTime}</span>
                                </td>
                                <td className="p-3">{item.patientId.name}<br />
                                    <span className="text-slate-500">{item.patientId.patientCode} - {item.patientId.mobile}</span>
                                </td>
                                <td className="p-3">{item.doctorId.name}<br />
                                    <span className="text-slate-500">{item.departmentId.name}</span>
                                </td>
                                <td className="p-3 text-slate-600">{item.purpose || "—"}</td>
                                <td className="p-3">
                                    <StatusBadge status={item.status} />
                                </td>
                                <td className="p-3">
                                    <div className="flex gap-2">
                                        {item.status === "SCHEDULED" && user?.role !== "DOCTOR" && (<Button type="button" disabled={data.actionLoading} onClick={() => data.runAction({ id: item._id, kind: "arrive" })}>Arrive</Button>)}
                                        {item.status === "ARRIVED" && (user?.role === "DOCTOR" || user?.role === "SUPER_ADMIN") && (<Button type="button" disabled={data.actionLoading} onClick={() => data.runAction({ id: item._id, kind: "complete" })}>Complete</Button>)}
                                        {item.status === "SCHEDULED" && user?.role !== "DOCTOR" && (<button type="button" disabled={data.actionLoading} onClick={() => data.runAction({ id: item._id, kind: "cancel" })} className="rounded-md border border-red-300 px-3 py-2 text-sm text-red-700">Cancel</button>)}
                                    </div>
                                </td>
                            </tr>))}
                    </tbody>
                </table>
            </div>
            )}
            <div className="flex items-center justify-between text-sm">
                <span>Page {Number(data.meta.page ?? data.page)} of {Number(data.meta.pages ?? 1)} - {Number(data.meta.total ?? 0)} records</span>
                <div className="flex gap-2">
                    <Button type="button" disabled={data.page <= 1} onClick={() => data.setPage(data.page - 1)}>Previous</Button>
                    <Button type="button" disabled={data.page >= Number(data.meta.pages ?? 1)} onClick={() => data.setPage(data.page + 1)}>Next</Button>
                </div>
            </div>
        </section>
    )
};

