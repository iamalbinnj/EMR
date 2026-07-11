import type { PropsWithChildren } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import type { Role } from "../types";

export const ProtectedRoute = ({ children, roles }: PropsWithChildren<{ roles?: Role[] }>) => {
    const { user } = useAuth();
    if (!user) return <Navigate to="/login" replace />;
    if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
    return children;
}

