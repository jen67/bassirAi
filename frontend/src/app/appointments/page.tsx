"use client";

import { useState, useEffect } from "react";
import SidebarLayout from "@/components/SidebarLayout";
import StatsCards from "@/components/appointments/StatsCards";
import Toolbar from "@/components/appointments/Toolbar";
import ListView from "@/components/appointments/ListView";
import CalendarView from "@/components/appointments/CalendarView";
import TimelineView from "@/components/appointments/TimelineView";
import NewAppointmentModal from "@/components/appointments/NewAppointmentModal";
import DateDetailsModal from "@/components/appointments/DateDetailsModal";
import {
  Appointment,
  ViewMode,
  FilterStatus,
} from "@/components/appointments/types";

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showNewAppointmentModal, setShowNewAppointmentModal] = useState(false);
  const [showDateDetailsModal, setShowDateDetailsModal] = useState(false);
  const [selectedDateAppointments, setSelectedDateAppointments] = useState<
    Appointment[]
  >([]);
  const [prefilledAppointmentDate, setPrefilledAppointmentDate] = useState<
    Date | undefined
  >(undefined);
  const [showStats, setShowStats] = useState(true);

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    setLoading(true);

    try {
      const response = await fetch("/api/appointments/list");

      if (response.ok) {
        const data = await response.json();
        if (data.appointments && data.appointments.length > 0) {
          setAppointments(data.appointments);
          setLoading(false);
          return;
        }
      }
    } catch (err) {
      console.log("API not available, using mock data:", err);
    }

    // Fallback to mock data
    const mockAppointments: Appointment[] = [
      {
        id: "1",
        patient_name: "Chioma Adebayo",
        patient_phone: "+234 803 111 2222",
        procedure: "Botox Forehead Treatment",
        appointment_date: new Date(
          Date.now() + 2 * 60 * 60 * 1000,
        ).toISOString(),
        status: "pending",
        notes: "First-time patient. Inquired about pricing via WhatsApp.",
        created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "2",
        patient_name: "Kelechi Okafor",
        patient_phone: "+234 812 333 4444",
        procedure: "Lip Filler (Juvederm)",
        appointment_date: new Date(
          Date.now() + 4 * 60 * 60 * 1000,
        ).toISOString(),
        status: "confirmed",
        notes: "Returning patient. Prefers 1ml syringe.",
        created_at: new Date(
          Date.now() - 2 * 24 * 60 * 60 * 1000,
        ).toISOString(),
      },
      {
        id: "3",
        patient_name: "Babajide Balogun",
        patient_phone: "+234 905 555 6666",
        procedure: "Teeth Whitening",
        appointment_date: new Date(
          Date.now() + 24 * 60 * 60 * 1000,
        ).toISOString(),
        status: "pending",
        notes: "Requested rescheduling. Awaiting callback.",
        created_at: new Date(
          Date.now() - 3 * 24 * 60 * 60 * 1000,
        ).toISOString(),
      },
      {
        id: "4",
        patient_name: "Amara Nwosu",
        patient_phone: "+234 901 777 8888",
        procedure: "Laser Skin Resurfacing",
        appointment_date: new Date(
          Date.now() - 2 * 60 * 60 * 1000,
        ).toISOString(),
        status: "completed",
        notes: "Session completed successfully. Follow-up in 2 weeks.",
        created_at: new Date(
          Date.now() - 7 * 24 * 60 * 60 * 1000,
        ).toISOString(),
      },
      {
        id: "5",
        patient_name: "Tunde Bakare",
        patient_phone: "+234 813 222 3333",
        procedure: "Botox Consultation",
        appointment_date: new Date(
          Date.now() - 24 * 60 * 60 * 1000,
        ).toISOString(),
        status: "cancelled",
        notes: "Patient cancelled due to personal emergency.",
        created_at: new Date(
          Date.now() - 5 * 24 * 60 * 60 * 1000,
        ).toISOString(),
      },
      {
        id: "6",
        patient_name: "Chizzy Adebayo",
        patient_phone: "+234 803 111 2222",
        procedure: "Botox Forehead Treatment",
        appointment_date: new Date(
          Date.now() + 2 * 60 * 60 * 1000,
        ).toISOString(),
        status: "pending",
        notes: "First-time patient. Inquired about pricing via WhatsApp.",
        created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      },
    ];

    setAppointments(mockAppointments);
    setLoading(false);
  };

  const filteredAppointments = appointments.filter((appt) => {
    const matchesStatus =
      filterStatus === "all" || appt.status === filterStatus;
    const matchesSearch =
      appt.patient_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      appt.patient_phone.includes(searchQuery) ||
      appt.procedure.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const updateAppointmentStatus = async (
    id: string,
    newStatus: Appointment["status"],
  ) => {
    setAppointments((prev) =>
      prev.map((appt) =>
        appt.id === id ? { ...appt, status: newStatus } : appt,
      ),
    );

    try {
      const response = await fetch("/api/appointments/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });

      if (!response.ok) throw new Error("Failed to update appointment");
      console.log("Appointment status updated successfully");
    } catch (err) {
      console.error("Failed to update appointment:", err);
      loadAppointments();
      alert("Failed to update appointment. Please try again.");
    }
  };

  const handleCreateAppointment = async (newAppt: {
    patient_name: string;
    patient_phone: string;
    procedure: string;
    appointment_date: string;
    notes: string;
  }) => {
    const appointment: Appointment = {
      id: Date.now().toString(),
      ...newAppt,
      status: "pending",
      created_at: new Date().toISOString(),
    };

    setAppointments((prev) => [appointment, ...prev]);
    setShowNewAppointmentModal(false);

    try {
      const response = await fetch("/api/appointments/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patient_name: newAppt.patient_name,
          patient_phone: newAppt.patient_phone,
          procedure: newAppt.procedure,
          appointment_date: newAppt.appointment_date,
          notes: newAppt.notes || null,
        }),
      });

      if (!response.ok) throw new Error("Failed to create appointment");
      const data = await response.json();
      console.log("Appointment created successfully:", data.appointmentId);
      loadAppointments();
    } catch (err) {
      console.error("Failed to create appointment:", err);
      setAppointments((prev) => prev.filter((a) => a.id !== appointment.id));
      alert("Failed to create appointment. Please try again.");
    }
  };

  const sendWhatsAppReminder = async (appointment: Appointment) => {
    alert(
      `WhatsApp reminder sent to ${appointment.patient_name} at ${appointment.patient_phone}`,
    );
  };

  const handleDateClick = (date: Date, hasAppointments: boolean) => {
    if (hasAppointments) {
      // Show existing appointments
      const dayAppointments = appointments.filter((appt) => {
        const apptDate = new Date(appt.appointment_date);
        return apptDate.toDateString() === date.toDateString();
      });
      setSelectedDateAppointments(dayAppointments);
      setSelectedDate(date);
      setShowDateDetailsModal(true);
    } else {
      // Open new appointment modal with date prefilled
      setPrefilledAppointmentDate(date);
      setShowNewAppointmentModal(true);
    }
  };

  const stats = {
    total: appointments.length,
    pending: appointments.filter((a) => a.status === "pending").length,
    confirmed: appointments.filter((a) => a.status === "confirmed").length,
    today: appointments.filter((a) => {
      const apptDate = new Date(a.appointment_date);
      const today = new Date();
      return apptDate.toDateString() === today.toDateString();
    }).length,
  };

  return (
    <SidebarLayout>
      <div
        id="appointments-page"
        className={`appointments-page h-full flex flex-col overflow-hidden ${showStats ? "space-y-4 md:space-y-6" : "space-y-3 md:space-y-4"}`}
      >
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0">
          <div>
            <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
              Appointment Manager
            </h1>
            <p className="text-slate-400 text-xs mt-1">
              Schedule, track, and manage patient bookings with AI-powered
              insights
            </p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            {/* Stats Toggle Button - Hidden on mobile and 2xl+ */}
            <button
              onClick={() => setShowStats(!showStats)}
              className="hidden md:flex 2xl:hidden items-center gap-2 px-3 py-2 bg-slate-900/40 hover:bg-slate-900/60 border border-slate-800 rounded-lg text-slate-400 hover:text-white transition-all text-xs"
              title={showStats ? "Hide Stats" : "Show Stats"}
            >
              <svg
                className={`w-4 h-4 transition-transform ${showStats ? "" : "rotate-180"}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 15l7-7 7 7"
                />
              </svg>
              <span className="font-semibold">
                {showStats ? "Hide" : "Show"} Stats
              </span>
            </button>
            <button
              onClick={() => {
                setPrefilledAppointmentDate(undefined);
                setShowNewAppointmentModal(true);
              }}
              className="bg-gradient-to-r from-[#D4AF37] to-amber-500 hover:from-amber-500 hover:to-[#D4AF37] text-slate-950 text-xs font-extrabold py-2.5 px-5 rounded-lg shadow-lg shadow-[#D4AF37]/5 transition-all flex items-center gap-2 w-full md:w-auto justify-center shrink-0"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 4v16m8-8H4"
                />
              </svg>
              New Appointment
            </button>
          </div>
        </div>

        {/* Stats Cards - Always show on mobile, collapsible on md-2xl, always show on 2xl+ */}
        <div
          className={`${showStats ? "block" : "hidden md:hidden 2xl:block"}`}
        >
          <StatsCards
            total={stats.total}
            pending={stats.pending}
            confirmed={stats.confirmed}
            today={stats.today}
          />
        </div>

        <Toolbar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          viewMode={viewMode}
          setViewMode={setViewMode}
          filterStatus={filterStatus}
          setFilterStatus={setFilterStatus}
        />

        {/* Content Area - Scrollable */}
        <div className="flex-1 overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="w-8 h-8 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : viewMode === "calendar" ? (
            <CalendarView
              appointments={appointments}
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              onDateClick={handleDateClick}
            />
          ) : viewMode === "timeline" ? (
            <TimelineView appointments={appointments} />
          ) : (
            <ListView
              appointments={filteredAppointments}
              onUpdateStatus={updateAppointmentStatus}
              onSendReminder={sendWhatsAppReminder}
            />
          )}
        </div>
      </div>

      <NewAppointmentModal
        isOpen={showNewAppointmentModal}
        onClose={() => {
          setShowNewAppointmentModal(false);
          setPrefilledAppointmentDate(undefined);
        }}
        onCreate={handleCreateAppointment}
        prefilledDate={prefilledAppointmentDate}
      />

      <DateDetailsModal
        isOpen={showDateDetailsModal}
        onClose={() => setShowDateDetailsModal(false)}
        date={selectedDate}
        appointments={selectedDateAppointments}
        onUpdateStatus={updateAppointmentStatus}
        onSendReminder={sendWhatsAppReminder}
      />
    </SidebarLayout>
  );
}
