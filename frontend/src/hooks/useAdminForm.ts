import type { FormEvent } from "react";
import { useState } from "react";
import { api, apiMessage } from "../api/client";
import { useToast } from "./useToast";

export const useAdminForm = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "RECEPTIONIST",
  });
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post("/admin/users", form);
      toast.show(data.message || "Account created", "success");
      setForm({ name: "", email: "", password: "", role: "RECEPTIONIST" });
    } catch (error) {
      toast.show(apiMessage(error, "Account creation failed"), "error");
    } finally {
      setLoading(false);
    }
  };
  return { form, setForm, loading, submit };
}
