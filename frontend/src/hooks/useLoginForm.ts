import type { FormEvent } from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiMessage } from "../api/client";
import { useAuth } from "./useAuth";
import { useToast } from "./useToast";

export const useLoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const auth = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    try {
      toast.show(await auth.login(email, password), "success");
      navigate("/");
    } catch (error) {
      toast.show(apiMessage(error, "Login failed"), "error");
    } finally {
      setLoading(false);
    }
  };
  return { email, setEmail, password, setPassword, loading, submit };
};
