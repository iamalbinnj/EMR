import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { api } from "../api/client";
import type { ApiResponse, Slot } from "../types";
import { useDoctors } from "./useDoctors";
import { useSocket } from "./useSocket";

const today = () => new Date().toISOString().slice(0, 10);

export const useScheduler = () => {
  const doctors = useDoctors();
  const [doctorId, setDoctorId] = useState("");
  const [date, setDate] = useState(today);
  const slots = useQuery({
    queryKey: ["slots", doctorId, date],
    enabled: Boolean(doctorId && date),
    queryFn: async () =>
      (
        await api.get<ApiResponse<Slot[]>>("/slots", {
          params: { doctorId, date },
        })
      ).data.data,
  });
  useSocket(doctorId, date);
  return {
    doctors: doctors.data ?? [],
    doctorsLoading: doctors.isLoading,
    doctorId,
    setDoctorId,
    date,
    setDate,
    slots: slots.data ?? [],
    slotsLoading: slots.isLoading,
    error: slots.error,
  };
};
