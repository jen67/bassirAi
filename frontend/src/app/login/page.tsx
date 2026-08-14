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
      document.cookie = "sb-new-user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
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
            document.cookie = "sb-new-user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
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
        document.cookie = "sb-new-user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";

        // Check if returning user's clinic has customizations setup
        if (data?.user) {
          try {
            const { data: userProf } = await supabase
              .from("users")
              .select("clinic_id")
              .eq("id", data.user.id)
              .maybeSingle();

            if (userProf?.clinic_id) {
              const { data: custom } = await supabase
                .from("clinic_customizations")
                .select("clinic_id")
                .eq("clinic_id", userProf.clinic_id)
                .maybeSingle();

              if (!custom) {
                // If user registered account previously but never completed onboarding
                document.cookie = "sb-new-user=true; path=/; max-age=86400";
                document.cookie = "sb-onboarded=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
                document.cookie = "sb-mock-onboarded=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
                router.refresh();
                router.push("/dashboard/onboarding");
                return;
              }
            }
          } catch (e) {
            console.error("Error verifying customization status:", e);
          }
        }

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

    const isPlaceholder =
      process.env.NEXT_PUBLIC_SUPABASE_URL?.includes("your-project") ||
      process.env.NEXT_PUBLIC_SUPABASE_URL?.includes("placeholder");

    if (isPlaceholder) {
      setSuccessMsg(
        'Registration mock successful! (Supabase is in placeholder mode, so no live DB entry was created. You can now switch to the Sign In tab and enter "benson@zuri.clinic" to log in).',
      );
      setLoading(false);
      return;
    }

    try {
      // 1. Create the new Clinic record first
      console.log("Step 1: Creating clinic record...");
      const clinicRes = await fetch("/api/clinics/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clinicName, adminEmail: email }),
      });

      const clinicData = await clinicRes.json().catch(() => ({}));
      console.log("Clinic registration response:", clinicData);

      if (!clinicRes.ok) {
        const errorMsg = clinicData?.error || "Failed to initialize clinic profile. Please check if this email is already registered.";
        setErrorMsg(errorMsg);
        setLoading(false);
        return;
      }

      const { clinicId } = clinicData;
      console.log("Clinic created with ID:", clinicId);

      // 2. Register the user in Supabase Auth, passing clinic_id and role as options
      console.log("Step 2: Creating auth user...");
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            clinic_id: clinicId,
            role: "clinic_admin",
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        console.error("Auth signup error:", error.message);
        setErrorMsg(error.message);
        setLoading(false);
        return;
      }

      console.log("Auth user created:", data.user?.id);

      if (data.user) {
        // 3. Create the user record in our public 'users' table
        console.log("Step 3: Creating user profile record...");
        const userInsert = await fetch("/api/users/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: data.user.id,
            clinicId,
            email,
            fullName,
            role: "clinic_admin",
          }),
        });

        const userInsertData = await userInsert.json().catch(() => ({}));
        console.log("User profile response:", userInsertData);

        if (!userInsert.ok) {
          const userErr = userInsertData?.error || "Failed to link user profile to database";
          setErrorMsg(userErr);
          setLoading(false);
          return;
        }

        console.log("Registration completed successfully!");
        document.cookie = "sb-new-user=true; path=/; max-age=86400";
        document.cookie = "sb-onboarded=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
        document.cookie = "sb-mock-onboarded=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";

        if (data.session) {
          // If session is active immediately upon signup, proceed to onboarding
          router.refresh();
          router.push("/dashboard/onboarding");
          return;
        }

        setSuccessMsg(
          "Registration successful! Please check your email to verify your account, or sign in to complete your clinic setup.",
        );
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        if (err.message.includes("fetch")) {
          setErrorMsg(
            "Cannot connect to database. Check your Supabase URL in .env",
          );
        } else if (
          err.message.includes("duplicate") ||
          err.message.includes("already exists") ||
          err.message.includes("registered")
        ) {
          setErrorMsg(
            "This email or clinic is already registered. Try signing in instead.",
          );
        } else {
          setErrorMsg(err.message);
        }
      } else {
        setErrorMsg("An unexpected error occurred during sign up.");
      }
    } finally {
      setLoading(false);
    }
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
              placeholder="name@clinic.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-950/80 border border-slate-800 rounded-lg py-2.5 px-3.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-[#D4AF37] transition-colors"
            />
          </div>

          <div>
            <label className="block text-slate-400 text-xs font-semibold mb-1">
              Password
            </label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-950/80 border border-slate-800 rounded-lg py-2.5 px-3.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-[#D4AF37] transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-linear-to-r from-[#D4AF37] to-amber-500 hover:from-amber-500 hover:to-[#D4AF37] text-slate-950 font-bold text-sm rounded-lg py-3 mt-4 transition-all duration-300 transform active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
            ) : isSignUp ? (
              "Register Admin & Clinic"
            ) : (
              "Sign In"
            )}
          </button>
        </form>
      </div>
    </main>
  );
}
