"use client";

import SidebarLayout from "@/components/SidebarLayout";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";

interface RecentChat {
  name: string;
  phone: string;
  time: string;
  status: string;
  badge: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const supabase = createClient();
  const [firstName, setFirstName] = useState("Babajide");
  const [clinicName, setClinicName] = useState("Clinic");
  const [isMockMode, setIsMockMode] = useState(true);
  const [loading, setLoading] = useState(true);

  // Dynamic stats states
  const [totalConvs, setTotalConvs] = useState(142);
  const [takeoverCount, setTakeoverCount] = useState(12);
  const [bookingCount, setBookingCount] = useState(48);
  const [revenueValue, setRevenueValue] = useState("₦3,850,000");
  const [recentChats, setRecentChats] = useState<RecentChat[]>([]);

  const getCookieValue = (key: string, fallback: string) => {
    if (typeof document === "undefined") {
      return fallback;
    }

    const cookies = document.cookie.split("; ");
    const cookie = cookies.find((row) => row.startsWith(`${key}=`));
    return cookie ? decodeURIComponent(cookie.split("=")[1]) : fallback;
  };

  useEffect(() => {
    const isMock =
      typeof document !== "undefined" &&
      document.cookie.includes("sb-mock-session=true");
    setIsMockMode(isMock);

    const name = getCookieValue("sb-mock-user-name", "Babajide").split(" ")[0];
    setFirstName(name);

    // Get clinic name from localStorage or cookie
    if (typeof window !== "undefined") {
      const registrationData = localStorage.getItem("pending_registration");
      if (registrationData) {
        try {
          const data = JSON.parse(registrationData);
          if (data.clinicName) {
            setClinicName(data.clinicName);
          }
        } catch (e) {
          console.error("Failed to parse registration data:", e);
        }
      }
    }

    if (isMock) {
      // Load mock items
      setTotalConvs(142);
      setTakeoverCount(12);
      setBookingCount(48);
      setRevenueValue("₦3,850,000");
      setRecentChats([
        {
          name: "Chioma Adebayo",
          phone: "+234 803 111 2222",
          time: "5m ago",
          status: "Human Takeover",
          badge: "bg-amber-500/10 text-amber-400 border-amber-500/20",
        },
        {
          name: "Kelechi Okafor",
          phone: "+234 812 333 4444",
          time: "20m ago",
          status: "AI Active",
          badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
        },
        {
          name: "Babajide Balogun",
          phone: "+234 905 555 6666",
          time: "1h ago",
          status: "AI Active",
          badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
        },
      ]);
      setLoading(false);
      return;
    }

    // Fetch live database statistics
    async function loadLiveDashboardStats() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          setLoading(false);
          return;
        }

        const { data: profile } = await supabase
          .from("users")
          .select("clinic_id")
          .eq("id", user.id)
          .single();

        if (!profile?.clinic_id) {
          setLoading(false);
          return;
        }

        const clinicId = profile.clinic_id;

        // Fetch clinic name from database
        const { data: clinicData } = await supabase
          .from("clinics")
          .select("name")
          .eq("id", clinicId)
          .single();

        if (clinicData?.name) {
          setClinicName(clinicData.name);
        }

        // 1. Total Conversations count
        const { count: convCount } = await supabase
          .from("conversations")
          .select("*", { count: "exact", head: true })
          .eq("clinic_id", clinicId);

        setTotalConvs(convCount || 0);

        // 2. Takeover Escalations count
        const { count: escCount } = await supabase
          .from("conversations")
          .select("*", { count: "exact", head: true })
          .eq("clinic_id", clinicId)
          .eq("is_human_takeover", true);

        setTakeoverCount(escCount || 0);

        // 3. Bookings count (from appointments table)
        const { data: appointments, count: apptCount } = await supabase
          .from("appointments")
          .select("*", { count: "exact" })
          .eq("clinic_id", clinicId);

        const currentBookings = apptCount || 0;
        setBookingCount(currentBookings);

        // Calculate naira qualified revenue (average ₦250k/procedure for aesthetics)
        const totalValue = currentBookings * 250000;
        setRevenueValue("₦" + totalValue.toLocaleString());

        // 4. Fetch 3 most recent chat threads
        const { data: recentConvs } = await supabase
          .from("conversations")
          .select("*")
          .eq("clinic_id", clinicId)
          .order("last_message_at", { ascending: false })
          .limit(3);

        const formattedChats: RecentChat[] = [];
        for (const conv of recentConvs || []) {
          const diffMs =
            new Date().getTime() - new Date(conv.last_message_at).getTime();
          const diffMins = Math.floor(diffMs / 60000);
          const diffHours = Math.floor(diffMins / 60);

          let relativeTime = "Just now";
          if (diffHours > 0) relativeTime = `${diffHours}h ago`;
          else if (diffMins > 0) relativeTime = `${diffMins}m ago`;

          formattedChats.push({
            name: conv.patient_name || conv.patient_phone,
            phone: conv.patient_phone,
            time: relativeTime,
            status: conv.is_human_takeover ? "Human Takeover" : "AI Active",
            badge: conv.is_human_takeover
              ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
              : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
          });
        }
        setRecentChats(formattedChats);
      } catch (err) {
        console.error("Failed to load dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }

    loadLiveDashboardStats();
  }, []);

