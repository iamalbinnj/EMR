import { Button } from "../components/ui/Button";
import { Field, SelectField } from "../components/ui/Field";
import { useAdminForm } from "../hooks/useAdminForm";

export const AdminUsersPage = () => {

    const data = useAdminForm();
    // console.log(data);
    
    return (
        <section className="grid max-w-2xl gap-5">
            <div>
                <h1 className="text-2xl font-bold">Create Account</h1>
            </div>
            <form onSubmit={data.submit} className="grid gap-4 rounded-lg border border-slate-200 bg-white p-5">
                <Field required label="Full name" value={data.form.name} onChange={(e) => data.setForm({ ...data.form, name: e.target.value })} />
                <Field required type="email" label="Email" value={data.form.email} onChange={(e) => data.setForm({ ...data.form, email: e.target.value })} />
                <Field required type="password" minLength={8} label="Temporary password" value={data.form.password} onChange={(e) => data.setForm({ ...data.form, password: e.target.value })} />
                <SelectField label="Role" value={data.form.role} onChange={(e) => data.setForm({ ...data.form, role: e.target.value })}>
                    <option value="RECEPTIONIST">Receptionist</option>
                </SelectField>
                <div>
                    <Button disabled={data.loading}>{data.loading ? "Creating..." : "Create account"}</Button>
                </div>
            </form>
        </section>
    )
};

