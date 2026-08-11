import { Appointment } from "./types";
import { getStatusColor, formatDateTime } from "./utils";

interface ListViewProps {
  appointments: Appointment[];
  onUpdateStatus: (id: string, status: Appointment["status"]) => void;
  onSendReminder: (appointment: Appointment) => void;
}

export default function ListView({
  appointments,
  onUpdateStatus,
  onSendReminder,
}: ListViewProps) {
  if (appointments.length === 0) {
    return (
      <div
        id="appointments-list-empty"
        className="appointments-list-empty bg-slate-900/40 border border-slate-900/60 p-12 md:p-20 rounded-2xl text-center"
      >
        <svg
          className="w-12 md:w-16 h-12 md:h-16 text-slate-700 mx-auto mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
        <p className="text-slate-400 text-sm">No appointments found</p>
      </div>
    );
  }

  return (
    <div
      id="appointments-list"
      className="appointments-list h-full overflow-y-auto space-y-3"
    >
      {appointments.map((appointment) => (
        <div
          key={appointment.id}
          className="bg-slate-900/40 border border-slate-900/60 hover:border-slate-800 p-4 md:p-5 rounded-2xl transition-all"
        >
          {/* Mobile Layout */}
          <div className="block md:hidden space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center font-bold text-xs text-[#D4AF37] shrink-0">
                  {appointment.patient_name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-white truncate">
                    {appointment.patient_name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {appointment.patient_phone}
                  </p>
                </div>
              </div>
              <span
                className={`text-[10px] font-bold px-2.5 py-1 rounded-full border shrink-0 ${getStatusColor(appointment.status)}`}
              >
                {appointment.status.toUpperCase()}
              </span>
            </div>

            <div className="space-y-2 pl-13">
              <div className="text-xs font-semibold text-[#D4AF37]">
                {appointment.procedure}
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <svg
                  className="w-3.5 h-3.5"
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
                <span className="font-bold text-white">
                  {formatDateTime(appointment.appointment_date)}
                </span>
              </div>
              {appointment.notes && (
                <p className="text-xs text-slate-400 line-clamp-2">
                  {appointment.notes}
                </p>
              )}
            </div>

            <div className="flex gap-2 flex-wrap">
              {appointment.status === "pending" && (
                <>
                  <button
                    onClick={() => onUpdateStatus(appointment.id, "confirmed")}
                    className="flex-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold px-3 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5"
                  >
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Confirm
                  </button>
                  <button
                    onClick={() => onSendReminder(appointment)}
                    className="flex-1 bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-750 text-[10px] font-bold px-3 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5"
                  >
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                      />
                    </svg>
                    Remind
                  </button>
                </>
              )}
              {appointment.status === "confirmed" && (
                <>
                  <button
                    onClick={() => onUpdateStatus(appointment.id, "completed")}
                    className="flex-1 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 text-[10px] font-bold px-3 py-2 rounded-lg transition-all"
                  >
                    Complete
                  </button>
                  <button
                    onClick={() => onUpdateStatus(appointment.id, "cancelled")}
                    className="flex-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-[10px] font-bold px-3 py-2 rounded-lg transition-all"
                  >
                    Cancel
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Desktop Layout */}
          <div className="hidden md:flex gap-4 items-center justify-between">
            <div className="flex-1">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center font-bold text-xs text-[#D4AF37] shrink-0">
                  {appointment.patient_name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-white truncate">
                    {appointment.patient_name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {appointment.patient_phone}
                  </p>
                  <div className="mt-2">
                    <span className="text-xs font-semibold text-[#D4AF37]">
                      {appointment.procedure}
                    </span>
                  </div>
                  {appointment.notes && (
                    <p className="text-xs text-slate-400 mt-2 line-clamp-1">
                      {appointment.notes}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="text-left">
              <div className="text-xs font-bold text-white">
                {formatDateTime(appointment.appointment_date)}
              </div>
              <div className="text-[10px] text-slate-500 mt-1">
                {new Date(appointment.appointment_date).toLocaleString(
                  "en-NG",
                  {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  },
                )}
              </div>
            </div>

            <div className="flex flex-col items-end gap-3">
              <span
                className={`text-[10px] font-bold px-3 py-1 rounded-full border ${getStatusColor(appointment.status)}`}
              >
                {appointment.status.toUpperCase()}
              </span>

              <div className="flex gap-2">
                {appointment.status === "pending" && (
                  <>
                    <button
                      onClick={() =>
                        onUpdateStatus(appointment.id, "confirmed")
                      }
                      className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold px-3 py-1.5 rounded-lg transition-all flex items-center gap-1"
                    >
                      <svg
                        className="w-3 h-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      Confirm
                    </button>
                    <button
                      onClick={() => onSendReminder(appointment)}
                      className="bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-750 text-[10px] font-bold px-3 py-1.5 rounded-lg transition-all flex items-center gap-1"
                    >
                      <svg
                        className="w-3 h-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                        />
                      </svg>
                      Remind
                    </button>
                  </>
                )}

                {appointment.status === "confirmed" && (
                  <>
                    <button
                      onClick={() =>
                        onUpdateStatus(appointment.id, "completed")
                      }
                      className="bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 text-[10px] font-bold px-3 py-1.5 rounded-lg transition-all"
                    >
                      Complete
                    </button>
                    <button
                      onClick={() =>
                        onUpdateStatus(appointment.id, "cancelled")
                      }
                      className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-[10px] font-bold px-3 py-1.5 rounded-lg transition-all"
                    >
                      Cancel
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
