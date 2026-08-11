import { useState, useEffect } from "react";
import { createPortal } from "react-dom";

interface NewAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (appointment: {
    patient_name: string;
    patient_phone: string;
    procedure: string;
    appointment_date: string;
    notes: string;
  }) => void;
  prefilledDate?: Date;
}

export default function NewAppointmentModal({
  isOpen,
  onClose,
  onCreate,
  prefilledDate,
}: NewAppointmentModalProps) {
  const [newAppt, setNewAppt] = useState({
    patient_name: "",
    patient_phone: "",
    procedure: "",
    appointment_date: "",
    notes: "",
  });

  // Update appointment_date when prefilledDate changes
  useEffect(() => {
    if (prefilledDate && isOpen) {
      // Set time to 9 AM by default
      const date = new Date(prefilledDate);
      date.setHours(9, 0, 0, 0);
      setNewAppt((prev) => ({
        ...prev,
        appointment_date: date.toISOString(),
      }));
    }
  }, [prefilledDate, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !newAppt.patient_name ||
      !newAppt.patient_phone ||
      !newAppt.procedure ||
      !newAppt.appointment_date
    ) {
      alert("Please fill in all required fields");
      return;
    }
    onCreate(newAppt);
    setNewAppt({
      patient_name: "",
      patient_phone: "",
      procedure: "",
      appointment_date: "",
      notes: "",
    });
  };

  if (!isOpen) return null;

  return createPortal(
    <div
      id="new-appointment-modal"
      className="new-appointment-modal fixed inset-0 bg-slate-950/50 backdrop-blur-sm flex items-center justify-center z-[200] p-4 md:p-6"
    >
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-base md:text-lg font-bold text-white">
            New Appointment
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-slate-400 text-xs font-semibold mb-1">
              Patient Name *
            </label>
            <input
              type="text"
              required
              value={newAppt.patient_name}
              onChange={(e) =>
                setNewAppt({ ...newAppt, patient_name: e.target.value })
              }
              className="w-full bg-slate-950 border border-slate-850 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#D4AF37]"
              placeholder="e.g., Chioma Adebayo"
            />
          </div>

          <div>
            <label className="block text-slate-400 text-xs font-semibold mb-1">
              Phone Number *
            </label>
            <input
              type="tel"
              required
              value={newAppt.patient_phone}
              onChange={(e) =>
                setNewAppt({ ...newAppt, patient_phone: e.target.value })
              }
              className="w-full bg-slate-950 border border-slate-850 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#D4AF37]"
              placeholder="+234 803 111 2222"
            />
          </div>

          <div>
            <label className="block text-slate-400 text-xs font-semibold mb-1">
              Procedure *
            </label>
            <select
              required
              value={newAppt.procedure}
              onChange={(e) =>
                setNewAppt({ ...newAppt, procedure: e.target.value })
              }
              className="w-full bg-slate-950 border border-slate-850 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#D4AF37]"
            >
              <option value="">Select a procedure</option>
              <option value="Botox Forehead">Botox Forehead</option>
              <option value="Lip Filler">Lip Filler (Juvederm)</option>
              <option value="Laser Skin Resurfacing">
                Laser Skin Resurfacing
              </option>
              <option value="Teeth Whitening">Teeth Whitening</option>
              <option value="Consultation">General Consultation</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-400 text-xs font-semibold mb-1">
              Date & Time *
            </label>
            <input
              type="datetime-local"
              required
              value={
                newAppt.appointment_date
                  ? new Date(newAppt.appointment_date)
                      .toISOString()
                      .slice(0, 16)
                  : ""
              }
              onChange={(e) =>
                setNewAppt({
                  ...newAppt,
                  appointment_date: new Date(e.target.value).toISOString(),
                })
              }
              className="w-full bg-slate-950 border border-slate-850 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#D4AF37]"
            />
          </div>

          <div>
            <label className="block text-slate-400 text-xs font-semibold mb-1">
              Notes (Optional)
            </label>
            <textarea
              rows={3}
              value={newAppt.notes}
              onChange={(e) =>
                setNewAppt({ ...newAppt, notes: e.target.value })
              }
              className="w-full bg-slate-950 border border-slate-850 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#D4AF37] resize-none"
              placeholder="Any special instructions or patient preferences..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-slate-850 hover:bg-slate-800 text-slate-300 text-sm font-bold py-3 rounded-lg transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-[#D4AF37] to-amber-500 hover:from-amber-500 hover:to-[#D4AF37] text-slate-950 text-sm font-bold py-3 rounded-lg transition-all"
            >
              Create Appointment
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}
