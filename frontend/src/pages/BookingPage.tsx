import { Button } from "../components/ui/Button";
import { Field, SelectField } from "../components/ui/Field";
import { useBookingForm } from "../hooks/useBookingForm";

export const BookingPage = () => {
    const form = useBookingForm();
    return (
        <section className="grid gap-5">
            <div>
                <h1 className="text-2xl font-bold">Book Appointment</h1>
            </div>
            <form onSubmit={form.submit} className="grid gap-5">
                <div className="grid gap-4 rounded-lg border border-slate-200 bg-white p-4 sm:grid-cols-3">
                    <SelectField required label="Doctor" value={form.doctorId} onChange={(e) => { form.setDoctorId(e.target.value); form.setSlotStartTime(""); }}>
                        <option value="">Select doctor</option>
                        {form.doctors.map((doctor) => (
                            <option key={doctor._id} value={doctor._id}>{doctor.name}</option>
                        ))}
                    </SelectField>
                    <Field required label="Date" type="date" min={new Date().toISOString().slice(0, 10)} value={form.date} onChange={(e) => { form.setDate(e.target.value); form.setSlotStartTime(""); }} />
                    <SelectField required label="Available slot" value={form.slotStartTime} onChange={(e) => form.setSlotStartTime(e.target.value)}>
                        <option value="">Select time</option>
                        {form.slots.filter((slot) => slot.available).map((slot) => (
                            <option key={slot.startTime} value={slot.startTime}>{slot.startTime}–{slot.endTime}</option>
                        ))}
                    </SelectField>
                </div>
                <div className="grid gap-4 rounded-lg border border-slate-200 bg-white p-4">
                    <h2 className="font-semibold text-primary-700">Patient</h2>
                    <Field label="Find existing patient" placeholder="Search by name, mobile, or ID" value={form.patientSearch} onChange={(e) => form.setPatientSearch(e.target.value)} />
                    {form.patients.length > 0 && (
                        <div className="grid gap-2">
                            {form.patients.map((patient) => (
                                <button type="button" key={patient._id} onClick={() => form.setSelectedPatient(patient)} className={`rounded-md border p-3 text-left text-sm ${form.selectedPatient?._id === patient._id ? "border-primary-600 bg-primary-50" : "border-slate-200"}`}>
                                    <span className="font-medium">{patient.name}</span>
                                    <span className="ml-2 text-slate-500">{patient.patientCode} - {patient.mobile}</span>
                                </button>
                            ))}
                        </div>
                    )}
                    <div className="border-t border-slate-200 pt-4">
                        <p className="mb-3 text-sm font-medium text-slate-700">Or create a new patient</p>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <Field label="Patient name" required={!form.selectedPatient} value={form.newPatient.name} onChange={(e) => { form.setSelectedPatient(null); form.setNewPatient({ ...form.newPatient, name: e.target.value }); }} />
                            <Field label="Mobile number" required={!form.selectedPatient} value={form.newPatient.mobile} onChange={(e) => { form.setSelectedPatient(null); form.setNewPatient({ ...form.newPatient, mobile: e.target.value }); }} />
                        </div>
                    </div>
                </div>
                <div className="rounded-lg border border-slate-200 bg-white p-4">
                    <Field label="Purpose" value={form.purpose} onChange={(e) => form.setPurpose(e.target.value)} placeholder="Reason for appointment" />
                </div>
                <div>
                    <Button disabled={form.loading}>{form.loading ? "Booking..." : "Create appointment"}</Button>
                </div>
            </form>
        </section>
    )
};

