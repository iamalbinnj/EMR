import axios from "axios";
import type { ApiResponse } from "../types";

const baseURL = import.meta.env.VITE_API_URL ?? "http://localhost:4000/api/v1";
export const api = axios.create({ baseURL, timeout: 15000 });

api.interceptors.request.use((request) => {
  const token = localStorage.getItem("emr_access_token");
  if (token) request.headers.Authorization = `Bearer ${token}`;
  return request;
});

let refreshing: Promise<string> | null = null;
api.interceptors.response.use(undefined, async (error) => {
  const original = error.config;
  if (
    error.response?.status !== 401 ||
    original?._retry ||
    original?.url?.includes("/auth/")
  )
    return Promise.reject(error);
  original._retry = true;


  const refreshToken = localStorage.getItem("emr_refresh_token");
  if (!refreshToken) return Promise.reject(error);
  refreshing ??= axios
    .post<ApiResponse<{ accessToken: string; refreshToken: string }>>(
      `${baseURL}/auth/refresh`,
      { refreshToken },
    )
    .then(({ data }) => {
      localStorage.setItem("emr_access_token", data.data.accessToken);
      localStorage.setItem("emr_refresh_token", data.data.refreshToken);
      return data.data.accessToken;
    })
    .finally(() => {
      refreshing = null;
    });

    
  original.headers.Authorization = `Bearer ${await refreshing}`;
  return api(original);
});

export const apiMessage = (error: unknown, fallback: string) =>
  axios.isAxiosError(error)
    ? (error.response?.data?.message ?? fallback)
    : fallback;
