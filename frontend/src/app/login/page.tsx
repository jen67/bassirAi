"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState("");
  const [clinicName, setClinicName] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    const isMockEmail =
      email.endsWith("@zuri.clinic") ||
      email.endsWith("@clinic.com") ||
      email === "admin@test.com" ||
      email === "admin";

    if (isMockEmail) {
      let displayName = "Babajide Benson";
      let roleName = "Clinic Admin";

      const cleanEmail = email.toLowerCase().trim();
      if (cleanEmail.startsWith("adams") || cleanEmail.startsWith("temi")) {
        displayName = "Temiloluwa Adams";
        roleName = "Receptionist";
      } else if (
        cleanEmail.includes("benson") ||
        cleanEmail.includes("hello")
      ) {
        displayName = "Babajide Benson";
        roleName = "Clinic Admin";
      } else {
        const prefix = cleanEmail.split("@")[0];
        displayName = prefix.charAt(0).toUpperCase() + prefix.slice(1);
        roleName = "Staff";
      }

      document.cookie = "sb-mock-session=true; path=/; max-age=86400";
      document.cookie = "sb-mock-onboarded=true; path=/; max-age=86400";
      document.cookie = "sb-onboarded=true; path=/; max-age=86400";
      document.cookie =
        "sb-new-user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
      document.cookie = `sb-mock-user-name=${encodeURIComponent(displayName)}; path=/; max-age=86400`;
      document.cookie = `sb-mock-user-role=${encodeURIComponent(roleName)}; path=/; max-age=86400`;

      router.refresh();
      router.push("/dashboard");
      return;
    }

    const isPlaceholder =
      process.env.NEXT_PUBLIC_SUPABASE_URL?.includes("your-project") ||
      process.env.NEXT_PUBLIC_SUPABASE_URL?.includes("placeholder");

    if (isPlaceholder) {
      setErrorMsg(
        'Supabase connection failed (using placeholder URLs). Please set your actual Supabase keys in .env. (Tip: Enter "benson@zuri.clinic" to bypass this and view the mock dashboard).',
      );
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (
          error.message?.includes("fetch") ||
          error.message?.includes("TypeError")
        ) {
          if (
            email.endsWith("@zuri.clinic") ||
            email === "admin@test.com" ||
            email === "admin"
          ) {
            document.cookie = "sb-mock-session=true; path=/; max-age=86400";
            document.cookie = "sb-mock-onboarded=true; path=/; max-age=86400";
            document.cookie = "sb-onboarded=true; path=/; max-age=86400";
            document.cookie =
              "sb-new-user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
            router.refresh();
            router.push("/dashboard");
            return;
          }
        }
        setErrorMsg(error.message);
        setLoading(false);
      } else {
        document.cookie = "sb-onboarded=true; path=/; max-age=86400";
        document.cookie = "sb-mock-onboarded=true; path=/; max-age=86400";
        document.cookie =
          "sb-new-user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";

        router.refresh();
        router.push("/dashboard");
      }
    } catch (err: unknown) {
      setErrorMsg(
        err instanceof Error
          ? err.message
          : "An error occurred during sign in.",
      );
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    if (!clinicName || !fullName) {
      setErrorMsg("Please fill in all registration fields.");
      setLoading(false);
      return;
    }

    // Clear any existing onboarded cookies to force onboarding
    document.cookie =
      "sb-onboarded=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    document.cookie =
      "sb-mock-onboarded=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";

    // Set cookies and redirect to onboarding immediately
    document.cookie = "sb-new-user=true; path=/; max-age=86400";
    document.cookie = "sb-mock-session=true; path=/; max-age=86400";
    document.cookie = `sb-mock-user-name=${encodeURIComponent(fullName)}; path=/; max-age=86400`;
    document.cookie = "sb-mock-user-role=Clinic Admin; path=/; max-age=86400";

    // Store registration data
    localStorage.setItem(
      "pending_registration",
      JSON.stringify({
        clinicName,
        fullName,
        email,
        password,
      }),
    );

    setLoading(false);

    // Force hard redirect to onboarding (bypass router cache)
    window.location.href = "/dashboard/onboarding";
  };

  return (
    <main
      id="login-page"
      className="login-page min-h-screen bg-slate-950 flex flex-col justify-center items-center p-6 relative overflow-hidden font-sans"
    >
      {/* Decorative Blur Spheres */}
      <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] bg-[#D4AF37]/5 rounded-full blur-[100px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] bg-teal-500/5 rounded-full blur-[100px]" />

      <div className="w-full max-w-md bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-8 shadow-2xl z-10">
        {/* Clinic Branding logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-linear-to-tr from-[#D4AF37] to-amber-500 flex items-center justify-center shadow-lg shadow-[#D4AF37]/10 mb-3">
            <span className="text-slate-950 font-black text-xl">B</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            BassirAI
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Aesthetic Medical Communication Engine
          </p>
        </div>

        {/* Tab switchers */}
        <div className="flex border-b border-slate-800 mb-6">
          <button
            onClick={() => {
              setIsSignUp(false);
              setErrorMsg("");
              setSuccessMsg("");
            }}
            className={`flex-1 pb-3 text-sm font-semibold border-b-2 transition-colors ${!isSignUp ? "border-[#D4AF37] text-white" : "border-transparent text-slate-400 hover:text-slate-200"}`}
          >
            Sign In
          </button>
          <button
            onClick={() => {
              setIsSignUp(true);
              setErrorMsg("");
              setSuccessMsg("");
            }}
            className={`flex-1 pb-3 text-sm font-semibold border-b-2 transition-colors ${isSignUp ? "border-[#D4AF37] text-white" : "border-transparent text-slate-400 hover:text-slate-200"}`}
          >
            Register Clinic
          </button>
        </div>

        {errorMsg && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-lg p-3 mb-4">
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-lg p-3 mb-4">
            {successMsg}
          </div>
        )}

        <form
          onSubmit={isSignUp ? handleSignUp : handleLogin}
          className="space-y-4"
        >
          {isSignUp && (
            <>
              <div>
                <label className="block text-slate-400 text-xs font-semibold mb-1">
                  Clinic Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Zuri Aesthetic Clinic"
                  value={clinicName}
                  onChange={(e) => setClinicName(e.target.value)}
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-lg py-2.5 px-3.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-[#D4AF37] transition-colors"
                />
              </div>
              <div>
                <label className="block text-slate-400 text-xs font-semibold mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Babajide Benson"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-lg py-2.5 px-3.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-[#D4AF37] transition-colors"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-slate-400 text-xs font-semibold mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              placeholder="name@gmail.com or name@clinic.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-950/80 border border-slate-800 rounded-lg py-2.5 px-3.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-[#D4AF37] transition-colors"
            />
          </div>

          <div>
            <label className="block text-slate-400 text-xs font-semibold mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-lg py-2.5 px-3.5 pr-10 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-[#D4AF37] transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858-5.908a10.046 10.046 0 013.682-.763c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m-4.692-4.692a3 3 0 00-4.243-4.243m4.243 4.243L3 3l18 18" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-linear-to-r from-[#D4AF37] to-amber-500 hover:from-amber-500 hover:to-[#D4AF37] text-slate-950 font-bold text-sm rounded-lg py-3 mt-4 transition-all duration-300 transform active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
            ) : isSignUp ? (
              "Continue to Setup"
            ) : (
              "Sign In"
            )}
          </button>
        </form>
      </div>
    </main>
  );
}
