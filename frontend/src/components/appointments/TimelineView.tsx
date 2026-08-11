import { Appointment } from "./types";
import { getStatusColor } from "./utils";

interface TimelineViewProps {
  appointments: Appointment[];
}

export default function TimelineView({ appointments }: TimelineViewProps) {
  const getTodaysAppointments = () => {
    const today = new Date();
    return appointments
      .filter((appt) => {
        const apptDate = new Date(appt.appointment_date);
        return apptDate.toDateString() === today.toDateString();
      })
      .sort(
        (a, b) =>
          new Date(a.appointment_date).getTime() -
          new Date(b.appointment_date).getTime(),
      );
  };

  const getHourLabel = (hour: number) => {
    if (hour === 0) return "12 AM";
    if (hour === 12) return "12 PM";
    if (hour < 12) return `${hour} AM`;
    return `${hour - 12} PM`;
  };

  return (
    <div
      id="appointments-timeline"
      className="appointments-timeline bg-slate-900/40 border border-slate-900/60 rounded-2xl p-4 md:p-6 h-full flex flex-col overflow-hidden"
    >
      <div className="flex items-center justify-between mb-6 shrink-0">
        <h2 className="text-base md:text-lg font-bold text-white">
          Today&apos;s Schedule
        </h2>
        <span className="text-[10px] md:text-xs text-slate-400">
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
          })}
        </span>
      </div>

      {getTodaysAppointments().length === 0 ? (
        <div className="text-center py-12">
          <svg
            className="w-12 h-12 text-slate-700 mx-auto mb-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="text-slate-400 text-sm">No appointments today</p>
        </div>
      ) : (
        <div className="space-y-6 flex-1 overflow-y-auto">
          {[8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18].map((hour) => {
            const hourAppointments = getTodaysAppointments().filter((appt) => {
              const apptHour = new Date(appt.appointment_date).getHours();
              return apptHour === hour;
            });

            if (hourAppointments.length === 0) return null;

            return (
              <div key={hour} className="flex gap-3 md:gap-4">
                <div className="w-12 md:w-16 text-right shrink-0 pt-1">
                  <span className="text-[10px] md:text-xs font-bold text-slate-500">
                    {getHourLabel(hour)}
                  </span>
                </div>

                <div className="flex-1 space-y-3">
                  {hourAppointments.map((appt) => (
                    <div
                      key={appt.id}
                      className="bg-slate-950 border border-slate-850 rounded-lg p-3 hover:border-[#D4AF37] transition-all"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center font-bold text-[10px] text-[#D4AF37] shrink-0">
                          {appt.patient_name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .slice(0, 2)
                            .toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="text-xs md:text-sm font-bold text-white truncate">
                              {appt.patient_name}
                            </span>
                            <span
                              className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${getStatusColor(appt.status)}`}
                            >
                              {appt.status.toUpperCase()}
                            </span>
                          </div>
                          <p className="text-[10px] md:text-xs text-[#D4AF37] mb-1">
                            {appt.procedure}
                          </p>
                          <div className="flex items-center gap-2 md:gap-3 text-[9px] md:text-[10px] text-slate-500 flex-wrap">
                            <span>{appt.patient_phone}</span>
                            <span>•</span>
                            <span>
                              {new Date(
                                appt.appointment_date,
                              ).toLocaleTimeString("en-US", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
