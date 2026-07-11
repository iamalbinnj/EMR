import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { api, apiMessage } from "../api/client";
import type { ApiResponse, Appointment } from "../types";
import { useToast } from "./useToast";

type AppointmentAction = {
  id: string;
  kind: "arrive" | "cancel" | "complete";
};

export const useAppointments = () => {
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [actionLoading, setActionLoading] = useState(false);
  const toast = useToast();

  const query = useQuery({
    queryKey: ["appointments", status, search, page],
    queryFn: async () => {
      const response = await api.get<ApiResponse<Appointment[]>>(
        "/appointments",
        {
          params: {
            status: status || undefined,
            search: search || undefined,
            page,
            limit: 10,
          },
        },
      );

      return response.data;
    },
  });

  const runAction = async ({ id, kind }: AppointmentAction) => {
    setActionLoading(true);

    try {
      const response =
        kind === "cancel"
          ? await api.delete(`/appointments/${id}`)
          : await api.post(`/appointments/${id}/${kind}`);

      toast.show(response.data.message, "success");
      await query.refetch();
    } catch (error) {
      toast.show(
        apiMessage(error, "Could not update appointment"),
        "error",
      );
    } finally {
      setActionLoading(false);
    }
  };

  return {
    appointments: query.data?.data ?? [],
    meta: query.data?.meta ?? {},
    loading: query.isLoading,
    status,
    setStatus,
    search,
    setSearch,
    page,
    setPage,
    runAction,
    actionLoading,
  };
};
