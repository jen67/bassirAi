import { Appointment } from "./types";

export const getStatusColor = (status: Appointment["status"]) => {
  switch (status) {
    case "pending":
      return "bg-amber-500/10 text-amber-400 border-amber-500/20";
    case "confirmed":
      return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
    case "completed":
      return "bg-blue-500/10 text-blue-400 border-blue-500/20";
    case "cancelled":
      return "bg-red-500/10 text-red-400 border-red-500/20";
  }
};

export const formatDateTime = (isoString: string) => {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

  if (diffHours === 0) {
    const diffMins = Math.floor(diffMs / (1000 * 60));
    if (diffMins > 0) return `In ${diffMins} minutes`;
    if (diffMins < 0) return `${Math.abs(diffMins)} minutes ago`;
    return "Now";
  } else if (diffHours > 0 && diffHours < 24) {
    return `In ${diffHours} hours`;
  } else if (diffHours < 0 && diffHours > -24) {
    return `${Math.abs(diffHours)} hours ago`;
  }

  return date.toLocaleString("en-NG", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};
