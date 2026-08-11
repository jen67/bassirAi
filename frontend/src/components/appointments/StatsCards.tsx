interface StatsCardsProps {
  total: number;
  pending: number;
  confirmed: number;
  today: number;
}

export default function StatsCards({
  total,
  pending,
  confirmed,
  today,
}: StatsCardsProps) {
  return (
    <div
      id="appointments-stats"
      className="appointments-stats grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3 2xl:gap-4 shrink-0"
    >
      <div className="bg-slate-900/40 border border-slate-900/60 p-3 md:p-4 2xl:p-5 rounded-xl 2xl:rounded-2xl">
        <div className="flex justify-between items-start mb-2 2xl:mb-3">
          <span className="text-slate-400 text-[10px] md:text-xs font-semibold">
            Total Bookings
          </span>
          <div className="p-1.5 md:p-2 bg-slate-950 rounded-lg border border-slate-850">
            <svg
              className="w-3.5 h-3.5 md:w-4 md:h-4 text-[#D4AF37]"
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
          </div>
        </div>
        <span className="text-xl md:text-2xl font-bold text-white">
          {total}
        </span>
      </div>

      <div className="bg-slate-900/40 border border-slate-900/60 p-3 md:p-4 2xl:p-5 rounded-xl 2xl:rounded-2xl">
        <div className="flex justify-between items-start mb-2 2xl:mb-3">
          <span className="text-slate-400 text-[10px] md:text-xs font-semibold">
            Pending
          </span>
          <div className="p-1.5 md:p-2 bg-slate-950 rounded-lg border border-slate-850">
            <svg
              className="w-3.5 h-3.5 md:w-4 md:h-4 text-amber-500"
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
          </div>
        </div>
        <span className="text-xl md:text-2xl font-bold text-white">
          {pending}
        </span>
      </div>

      <div className="bg-slate-900/40 border border-slate-900/60 p-3 md:p-4 2xl:p-5 rounded-xl 2xl:rounded-2xl">
        <div className="flex justify-between items-start mb-2 2xl:mb-3">
          <span className="text-slate-400 text-[10px] md:text-xs font-semibold">
            Confirmed
          </span>
          <div className="p-1.5 md:p-2 bg-slate-950 rounded-lg border border-slate-850">
            <svg
              className="w-3.5 h-3.5 md:w-4 md:h-4 text-emerald-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        </div>
        <span className="text-xl md:text-2xl font-bold text-white">
          {confirmed}
        </span>
      </div>

      <div className="bg-slate-900/40 border border-slate-900/60 p-3 md:p-4 2xl:p-5 rounded-xl 2xl:rounded-2xl">
        <div className="flex justify-between items-start mb-2 2xl:mb-3">
          <span className="text-slate-400 text-[10px] md:text-xs font-semibold">
            Today
          </span>
          <div className="p-1.5 md:p-2 bg-slate-950 rounded-lg border border-slate-850">
            <svg
              className="w-3.5 h-3.5 md:w-4 md:h-4 text-teal-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </div>
        </div>
        <span className="text-xl md:text-2xl font-bold text-white">
          {today}
        </span>
      </div>
    </div>
  );
}
