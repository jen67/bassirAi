"use client";

import { useState, useEffect } from "react";
import SidebarLayout from "@/components/SidebarLayout";
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

export default function SettingsPage() {
  const supabase = createClient();
  const auth = supabase.auth;
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Form states
  const [clinicName, setClinicName] = useState("Zuri Aesthetic Clinic");
  const [aiTone, setAiTone] = useState("professional");
  const [primaryLang, setPrimaryLang] = useState("en");

  // Platform selection states
  const [enabledPlatforms, setEnabledPlatforms] = useState<string[]>([]);

  // Platform credentials
  const [waPhoneId, setWaPhoneId] = useState("");
  const [waAccId, setWaAccId] = useState("");
  const [waToken, setWaToken] = useState("");

  const [instaUsername, setInstaUsername] = useState("");
  const [instaToken, setInstaToken] = useState("");

  const [fbPageId, setFbPageId] = useState("");
  const [fbToken, setFbToken] = useState("");

  const [catalog, setCatalog] = useState<CatalogItem[]>([]);
  const [faqs, setFaqs] = useState<FAQItem[]>([]);

  const [bookingStrategy, setBookingStrategy] = useState<"calcom" | "callback">(
    "callback",
  );
  const [calComUrl, setCalComUrl] = useState("");
  const [calComApiKey, setCalComApiKey] = useState("");

  const [isPlaceholder, setIsPlaceholder] = useState(true);

  // Platform toggle handler
  const togglePlatform = (platform: string) => {
    if (enabledPlatforms.includes(platform)) {
      setEnabledPlatforms(enabledPlatforms.filter((p) => p !== platform));
    } else {
      setEnabledPlatforms([...enabledPlatforms, platform]);
    }
  };

  // Load current settings from localStorage or live API
  useEffect(() => {
    const loadSettings = async () => {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const placeholder = !!(
        url?.includes("your-project") || url?.includes("placeholder")
      );
      setIsPlaceholder(placeholder);

      if (placeholder) {
        const stored = localStorage.getItem("zuri_onboarding_state");
        if (stored) {
          try {
            const data = JSON.parse(stored);
            setClinicName(data.clinicName || "Zuri Aesthetic Clinic");
            setAiTone(data.aiTone || "professional");
            setPrimaryLang(data.primaryLang || "en");
            setEnabledPlatforms(data.enabledPlatforms || []);
            setWaPhoneId(data.waPhoneId || "");
            setWaAccId(data.waAccId || "");
            setWaToken(data.waToken || "");
            setInstaUsername(data.instaUsername || "");
            setInstaToken(data.instaToken || "");
            setFbPageId(data.fbPageId || "");
            setFbToken(data.fbToken || "");
            setCatalog(data.catalog || []);
            setFaqs(data.faqs || []);
            setBookingStrategy(data.bookingStrategy || "callback");
            setCalComUrl(data.calComUrl || "");
            setCalComApiKey(data.calComApiKey || "");
          } catch (e) {
            console.error("Failed to parse local settings", e);
          }
        }
      } else {
        // Fetch from database in live mode
        try {
          const {
            data: { user },
          } = await auth.getUser();
          if (!user) return;

          // Load clinic details and customizations from database
          const response = await fetch(
            "/api/clinics/onboard?userId=" + user.id,
          );
          if (response.ok) {
            const data = await response.json();
            setClinicName(data.clinicName || "");
            setAiTone(data.aiTone || "professional");
            setPrimaryLang(data.primaryLang || "en");
            setWaPhoneId(data.waPhoneId || "");
            setCatalog(data.catalog || []);
            setFaqs(data.faqs || []);
            setBookingStrategy(data.bookingStrategy || "callback");
            setCalComUrl(data.calComUrl || "");
            setCalComApiKey(data.calComApiKey || "");
          }
        } catch (e) {
          console.error("Failed to load clinic settings:", e);
        }
      }
    };
    loadSettings();
  }, [auth]);

  // Catalog update triggers
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

  // FAQ update triggers
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

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

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

    if (isPlaceholder) {
      localStorage.setItem("zuri_onboarding_state", JSON.stringify(payload));
      setSuccessMsg("Settings saved successfully (Local Mock Mode).");
      setLoading(false);
      return;
    }

    try {
      const {
        data: { user },
      } = await auth.getUser();
      if (!user) throw new Error("Unauthenticated session");

      const response = await fetch("/api/clinics/onboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, ...payload }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update configurations");
      }

      setSuccessMsg("Settings updated successfully in database.");
    } catch (err: unknown) {
      setErrorMsg(
        err instanceof Error ? err.message : "Failed to save changes.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SidebarLayout>
      <div id="settings-page" className="settings-page max-w-3xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight bg-linear-to-r from-white to-slate-300 bg-clip-text text-transparent">
            System Settings
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Configure your AI conversational assistant parameters, prices, and
            API connection nodes.
          </p>
        </div>

        {errorMsg && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-lg p-3.5">
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-lg p-3.5">
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSaveSettings} className="space-y-6">
          {/* Section 1: Clinic Profile */}
          <div className="bg-slate-900/40 border border-slate-900/60 p-6 rounded-2xl space-y-4">
            <h3 className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider">
              Clinic Metadata
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-400 text-xs font-semibold mb-1">
                  Clinic Name
                </label>
                <input
                  type="text"
                  value={clinicName}
                  onChange={(e) => setClinicName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded-lg py-2 px-3.5 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                />
              </div>
              <div>
                <label className="block text-slate-400 text-xs font-semibold mb-1">
                  AI Tone of Voice
                </label>
                <select
                  value={aiTone}
                  onChange={(e) => setAiTone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded-lg py-2 px-3.5 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                >
                  <option value="professional">Professional & Caring</option>
                  <option value="luxury">Luxurious & Premium</option>
                  <option value="friendly">Friendly & Welcoming</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 4: Platform Integrations */}
          <div className="bg-slate-900/40 border border-slate-900/60 p-6 rounded-2xl space-y-4">
            <h3 className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider">
              Platform Integrations
            </h3>

            <div className="space-y-3">
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
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                      <span className="text-base">📱</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-sm">WhatsApp Business</h4>
                      <p className="text-[10px] text-slate-400">
                        Meta Cloud API
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => togglePlatform("whatsapp")}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      enabledPlatforms.includes("whatsapp")
                        ? "bg-[#D4AF37]"
                        : "bg-slate-700"
                    }`}
                  >
                    <div
                      className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                        enabledPlatforms.includes("whatsapp")
                          ? "translate-x-6"
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
                        value={waPhoneId}
                        onChange={(e) => setWaPhoneId(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-850 rounded-lg py-2 px-3 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 text-xs font-semibold mb-1">
                        Business Account ID
                      </label>
                      <input
                        type="text"
                        value={waAccId}
                        onChange={(e) => setWaAccId(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-850 rounded-lg py-2 px-3 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 text-xs font-semibold mb-1">
                        Access Token
                      </label>
                      <input
                        type="password"
                        value={waToken}
                        onChange={(e) => setWaToken(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-850 rounded-lg py-2 px-3 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
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
                    <div className="w-8 h-8 rounded-lg bg-pink-500/10 flex items-center justify-center">
                      <span className="text-base">📷</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-sm">Instagram DM</h4>
                      <p className="text-[10px] text-slate-400">
                        Meta Graph API
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => togglePlatform("instagram")}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      enabledPlatforms.includes("instagram")
                        ? "bg-[#D4AF37]"
                        : "bg-slate-700"
                    }`}
                  >
                    <div
                      className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                        enabledPlatforms.includes("instagram")
                          ? "translate-x-6"
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
                        value={instaUsername}
                        onChange={(e) => setInstaUsername(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-850 rounded-lg py-2 px-3 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 text-xs font-semibold mb-1">
                        Access Token
                      </label>
                      <input
                        type="password"
                        value={instaToken}
                        onChange={(e) => setInstaToken(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-850 rounded-lg py-2 px-3 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
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
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                      <span className="text-base">💬</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-sm">Facebook Messenger</h4>
                      <p className="text-[10px] text-slate-400">
                        Messenger API
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => togglePlatform("facebook")}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      enabledPlatforms.includes("facebook")
                        ? "bg-[#D4AF37]"
                        : "bg-slate-700"
                    }`}
                  >
                    <div
                      className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                        enabledPlatforms.includes("facebook")
                          ? "translate-x-6"
                          : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                {enabledPlatforms.includes("facebook") && (
                  <div className="space-y-3 pt-3 border-t border-slate-800">
                    <div>
                      <label className="block text-slate-400 text-xs font-semibold mb-1">
                        Page ID
                      </label>
                      <input
                        type="text"
                        value={fbPageId}
                        onChange={(e) => setFbPageId(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-850 rounded-lg py-2 px-3 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 text-xs font-semibold mb-1">
                        Page Access Token
                      </label>
                      <input
                        type="password"
                        value={fbToken}
                        onChange={(e) => setFbToken(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-850 rounded-lg py-2 px-3 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Section 5: Services Catalog */}
          <div className="bg-slate-900/40 border border-slate-900/60 p-6 rounded-2xl space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider">
                Treatments Catalog
              </h3>
              <button
                type="button"
                onClick={addCatalogRow}
                className="bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 text-[#D4AF37] text-[10px] font-bold px-3 py-1.5 rounded-lg border border-[#D4AF37]/20 transition-all"
              >
                + Add Service
              </button>
            </div>

            <div className="space-y-3 max-h-62.5 overflow-y-auto pr-1">
              {catalog.map((item, index) => (
                <div
                  key={index}
                  className="flex gap-2 items-center bg-slate-950/40 p-3 border border-slate-850 rounded-xl relative group"
                >
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-2">
                    <input
                      type="text"
                      placeholder="Treatment Name"
                      value={item.name}
                      onChange={(e) =>
                        updateCatalogItem(index, "name", e.target.value)
                      }
                      className="bg-slate-950 border border-slate-850 rounded-lg py-1.5 px-3 text-xs focus:outline-none focus:border-[#D4AF37]"
                    />
                    <input
                      type="text"
                      placeholder="Price"
                      value={item.price}
                      onChange={(e) =>
                        updateCatalogItem(index, "price", e.target.value)
                      }
                      className="bg-slate-950 border border-slate-850 rounded-lg py-1.5 px-3 text-xs focus:outline-none focus:border-[#D4AF37]"
                    />
                    <input
                      type="text"
                      placeholder="Description"
                      value={item.description}
                      onChange={(e) =>
                        updateCatalogItem(index, "description", e.target.value)
                      }
                      className="bg-slate-950 border border-slate-850 rounded-lg py-1.5 px-3 text-xs focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeCatalogRow(index)}
                    className="text-red-500 hover:text-red-400 text-xs font-bold px-2 py-1"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Section 6: FAQs */}
          <div className="bg-slate-900/40 border border-slate-900/60 p-6 rounded-2xl space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider">
                Frequently Asked Questions
              </h3>
              <button
                type="button"
                onClick={addFAQRow}
                className="bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 text-[#D4AF37] text-[10px] font-bold px-3 py-1.5 rounded-lg border border-[#D4AF37]/20 transition-all"
              >
                + Add FAQ
              </button>
            </div>

            <div className="space-y-3 max-h-62.5 overflow-y-auto pr-1">
              {faqs.map((faq, index) => (
                <div
                  key={index}
                  className="space-y-2 bg-slate-950/40 p-3 border border-slate-850 rounded-xl relative"
                >
                  <input
                    type="text"
                    placeholder="Question"
                    value={faq.question}
                    onChange={(e) =>
                      updateFAQItem(index, "question", e.target.value)
                    }
                    className="w-full bg-slate-950 border border-slate-850 rounded-lg py-1.5 px-3 text-xs focus:outline-none focus:border-[#D4AF37]"
                  />
                  <textarea
                    placeholder="Answer"
                    rows={2}
                    value={faq.answer}
                    onChange={(e) =>
                      updateFAQItem(index, "answer", e.target.value)
                    }
                    className="w-full bg-slate-950 border border-slate-850 rounded-lg py-1.5 px-3 text-xs focus:outline-none focus:border-[#D4AF37] resize-none"
                  />
                  <button
                    type="button"
                    onClick={() => removeFAQRow(index)}
                    className="text-red-500 hover:text-red-400 text-xs font-bold absolute right-3 top-3"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Save Action */}
          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={loading}
              className="bg-linear-to-r from-[#D4AF37] to-amber-500 hover:from-amber-500 hover:to-[#D4AF37] text-slate-950 text-xs font-bold py-3 px-8 rounded-lg shadow-lg shadow-[#D4AF37]/5 transition-all duration-200"
            >
              {loading ? "Saving Changes..." : "Save Settings"}
            </button>
          </div>
        </form>
      </div>
    </SidebarLayout>
  );
}
