import { Appointment } from "./types";

interface CalendarViewProps {
  appointments: Appointment[];
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  onDateClick: (date: Date, hasAppointments: boolean) => void;
}

export default function CalendarView({
  appointments,
  selectedDate,
  setSelectedDate,
  onDateClick,
}: CalendarViewProps) {
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek, year, month };
  };

  const getAppointmentsForDate = (date: Date) => {
    return appointments.filter((appt) => {
      const apptDate = new Date(appt.appointment_date);
      return apptDate.toDateString() === date.toDateString();
    });
  };

  return (
    <div
      id="appointments-calendar"
      className="appointments-calendar bg-slate-900/40 border border-slate-900/60 rounded-2xl p-4 md:p-6 flex flex-col h-full"
    >
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-4 shrink-0">
        <h2 className="text-base md:text-lg font-bold text-white">
          {selectedDate.toLocaleDateString("en-US", {
            month: "long",
            year: "numeric",
          })}
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() =>
              setSelectedDate(
                new Date(
                  selectedDate.getFullYear(),
                  selectedDate.getMonth() - 1,
                ),
              )
            }
            className="p-2 bg-slate-950 hover:bg-slate-800 text-slate-300 rounded-lg border border-slate-850 transition-all"
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
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <button
            onClick={() => setSelectedDate(new Date())}
            className="px-3 md:px-4 py-2 bg-slate-950 hover:bg-slate-800 text-slate-300 text-xs font-bold rounded-lg border border-slate-850 transition-all"
          >
            Today
          </button>
          <button
            onClick={() =>
              setSelectedDate(
                new Date(
                  selectedDate.getFullYear(),
                  selectedDate.getMonth() + 1,
                ),
              )
            }
            className="p-2 bg-slate-950 hover:bg-slate-800 text-slate-300 rounded-lg border border-slate-850 transition-all"
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
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Calendar Grid Container with internal scroll */}
      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-7 gap-1 md:gap-2">
          {/* Day Headers */}
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div
              key={day}
              className="text-center text-[10px] md:text-xs font-bold text-slate-500 py-1"
            >
              {day}
            </div>
          ))}

          {/* Calendar Days */}
          {(() => {
            const { daysInMonth, startingDayOfWeek, year, month } =
              getDaysInMonth(selectedDate);
            const days = [];

            // Empty cells before first day
            for (let i = 0; i < startingDayOfWeek; i++) {
              days.push(
                <div
                  key={`empty-${i}`}
                  className="h-18 bg-slate-950/30 rounded-lg"
                />,
              );
            }

            // Actual days
            for (let day = 1; day <= daysInMonth; day++) {
              const currentDate = new Date(year, month, day);
              const dayAppointments = getAppointmentsForDate(currentDate);
              const isToday =
                currentDate.toDateString() === new Date().toDateString();

              days.push(
                <div
                  key={day}
                  onClick={() =>
                    onDateClick(currentDate, dayAppointments.length > 0)
                  }
                  className={`h-18 p-1.5 rounded-lg border transition-all cursor-pointer hover:border-[#D4AF37] hover:bg-slate-900/60 ${
                    isToday
                      ? "bg-[#D4AF37]/10 border-[#D4AF37]"
                      : "bg-slate-950/50 border-slate-850"
                  }`}
                >
                  <div className="flex flex-col h-full">
                    <span
                      className={`text-xs font-bold mb-0.5 ${isToday ? "text-[#D4AF37]" : "text-slate-300"}`}
                    >
                      {day}
                    </span>
                    <div className="flex-1 flex flex-col gap-0.5 overflow-hidden">
                      {dayAppointments.slice(0, 2).map((appt) => (
                        <div
                          key={appt.id}
                          className={`text-[8px] px-1 py-0.5 rounded truncate ${
                            appt.status === "pending"
                              ? "bg-amber-500/20 text-amber-400"
                              : appt.status === "confirmed"
                                ? "bg-emerald-500/20 text-emerald-400"
                                : appt.status === "completed"
                                  ? "bg-blue-500/20 text-blue-400"
                                  : "bg-red-500/20 text-red-400"
                          }`}
                        >
                          {appt.patient_name.split(" ")[0]}
                        </div>
                      ))}
                      {dayAppointments.length > 2 && (
                        <div className="text-[8px] text-slate-500 px-1">
                          +{dayAppointments.length - 2}
                        </div>
                      )}
                    </div>
                  </div>
                </div>,
              );
            }

            return days;
          })()}
        </div>
      </div>
    </div>
  );
}
