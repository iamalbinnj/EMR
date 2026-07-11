import { useQuery } from "@tanstack/react-query";
import type { FormEvent } from "react";
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { api, apiMessage } from "../api/client";
import type { ApiResponse, Appointment, Patient, Slot } from "../types";
import { useDoctors } from "./useDoctors";
import { useToast } from "./useToast";

const today = () => new Date().toISOString().slice(0, 10);

export const useBookingForm = () => {
  const [params] = useSearchParams();
  const [doctorId, setDoctorId] = useState(params.get("doctorId") ?? "");
  const [date, setDate] = useState(params.get("date") ?? today());
  const [slotStartTime, setSlotStartTime] = useState(
    params.get("time") ?? "",
  );
  const [patientSearch, setPatientSearch] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [newPatient, setNewPatient] = useState({ name: "", mobile: "" });
  const [purpose, setPurpose] = useState("");
  const [loading, setLoading] = useState(false);

  const doctors = useDoctors();
  const toast = useToast();
  const navigate = useNavigate();

  const patients = useQuery({
    queryKey: ["patients", patientSearch],
    enabled: patientSearch.length >= 2,
    queryFn: async () => {
      const response = await api.get<ApiResponse<Patient[]>>(
        "/patients/search",
        { params: { query: patientSearch } },
      );
      return response.data.data;
    },
  });

  const slots = useQuery({
    queryKey: ["slots", doctorId, date],
    enabled: Boolean(doctorId && date),
    queryFn: async () => {
      const response = await api.get<ApiResponse<Slot[]>>("/slots", {
        params: { doctorId, date },
      });
      return response.data.data;
    },
  });

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);

    try {
      const response = await api.post<ApiResponse<Appointment>>(
        "/appointments",
        {
          doctorId,
          date,
          slotStartTime,
          purpose,
          ...(selectedPatient
            ? { patientId: selectedPatient._id }
            : { patient: newPatient }),
        },
      );

      toast.show(response.data.message || "Appointment created", "success");
      navigate("/appointments");
    } catch (error) {
      toast.show(apiMessage(error, "Appointment booking failed"), "error");
    } finally {
      setLoading(false);
    }
  };

  return {
    doctors: doctors.data ?? [],
    doctorId,
    setDoctorId,
    date,
    setDate,
    slots: slots.data ?? [],
    slotStartTime,
    setSlotStartTime,
    patientSearch,
    setPatientSearch,
    patients: patients.data ?? [],
    selectedPatient,
    setSelectedPatient,
    newPatient,
    setNewPatient,
    purpose,
    setPurpose,
    submit,
    loading,
  };
};
