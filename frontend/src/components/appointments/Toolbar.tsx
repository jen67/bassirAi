type ViewMode = "calendar" | "list" | "timeline";
type FilterStatus = "all" | "pending" | "confirmed" | "completed" | "cancelled";

interface ToolbarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  filterStatus: FilterStatus;
  setFilterStatus: (status: FilterStatus) => void;
}

export default function Toolbar({
  searchQuery,
  setSearchQuery,
  viewMode,
  setViewMode,
  filterStatus,
  setFilterStatus,
}: ToolbarProps) {
  return (
    <div
      id="appointments-toolbar"
      className="appointments-toolbar bg-slate-900/40 border border-slate-900/60 p-4 rounded-2xl space-y-4 shrink-0"
    >
      {/* Top Row: Search and View Toggle */}
      <div className="flex flex-col md:flex-row gap-3 md:gap-4">
        {/* Search */}
        <div className="flex-1">
          <div className="relative">
            <svg
              className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Search by name, phone, or procedure..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-850 rounded-lg pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-[#D4AF37]"
            />
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="flex gap-1 bg-slate-950 p-1 rounded-lg border border-slate-850">
          {(["list", "calendar", "timeline"] as ViewMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`flex-1 px-4 py-2 rounded-md text-xs font-bold transition-all capitalize ${
                viewMode === mode
                  ? "bg-slate-800 text-white"
                  : "text-slate-500 hover:text-white"
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* Bottom Row: Filter Status (only show in list view) */}
      {viewMode === "list" && (
        <div className="flex gap-2 flex-wrap">
          {(
            [
              "all",
              "pending",
              "confirmed",
              "completed",
              "cancelled",
            ] as FilterStatus[]
          ).map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`text-xs font-bold px-4 py-2 rounded-lg transition-all capitalize ${
                filterStatus === status
                  ? "bg-[#D4AF37] text-slate-950"
                  : "bg-slate-950 text-slate-400 border border-slate-850 hover:border-slate-800"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
