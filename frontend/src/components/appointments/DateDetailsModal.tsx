import { Appointment } from "./types";
import { getStatusColor } from "./utils";
import { createPortal } from "react-dom";

interface DateDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: Date;
  appointments: Appointment[];
  onUpdateStatus: (id: string, status: Appointment["status"]) => void;
  onSendReminder: (appointment: Appointment) => void;
}

export default function DateDetailsModal({
  isOpen,
  onClose,
  date,
  appointments,
  onUpdateStatus,
  onSendReminder,
}: DateDetailsModalProps) {
  if (!isOpen) return null;

  return createPortal(
    <div
      id="date-details-modal"
      className="date-details-modal fixed inset-0 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center z-[200] p-4 md:p-6"
    >
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-base md:text-lg font-bold text-white">
            {date.toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="space-y-3">
          {appointments.map((appointment) => (
            <div
              key={appointment.id}
              className="bg-slate-950 border border-slate-850 hover:border-slate-800 p-4 rounded-xl transition-all"
            >
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center font-bold text-xs text-[#D4AF37] shrink-0">
                  {appointment.patient_name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="text-sm font-bold text-white">
                      {appointment.patient_name}
                    </h3>
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${getStatusColor(appointment.status)}`}
                    >
                      {appointment.status.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    {appointment.patient_phone}
                  </p>
                  <p className="text-xs text-[#D4AF37] mt-2">
                    {appointment.procedure}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    {new Date(appointment.appointment_date).toLocaleTimeString(
                      "en-US",
                      {
                        hour: "2-digit",
                        minute: "2-digit",
                      },
                    )}
                  </p>
                  {appointment.notes && (
                    <p className="text-xs text-slate-400 mt-2">
                      {appointment.notes}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex gap-2 flex-wrap mt-3 pt-3 border-t border-slate-850">
                {appointment.status === "pending" && (
                  <>
                    <button
                      onClick={() => {
                        onUpdateStatus(appointment.id, "confirmed");
                        onClose();
                      }}
                      className="flex-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold px-3 py-2 rounded-lg transition-all"
                    >
                      Confirm
                    </button>
                    <button
                      onClick={() => onSendReminder(appointment)}
                      className="flex-1 bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-750 text-[10px] font-bold px-3 py-2 rounded-lg transition-all"
                    >
                      Remind
                    </button>
                  </>
                )}
                {appointment.status === "confirmed" && (
                  <>
                    <button
                      onClick={() => {
                        onUpdateStatus(appointment.id, "completed");
                        onClose();
                      }}
                      className="flex-1 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 text-[10px] font-bold px-3 py-2 rounded-lg transition-all"
                    >
                      Complete
                    </button>
                    <button
                      onClick={() => {
                        onUpdateStatus(appointment.id, "cancelled");
                        onClose();
                      }}
                      className="flex-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-[10px] font-bold px-3 py-2 rounded-lg transition-all"
                    >
                      Cancel
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>,
    document.body,
  );
}