  const stats = [
    {
      name: "Total Conversations",
      value: loading ? "..." : totalConvs.toString(),
      change: isMockMode ? "+18% this week" : "Live threads in database",
      icon: (
        <svg
          className="w-5 h-5 text-[#D4AF37]"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
      ),
    },
    {
      name: "AI Automation Rate",
      value:
        totalConvs > 0
          ? `${Math.round(((totalConvs - takeoverCount) / totalConvs) * 100)}%`
          : "100%",
      change: isMockMode
        ? "130 threads automated"
        : `${totalConvs - takeoverCount} threads automated`,
      icon: (
        <svg
          className="w-5 h-5 text-emerald-400"
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
      ),
    },
    {
      name: "Human Escalations",
      value: loading ? "..." : takeoverCount.toString(),
      change: isMockMode
        ? "12 threads in inbox"
        : "Awaiting receptionist response",
      icon: (
        <svg
          className="w-5 h-5 text-amber-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      ),
    },
    {
      name: "Bookings qualified",
      value: loading ? "..." : revenueValue,
      change: isMockMode
        ? "Equivalent Naira revenue"
        : `${bookingCount} bookings scheduled`,
      icon: (
        <svg
          className="w-5 h-5 text-teal-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M9 8h6m-5 0a3 3 0 110 6H9l3 3m-3-6h6m6 1a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
  ];

  return (
    <SidebarLayout>
      <div id="dashboard-page" className="dashboard-page space-y-8 font-sans">
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight bg-linear-to-r from-white to-slate-300 bg-clip-text text-transparent">
              Welcome back, {firstName}
            </h1>
            <p className="text-slate-400 text-xs mt-1">
              Here is what is happening at {clinicName} today.
            </p>
          </div>
          <button
            onClick={() => router.push("/inbox")}
            className="bg-linear-to-r from-[#D4AF37] to-amber-500 hover:from-amber-500 hover:to-[#D4AF37] text-slate-950 text-xs font-extrabold py-2.5 px-5 rounded-lg shadow-lg shadow-[#D4AF37]/5 transition-all flex items-center gap-2"
          >
            Open Live Inbox
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
                d="M14 5l7 7m0 0l-7 7m7-7H3"
              />
            </svg>
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <div
              key={stat.name}
              className="bg-slate-900/40 border border-slate-900/60 p-5 rounded-2xl relative overflow-hidden group hover:border-slate-800 transition-colors"
            >
              <div className="flex justify-between items-start">
                <span className="text-slate-400 text-xs font-semibold">
                  {stat.name}
                </span>
                <div className="p-2 bg-slate-950 rounded-lg border border-slate-850">
                  {stat.icon}
                </div>
              </div>
              <div className="mt-4">
                <span className="text-2xl font-bold tracking-tight text-white">
                  {stat.value}
                </span>
                <span className="block text-[10px] text-slate-500 font-medium mt-1">
                  {stat.change}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Main Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Conversations List */}
          <div className="lg:col-span-2 bg-slate-900/40 border border-slate-900/60 p-6 rounded-2xl">
            <h3 className="text-sm font-bold tracking-wider mb-4 uppercase text-[#D4AF37]">
              Recent Inbox Threads
            </h3>

            <div className="divide-y divide-slate-850">
              {loading ? (
                <div className="text-xs text-slate-500 py-4">
                  Loading threads...
                </div>
              ) : recentChats.length === 0 ? (
                <div className="text-xs text-slate-500 py-4">
                  No recent threads recorded yet.
                </div>
              ) : (
                recentChats.map((chat) => (
                  <div
                    key={chat.phone}
                    className="flex justify-between items-center py-4 first:pt-0 last:pb-0"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center font-bold text-xs text-[#D4AF37]">
                        {chat.name
                          .split(" ")
                          .map((n) => n[0] || "")
                          .join("")}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-200">
                          {chat.name}
                        </p>
                        <p className="text-[10px] text-slate-500 mt-0.5">
                          {chat.phone}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3.5">
                      <span
                        className={`text-[10px] font-bold border px-2.5 py-0.5 rounded-full ${chat.badge}`}
                      >
                        {chat.status}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {chat.time}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Configuration Details */}
          <div className="bg-slate-900/40 border border-slate-900/60 p-6 rounded-2xl flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold tracking-wider mb-4 uppercase text-[#D4AF37]">
                AI Agent System
              </h3>

              <div className="space-y-4 text-xs">
                <div className="flex justify-between border-b border-slate-850 pb-2">
                  <span className="text-slate-500">Core Engine:</span>
                  <span className="text-emerald-400 font-mono">
                    Llama 3.3 70B
                  </span>
                </div>
                <div className="flex justify-between border-b border-slate-850 pb-2">
                  <span className="text-slate-500">Vector Store:</span>
                  <span className="text-white font-mono">
                    Pinecone RAG Node
                  </span>
                </div>
                <div className="flex justify-between border-b border-slate-850 pb-2">
                  <span className="text-slate-500">Primary Channel:</span>
                  <span className="text-[#D4AF37] font-semibold">
                    WhatsApp Business
                  </span>
                </div>
                <div className="flex justify-between pb-2">
                  <span className="text-slate-500">Location target:</span>
                  <span className="text-white">Lekki Phase 1, Lagos</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => router.push("/settings")}
              className="w-full mt-6 border border-slate-800 hover:bg-slate-800/40 text-slate-300 text-xs font-bold py-2.5 rounded-lg transition-colors"
            >
              Modify Customizations
            </button>
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
}
