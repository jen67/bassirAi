export interface Appointment {
  id: string;
  patient_name: string;
  patient_phone: string;
  procedure: string;
  appointment_date: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  notes: string;
  created_at: string;
  conversation_id?: string;
}

export type ViewMode = "calendar" | "list" | "timeline";
export type FilterStatus =
  | "all"
  | "pending"
  | "confirmed"
  | "completed"
  | "cancelled";
