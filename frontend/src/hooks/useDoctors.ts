import { useQuery } from "@tanstack/react-query";
import { api } from "../api/client";
import type { ApiResponse, Doctor } from "../types";

export const useDoctors = () => {
  return useQuery({
    queryKey: ["doctors"],
    queryFn: async () =>
      (await api.get<ApiResponse<Doctor[]>>("/doctors")).data.data,
    staleTime: 300000,
  });
};
