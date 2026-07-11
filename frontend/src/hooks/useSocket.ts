import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { io } from "socket.io-client";

export const useSocket = (doctorId?: string, date?: string) => {
  const queryClient = useQueryClient();
  useEffect(() => {
    if (!doctorId || !date) return;
    const token = localStorage.getItem("emr_access_token");
    const socket = io(
      import.meta.env.VITE_SOCKET_URL ?? "http://localhost:4000",
      { auth: { token } },
    );
    const room = { doctorId, date };
    // console.log(doctorId)

    socket.emit("join-room", room);


    const refresh = () => {
      void queryClient.invalidateQueries({
        queryKey: ["slots", doctorId, date],
      });
      void queryClient.invalidateQueries({ queryKey: ["appointments"] });
    };


    socket.on("appointment:created", refresh);
    socket.on("appointment:updated", refresh);
    socket.on("appointment:cancelled", refresh);
    
    return () => {
      socket.emit("leave-room", room);
      socket.disconnect();
    };
  }, [doctorId, date, queryClient]);
};
