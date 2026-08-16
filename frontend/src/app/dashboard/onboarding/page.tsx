"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

interface CatalogItem {
  name: string;
  price: string;
  description: string;
}

interface FAQItem {
  question: string;
  answer: string;
}

interface SandboxMessage {
  sender: "patient" | "ai";
  text: string;
}

export default function OnboardingPage() {
  const router = useRouter();
  const supabase = createClient();

  // Wizard state machine
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Form states
  const [clinicName, setClinicName] = useState("");
  const [aiTone, setAiTone] = useState("professional");
  const [primaryLang, setPrimaryLang] = useState("en");

  // Load clinic name from registration if available
  useEffect(() => {
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
  }, []);

  // Platform selection states
  const [enabledPlatforms, setEnabledPlatforms] = useState<string[]>([
    "whatsapp",
  ]);

  // WhatsApp credentials
  const [waPhoneId, setWaPhoneId] = useState("");
  const [waAccId, setWaAccId] = useState("");
  const [waToken, setWaToken] = useState("");

  // Instagram credentials
  const [instaUsername, setInstaUsername] = useState("");
  const [instaToken, setInstaToken] = useState("");

  // Facebook credentials
  const [fbPageId, setFbPageId] = useState("");
  const [fbToken, setFbToken] = useState("");

  const [catalog, setCatalog] = useState<CatalogItem[]>([
    {
      name: "Botox Forehead lines",
      price: "₦180,000 - ₦300,000",
      description: "Reduces frown lines",
    },
    {
      name: "Lip Filler (Juvederm)",
      price: "₦450,000 - ₦600,000",
      description: "Enhances lip volume",
    },
  ]);

  const [faqs, setFaqs] = useState<FAQItem[]>([
    {
      question: "Do you offer parking?",
      answer:
        "Yes, we provide complimentary parking validation for all Zuri patients at our Lekki office.",
    },
  ]);

  const [bookingStrategy, setBookingStrategy] = useState<"calcom" | "callback">(
    "callback",
  );
  const [calComUrl, setCalComUrl] = useState("");
  const [calComApiKey, setCalComApiKey] = useState("");

  // Sandbox simulation states
  const [sandboxMessages, setSandboxMessages] = useState<SandboxMessage[]>([
    { sender: "patient", text: "Hi, how much is Lip Filler?" },
    {
      sender: "ai",
      text: "Hello! Lip Filler (Juvederm) at Zuri Clinic is ₦450,000 - ₦600,000 per syringe depending on density. Would you like me to schedule a consultation with our practitioner in Lekki?",
    },
  ]);
  const [sandboxInput, setSandboxInput] = useState("");

  // Check if we are running in placeholder/mock mode
  const [isPlaceholder, setIsPlaceholder] = useState(true);

  useEffect(() => {
    const checkPlaceholder = () => {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
      setIsPlaceholder(
        !!(url?.includes("your-project") || url?.includes("placeholder")),
      );
    };
    checkPlaceholder();
  }, []);

  // Dynamic Add / Remove catalog handlers
  const addCatalogRow = () => {
    setCatalog([...catalog, { name: "", price: "₦", description: "" }]);
  };
  const removeCatalogRow = (index: number) => {
    setCatalog(catalog.filter((_, i) => i !== index));
  };
  const updateCatalogItem = (
    index: number,
    field: keyof CatalogItem,
    value: string,
  ) => {
    const updated = [...catalog];
    updated[index][field] = value;
    setCatalog(updated);
  };

  // Platform toggle handler
  const togglePlatform = (platform: string) => {
    if (enabledPlatforms.includes(platform)) {
      setEnabledPlatforms(enabledPlatforms.filter((p) => p !== platform));
    } else {
      setEnabledPlatforms([...enabledPlatforms, platform]);
    }
  };

  // Dynamic Add / Remove FAQ handlers
  const addFAQRow = () => {
    setFaqs([...faqs, { question: "", answer: "" }]);
  };
  const removeFAQRow = (index: number) => {
    setFaqs(faqs.filter((_, i) => i !== index));
  };
  const updateFAQItem = (
    index: number,
    field: keyof FAQItem,
    value: string,
  ) => {
    const updated = [...faqs];
    updated[index][field] = value;
    setFaqs(updated);
  };

  // Simulated AI response in Sandbox Step 6
  const sendSandboxMessage = () => {
    if (!sandboxInput.trim()) return;
    const newMsgs: SandboxMessage[] = [
      ...sandboxMessages,
      { sender: "patient", text: sandboxInput },
    ];
    setSandboxMessages(newMsgs);
    const query = sandboxInput.toLowerCase();
    setSandboxInput("");

    setTimeout(() => {
      let reply = `Thank you for your message. At Zuri Aesthetic Clinic, we offer specialized laser treatments, dermal fillers, and Botox at our Lekki office. How can I help you today?`;
      if (
        query.includes("price") ||
        query.includes("cost") ||
        query.includes("much") ||
        query.includes("naira") ||
        query.includes("₦")
      ) {
        const matches = catalog.filter((item) =>
          query
            .split(" ")
            .some((word) => item.name.toLowerCase().includes(word)),
        );
        if (matches.length > 0) {
          reply = `Our current pricing: ${matches.map((m) => `${m.name} is ${m.price}`).join(", ")}. Would you like to schedule a consultation?`;
        } else {
          reply = `Pricing: Botox is ₦180,000 - ₦300,000 and Lip Fillers are ₦450,000 - ₦600,000. Let me know if you'd like to book a slots.`;
        }
      } else if (
        query.includes("park") ||
        query.includes("location") ||
        query.includes("where") ||
        query.includes("road")
      ) {
        const matches = faqs.filter(
          (f) =>
            f.question.toLowerCase().includes("park") ||
            f.question.toLowerCase().includes("location"),
        );
        reply =
          matches.length > 0
            ? matches[0].answer
            : `Zuri Aesthetic Clinic is located in Lekki, Lagos. We provide free parking validation at our entrance.`;
      } else if (
        query.includes("book") ||
        query.includes("appoint") ||
        query.includes("schedule")
      ) {
        reply =
          bookingStrategy === "calcom"
            ? `You can book an appointment immediately using our live calendar here: ${calComUrl || "https://cal.com/zuri-clinic"}`
            : `I would be happy to organize a callback for you! Could you please share your full name, best contact number, and preferred date?`;
      }
      const aiMsg: SandboxMessage = { sender: "ai", text: reply };
      setSandboxMessages([...newMsgs, aiMsg]);
    }, 800);
  };

  // Handle final save configurations
  const handleOnboardingComplete = async () => {
    setLoading(true);
    setErrorMsg("");

    const payload = {
      clinicName,
      aiTone,
      primaryLang,
      enabledPlatforms,
      waPhoneId,
      waAccId,
      waToken,
      instaUsername,
      instaToken,
      fbPageId,
      fbToken,
      catalog,
      faqs,
      bookingStrategy,
      calComUrl,
      calComApiKey,
    };

    const isMock =
      isPlaceholder ||
      (typeof document !== "undefined" &&
        document.cookie.includes("sb-mock-session=true"));

    if (isMock) {
      // Mock save to localStorage
      localStorage.setItem("zuri_onboarding_state", JSON.stringify(payload));
      document.cookie = "sb-mock-onboarded=true; path=/; max-age=86400";
      document.cookie = "sb-onboarded=true; path=/; max-age=86400";
      document.cookie =
        "sb-new-user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";

      setTimeout(() => {
        router.refresh();
        router.push("/dashboard");
      }, 1000);
      return;
    }

    try {
      // Fetch authenticated session user ID from Supabase
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Unauthenticated user");

      const response = await fetch("/api/clinics/onboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, ...payload }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to save onboarding metadata");
      }

      // Write live onboarded cookie & clear new-user cookie
      document.cookie = "sb-onboarded=true; path=/; max-age=86400";
      document.cookie = "sb-mock-onboarded=true; path=/; max-age=86400";
      document.cookie =
        "sb-new-user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";

      router.refresh();
      router.push("/dashboard");
    } catch (err: unknown) {
      setErrorMsg(
        err instanceof Error
          ? err.message
          : "An error occurred during onboarding setup.",
      );
      setLoading(false);
    }
  };

  return (
    <main
      id="onboarding-page"
      className="onboarding-page min-h-screen bg-slate-950 text-white flex flex-col items-center p-6 relative overflow-hidden font-sans"
    >
      {/* Decorative Spheres */}
      <div className="absolute top-[-10%] left-[-15%] w-[45vw] h-[45vw] bg-[#D4AF37]/5 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-15%] w-[45vw] h-[45vw] bg-teal-500/5 rounded-full blur-[120px]" />

      <div className="w-full max-w-2xl bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-8 shadow-2xl z-10 my-8">
        {/* Header progress bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider">
              Step {step} of 6
            </span>
            <span className="text-xs text-slate-400">
              Onboarding Clinic Setup
            </span>
          </div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-linear-to-r from-[#D4AF37] to-amber-500 transition-all duration-300"
              style={{ width: `${(step / 6) * 100}%` }}
            />
          </div>
        </div>

        {errorMsg && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-lg p-3.5 mb-6">
            {errorMsg}
          </div>
        )}

        {/* Step Content Modules */}
        <div className="space-y-6 min-h-87.5">
          {/* STEP 1: IDENTITY */}
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold">Clinic Identity & Profile</h2>
              <p className="text-slate-400 text-xs">
                Establish the clinical identity metadata and conversational
                personality traits.
              </p>

              <div>
                <label className="block text-slate-400 text-xs font-semibold mb-1">
                  Clinic Name
                </label>
                <input
                  type="text"
                  value={clinicName}
                  onChange={(e) => setClinicName(e.target.value)}
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-lg py-2.5 px-3.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-[#D4AF37] transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 text-xs font-semibold mb-1">
                    Primary Language
                  </label>
                  <select
                    value={primaryLang}
                    onChange={(e) => setPrimaryLang(e.target.value)}
                    className="w-full bg-slate-950/80 border border-slate-800 rounded-lg py-2.5 px-3.5 text-sm text-white focus:outline-none focus:border-[#D4AF37] transition-colors"
                  >
                    <option value="en">English (West Africa)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 text-xs font-semibold mb-1">
                    AI Tone of Voice
                  </label>
                  <select
                    value={aiTone}
                    onChange={(e) => setAiTone(e.target.value)}
                    className="w-full bg-slate-950/80 border border-slate-800 rounded-lg py-2.5 px-3.5 text-sm text-white focus:outline-none focus:border-[#D4AF37] transition-colors"
                  >
                    <option value="professional">Professional & Caring</option>
                    <option value="luxury">Luxurious & Premium</option>
                    <option value="friendly">Friendly & Welcoming</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: PLATFORM SELECTION & CREDENTIALS */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold">Platform Integrations</h2>
                <p className="text-slate-400 text-xs">
                  Select which messaging platforms to integrate and provide
                  credentials.
                </p>
              </div>

              {/* Platform Selection Cards */}
              <div className="space-y-3">
                <label className="text-slate-300 text-sm font-semibold block mb-2">
                  Select Platforms
                </label>

                {/* WhatsApp Card */}
                <div
                  className={`border rounded-xl p-4 transition-all ${
                    enabledPlatforms.includes("whatsapp")
                      ? "border-[#D4AF37] bg-[#D4AF37]/5"
                      : "border-slate-800 bg-slate-950/30"
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                        <span className="text-lg">📱</span>
                      </div>
                      <div>
                        <h3 className="font-bold text-sm">WhatsApp Business</h3>
                        <p className="text-xs text-slate-400">Meta Cloud API</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => togglePlatform("whatsapp")}
                      className={`relative w-14 h-7 rounded-full transition-colors ${
                        enabledPlatforms.includes("whatsapp")
                          ? "bg-[#D4AF37]"
                          : "bg-slate-700"
                      }`}
                    >
                      <div
                        className={`absolute top-1 left-1 w-5 h-5 rounded-full bg-white transition-transform ${
                          enabledPlatforms.includes("whatsapp")
                            ? "translate-x-7"
                            : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>

                  {enabledPlatforms.includes("whatsapp") && (
                    <div className="space-y-3 pt-3 border-t border-slate-800">
                      <div>
                        <label className="block text-slate-400 text-xs font-semibold mb-1">
                          Phone Number ID
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. 10982390192830"
                          value={waPhoneId}
                          onChange={(e) => setWaPhoneId(e.target.value)}
                          className="w-full bg-slate-950/80 border border-slate-800 rounded-lg py-2 px-3 text-xs text-white placeholder-slate-700 focus:outline-none focus:border-[#D4AF37]"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 text-xs font-semibold mb-1">
                          Business Account ID
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. 9812739012389"
                          value={waAccId}
                          onChange={(e) => setWaAccId(e.target.value)}
                          className="w-full bg-slate-950/80 border border-slate-800 rounded-lg py-2 px-3 text-xs text-white placeholder-slate-700 focus:outline-none focus:border-[#D4AF37]"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 text-xs font-semibold mb-1">
                          Access Token
                        </label>
                        <input
                          type="password"
                          placeholder="EAAGy..."
                          value={waToken}
                          onChange={(e) => setWaToken(e.target.value)}
                          className="w-full bg-slate-950/80 border border-slate-800 rounded-lg py-2 px-3 text-xs text-white placeholder-slate-700 focus:outline-none focus:border-[#D4AF37]"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Instagram Card */}
                <div
                  className={`border rounded-xl p-4 transition-all ${
                    enabledPlatforms.includes("instagram")
                      ? "border-[#D4AF37] bg-[#D4AF37]/5"
                      : "border-slate-800 bg-slate-950/30"
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-pink-500/10 flex items-center justify-center">
                        <span className="text-lg">📷</span>
                      </div>
                      <div>
                        <h3 className="font-bold text-sm">
                          Instagram Direct Messages
                        </h3>
                        <p className="text-xs text-slate-400">Meta Graph API</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => togglePlatform("instagram")}
                      className={`relative w-14 h-7 rounded-full transition-colors ${
                        enabledPlatforms.includes("instagram")
                          ? "bg-[#D4AF37]"
                          : "bg-slate-700"
                      }`}
                    >
                      <div
                        className={`absolute top-1 left-1 w-5 h-5 rounded-full bg-white transition-transform ${
                          enabledPlatforms.includes("instagram")
                            ? "translate-x-7"
                            : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>

                  {enabledPlatforms.includes("instagram") && (
                    <div className="space-y-3 pt-3 border-t border-slate-800">
                      <div>
                        <label className="block text-slate-400 text-xs font-semibold mb-1">
                          Instagram Username
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. @zuri.clinic"
                          value={instaUsername}
                          onChange={(e) => setInstaUsername(e.target.value)}
                          className="w-full bg-slate-950/80 border border-slate-800 rounded-lg py-2 px-3 text-xs text-white placeholder-slate-700 focus:outline-none focus:border-[#D4AF37]"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 text-xs font-semibold mb-1">
                          Instagram Access Token
                        </label>
                        <input
                          type="password"
                          placeholder="IGAAxxxxxxx..."
                          value={instaToken}
                          onChange={(e) => setInstaToken(e.target.value)}
                          className="w-full bg-slate-950/80 border border-slate-800 rounded-lg py-2 px-3 text-xs text-white placeholder-slate-700 focus:outline-none focus:border-[#D4AF37]"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Facebook Card */}
                <div
                  className={`border rounded-xl p-4 transition-all ${
                    enabledPlatforms.includes("facebook")
                      ? "border-[#D4AF37] bg-[#D4AF37]/5"
                      : "border-slate-800 bg-slate-950/30"
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                        <span className="text-lg">💬</span>
                      </div>
                      <div>
                        <h3 className="font-bold text-sm">
                          Facebook Messenger
                        </h3>
                        <p className="text-xs text-slate-400">
                          Meta Messenger API
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => togglePlatform("facebook")}
                      className={`relative w-14 h-7 rounded-full transition-colors ${
                        enabledPlatforms.includes("facebook")
                          ? "bg-[#D4AF37]"
                          : "bg-slate-700"
                      }`}
                    >
                      <div
                        className={`absolute top-1 left-1 w-5 h-5 rounded-full bg-white transition-transform ${
                          enabledPlatforms.includes("facebook")
                            ? "translate-x-7"
                            : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>

                  {enabledPlatforms.includes("facebook") && (
                    <div className="space-y-3 pt-3 border-t border-slate-800">
                      <div>
                        <label className="block text-slate-400 text-xs font-semibold mb-1">
                          Facebook Page ID
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. 123456789012345"
                          value={fbPageId}
                          onChange={(e) => setFbPageId(e.target.value)}
                          className="w-full bg-slate-950/80 border border-slate-800 rounded-lg py-2 px-3 text-xs text-white placeholder-slate-700 focus:outline-none focus:border-[#D4AF37]"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 text-xs font-semibold mb-1">
                          Page Access Token
                        </label>
                        <input
                          type="password"
                          placeholder="EAAGxxxxxxx..."
                          value={fbToken}
                          onChange={(e) => setFbToken(e.target.value)}
                          className="w-full bg-slate-950/80 border border-slate-800 rounded-lg py-2 px-3 text-xs text-white placeholder-slate-700 focus:outline-none focus:border-[#D4AF37]"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {enabledPlatforms.length === 0 && (
                <div className="bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs rounded-lg p-3">
                  ⚠️ Please select at least one platform to continue.
                </div>
              )}
            </div>
          )}

          {/* STEP 3: PRICING CATALOG */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold">
                    Services & Treatments Catalog
                  </h2>
                  <p className="text-slate-400 text-xs">
                    Define current clinic procedures with Naira values. Used to
                    match patient questions.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={addCatalogRow}
                  className="bg-slate-800 hover:bg-slate-700 text-xs font-bold text-[#D4AF37] py-2 px-4 rounded-lg transition-colors"
                >
                  + Add Procedure
                </button>
              </div>

              <div className="space-y-3 max-h-75 overflow-y-auto pr-1">
                {catalog.map((item, index) => (
                  <div
                    key={index}
                    className="flex flex-col md:flex-row gap-2 bg-slate-950/40 p-4 border border-slate-850 rounded-xl relative group"
                  >
                    <div className="flex-1 space-y-2">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Procedure Name"
                          value={item.name}
                          onChange={(e) =>
                            updateCatalogItem(index, "name", e.target.value)
                          }
                          className="flex-1 bg-slate-950 border border-slate-850 rounded-lg py-1.5 px-3 text-xs focus:outline-none focus:border-[#D4AF37]"
                        />
                        <input
                          type="text"
                          placeholder="Price (₦)"
                          value={item.price}
                          onChange={(e) =>
                            updateCatalogItem(index, "price", e.target.value)
                          }
                          className="w-1/3 bg-slate-950 border border-slate-850 rounded-lg py-1.5 px-3 text-xs focus:outline-none focus:border-[#D4AF37]"
                        />
                      </div>
                      <input
                        type="text"
                        placeholder="Short treatment description"
                        value={item.description}
                        onChange={(e) =>
                          updateCatalogItem(
                            index,
                            "description",
                            e.target.value,
                          )
                        }
                        className="w-full bg-slate-950 border border-slate-850 rounded-lg py-1.5 px-3 text-xs focus:outline-none focus:border-[#D4AF37]"
                      />
                    </div>
                    {catalog.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeCatalogRow(index)}
                        className="text-red-500 hover:text-red-400 text-xs font-bold self-center px-2 py-1 md:self-end"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 4: KNOWLEDGE BASE FAQ */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold">
                    Frequently Asked Questions
                  </h2>
                  <p className="text-slate-400 text-xs">
                    Seed specific FAQ questions and responses (e.g. parking,
                    recovery timeline).
                  </p>
                </div>
                <button
                  type="button"
                  onClick={addFAQRow}
                  className="bg-slate-800 hover:bg-slate-700 text-xs font-bold text-[#D4AF37] py-2 px-4 rounded-lg transition-colors"
                >
                  + Add FAQ
                </button>
              </div>

              <div className="space-y-3 max-h-75 overflow-y-auto pr-1">
                {faqs.map((faq, index) => (
                  <div
                    key={index}
                    className="space-y-2 bg-slate-950/40 p-4 border border-slate-850 rounded-xl relative"
                  >
                    <input
                      type="text"
                      placeholder="Question"
                      value={faq.question}
                      onChange={(e) =>
                        updateFAQItem(index, "question", e.target.value)
                      }
                      className="w-full bg-slate-950 border border-slate-850 rounded-lg py-2 px-3 text-xs focus:outline-none focus:border-[#D4AF37]"
                    />
                    <textarea
                      placeholder="Answer"
                      rows={2}
                      value={faq.answer}
                      onChange={(e) =>
                        updateFAQItem(index, "answer", e.target.value)
                      }
                      className="w-full bg-slate-950 border border-slate-850 rounded-lg py-2 px-3 text-xs focus:outline-none focus:border-[#D4AF37] resize-none"
                    />
                    {faqs.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeFAQRow(index)}
                        className="text-red-500 hover:text-red-400 text-xs font-bold absolute right-4 top-4"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 5: BOOKING STRATEGY */}
          {step === 5 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold">
                Appointment Scheduling Strategy
              </h2>
              <p className="text-slate-400 text-xs">
                Decide how the AI agent manages reservation confirmations when
                clients choose to book.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setBookingStrategy("callback")}
                  className={`p-5 rounded-xl border text-left flex flex-col justify-between transition-all ${bookingStrategy === "callback" ? "border-[#D4AF37] bg-[#D4AF37]/5" : "border-slate-800 bg-slate-950/30"}`}
                >
                  <span className="font-bold text-sm">
                    Receptionist Callback
                  </span>
                  <span className="text-slate-400 text-xs mt-2">
                    AI qualifies patient details and logs a booking task for
                    clinic staff call back.
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setBookingStrategy("calcom")}
                  className={`p-5 rounded-xl border text-left flex flex-col justify-between transition-all ${bookingStrategy === "calcom" ? "border-[#D4AF37] bg-[#D4AF37]/5" : "border-slate-800 bg-slate-950/30"}`}
                >
                  <span className="font-bold text-sm">
                    Automated Cal.com Scheduling
                  </span>
                  <span className="text-slate-400 text-xs mt-2">
                    AI sends a Cal.com booking link so clients register directly
                    into your calendar.
                  </span>
                </button>
              </div>

              {bookingStrategy === "calcom" && (
                <div className="space-y-4 pt-2">
                  <div>
                    <label className="block text-slate-400 text-xs font-semibold mb-1">
                      Cal.com Booking URL
                    </label>
                    <input
                      type="text"
                      placeholder="https://cal.com/zuri-clinic/consultation"
                      value={calComUrl}
                      onChange={(e) => setCalComUrl(e.target.value)}
                      className="w-full bg-slate-950/80 border border-slate-800 rounded-lg py-2.5 px-3.5 text-sm text-white placeholder-slate-700 focus:outline-none focus:border-[#D4AF37] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-xs font-semibold mb-1">
                      Cal.com Private API Key
                    </label>
                    <input
                      type="password"
                      placeholder="cal_..."
                      value={calComApiKey}
                      onChange={(e) => setCalComApiKey(e.target.value)}
                      className="w-full bg-slate-950/80 border border-slate-800 rounded-lg py-2.5 px-3.5 text-sm text-white placeholder-slate-700 focus:outline-none focus:border-[#D4AF37] transition-colors"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 6: SANDBOX PREVIEW */}
          {step === 6 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold">AI Assistant Test Sandbox</h2>
              <p className="text-slate-400 text-xs">
                Verify responsiveness, catalog matches, and scheduling outputs
                before publishing.
              </p>

              {/* Chat Simulator */}
              <div className="bg-slate-950 border border-slate-850 rounded-xl overflow-hidden flex flex-col h-70">
                <div className="bg-slate-900 px-4 py-2.5 border-b border-slate-850 flex justify-between items-center">
                  <span className="text-xs font-bold text-[#D4AF37]">
                    Zuri Clinic Simulator
                  </span>
                  <span className="text-[10px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 py-0.5 px-2 rounded-full font-mono">
                    Llama 3.3 Active
                  </span>
                </div>

                <div className="flex-1 p-4 overflow-y-auto space-y-3 scrollbar-thin scrollbar-thumb-slate-800">
                  {sandboxMessages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex ${msg.sender === "patient" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-xl p-3 text-xs leading-relaxed ${msg.sender === "patient" ? "bg-[#D4AF37] text-slate-950 font-medium" : "bg-slate-900 border border-slate-800 text-slate-200"}`}
                      >
                        {msg.text}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-2 border-t border-slate-850 flex gap-2">
                  <input
                    type="text"
                    placeholder="Ask about Botox price, parking, or booking..."
                    value={sandboxInput}
                    onChange={(e) => setSandboxInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") sendSandboxMessage();
                    }}
                    className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                  />
                  <button
                    type="button"
                    onClick={sendSandboxMessage}
                    className="bg-[#D4AF37] text-slate-950 text-xs font-bold px-4 py-2 rounded-lg"
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Wizard Navigation Footer */}
        <div className="flex justify-between items-center border-t border-slate-800 pt-6 mt-8">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="text-slate-400 hover:text-slate-200 text-sm font-semibold transition-colors"
            >
              Back
            </button>
          ) : (
            <div />
          )}

          {step < 6 ? (
            <button
              type="button"
              onClick={() => setStep(step + 1)}
              disabled={step === 2 && enabledPlatforms.length === 0}
              className="bg-slate-800 hover:bg-slate-700 text-[#D4AF37] text-sm font-bold py-2.5 px-6 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue
            </button>
          ) : (
            <button
              type="button"
              disabled={loading}
              onClick={handleOnboardingComplete}
              className="bg-linear-to-r from-[#D4AF37] to-amber-500 hover:from-amber-500 hover:to-[#D4AF37] text-slate-950 text-sm font-bold py-2.5 px-6 rounded-lg shadow-lg shadow-[#D4AF37]/5 transition-all flex items-center gap-2"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
              ) : (
                "Publish & Launch Agent"
              )}
            </button>
          )}
        </div>
      </div>
    </main>
  );
}
