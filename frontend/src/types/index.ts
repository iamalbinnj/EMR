export type Role = "SUPER_ADMIN" | "RECEPTIONIST" | "DOCTOR";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  doctorId?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  meta: Record<string, number>;
}

export interface Department {
  _id: string;
  name: string;
}

export interface Doctor {
  _id: string;
  name: string;
  specialization?: string;
  departmentId: Department;
}

export interface Patient {
  _id: string;
  patientCode: string;
  name: string;
  mobile: string;
  gender?: string;
  dob?: string;
  address?: string;
}

export interface Slot {
  startTime: string;
  endTime: string;
  available: boolean;
}

export type AppointmentStatus =
  | "SCHEDULED"
  | "ARRIVED"
  | "COMPLETED"
  | "CANCELLED";

export interface Appointment {
  _id: string;
  patientId: Patient;
  doctorId: Doctor;
  departmentId: Department;
  date: string;
  slotStartTime: string;
  slotEndTime: string;
  status: AppointmentStatus;
  purpose?: string;
  notes?: string;
}
