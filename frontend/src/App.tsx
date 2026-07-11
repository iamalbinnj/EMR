import { Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "./components/layout/AppLayout";
import { ToastList } from "./components/ui/ToastList";
import { useAuth } from "./hooks/useAuth";
import { AdminUsersPage } from "./pages/AdminUsersPage";
import { AppointmentListPage } from "./pages/AppointmentListPage";
import { BookingPage } from "./pages/BookingPage";
import { DashboardPage } from "./pages/DashboardPage";
import { LoginPage } from "./pages/LoginPage";
import { SchedulerPage } from "./pages/SchedulerPage";
import { ProtectedRoute } from "./routes/ProtectedRoute";

export const App = () => {
    const { user } = useAuth();
    return (
        <>
            <Routes>
                <Route path="/login" element={user ? <Navigate to="/" replace /> : <LoginPage />} />
                <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
                    <Route index element={<DashboardPage />} />
                    <Route path="scheduler" element={<SchedulerPage />} />
                    <Route path="appointments" element={<AppointmentListPage />} />
                    <Route path="book" element={<ProtectedRoute roles={["SUPER_ADMIN", "RECEPTIONIST"]}>
                        <BookingPage />
                    </ProtectedRoute>} />
                    <Route path="admin/users" element={<ProtectedRoute roles={["SUPER_ADMIN"]}>
                        <AdminUsersPage />
                    </ProtectedRoute>} />
                </Route>
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            <ToastList />
        </>)
};
