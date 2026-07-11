import { Button } from "../components/ui/Button";
import { Field } from "../components/ui/Field";
import { useLoginForm } from "../hooks/useLoginForm";


export const LoginPage = () => {
    const form = useLoginForm();
    return (

        <main className="grid min-h-screen place-items-center bg-primary-50 p-4">
            <form onSubmit={form.submit} className="grid w-full max-w-sm gap-5 rounded-xl border border-primary-100 bg-white p-6 shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold text-primary-700">Enterprise EMR</h1>
                    <p className="mt-1 text-sm text-slate-500">Sign in to manage appointments</p>
                </div>
                <Field label="Email" type="email" required value={form.email} onChange={(e) => form.setEmail(e.target.value)} placeholder="name@emr.local" />
                <Field label="Password" type="password" required minLength={8} value={form.password} onChange={(e) => form.setPassword(e.target.value)} />
                <Button disabled={form.loading}>{form.loading ? "Signing in..." : "Sign in"}</Button>
            </form>
        </main>
    )
};

