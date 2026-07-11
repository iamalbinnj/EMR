import type { PropsWithChildren } from "react";
import { useMemo, useState } from "react";
import { api } from "../api/client";
import type { ApiResponse, User } from "../types";
import { AuthContext } from "./AuthContext";

const storedUser = () => {
  try {
    return JSON.parse(localStorage.getItem("emr_user") ?? "null") as User | null;
  } catch {
    return null;
  }
};

export const AuthProvider = ({ children }: PropsWithChildren) => {
  const [user, setUser] = useState<User | null>(storedUser);
  const value = useMemo(() => ({
    user,
    login: async (email: string, password: string) => {
      const { data } = await api.post<ApiResponse<{ user: User; accessToken: string; refreshToken: string }>>("/auth/login", { email, password });
      localStorage.setItem("emr_access_token", data.data.accessToken);
      localStorage.setItem("emr_refresh_token", data.data.refreshToken);
      localStorage.setItem("emr_user", JSON.stringify(data.data.user));
      setUser(data.data.user);
      return data.message;
    },
    logout: async () => {
      const refreshToken = localStorage.getItem("emr_refresh_token");
      try {
        if (refreshToken)
          await api.post("/auth/logout", { refreshToken });
      }
      finally {
        localStorage.removeItem("emr_access_token");
        localStorage.removeItem("emr_refresh_token");
        localStorage.removeItem("emr_user");
        setUser(null);
      }
    }
  }), [user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

