import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

/**
 * POST /api/clinics/onboard
 *
 * Updates clinic settings including:
 * - Basic clinic info (name, AI tone, language)
 * - Catalog (treatments & prices)
 * - FAQs
 * - WhatsApp credentials
 * - Booking strategy
 *
 * This endpoint updates BOTH the clinics table AND clinic_customizations table.
 */
export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const {
      userId,
      clinicName,
      aiTone,
      primaryLang,
      waPhoneId,
      catalog,
      faqs,
      bookingStrategy,
    } = payload;

    if (!userId) {
      return NextResponse.json(
        { error: "Missing userId parameter" },
        { status: 400 },
      );
    }

    // Validate UUID format
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(userId)) {
      return NextResponse.json(
        { error: "Invalid user ID format" },
        { status: 400 },
      );
    }

    // Validate clinic name if provided
    if (clinicName && (clinicName.length < 2 || clinicName.length > 200)) {
      return NextResponse.json(
        { error: "Clinic name must be between 2 and 200 characters" },
        { status: 400 },
      );
    }

    // Validate tone
    const validTones = ["professional", "friendly", "casual", "formal"];
    if (aiTone && !validTones.includes(aiTone)) {
      return NextResponse.json(
        {
          error:
            "Invalid AI tone. Must be: professional, friendly, casual, or formal",
        },
        { status: 400 },
      );
    }

    // Validate phone format if provided
    if (waPhoneId) {
      const phoneRegex = /^\+?[1-9]\d{1,14}$/;
      if (!phoneRegex.test(waPhoneId.replace(/[\s-]/g, ""))) {
        return NextResponse.json(
          { error: "Invalid WhatsApp phone number format" },
          { status: 400 },
        );
      }
    }

    // Validate catalog is an array if provided
    if (catalog && !Array.isArray(catalog)) {
      return NextResponse.json(
        { error: "Catalog must be an array" },
        { status: 400 },
      );
    }

    // Validate FAQs is an array if provided
    if (faqs && !Array.isArray(faqs)) {
      return NextResponse.json(
        { error: "FAQs must be an array" },
        { status: 400 },
      );
    }

    const supabase = await createClient();

    // Get user's clinic_id from auth metadata or users table
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("clinic_id")
      .eq("id", userId)
      .single();

    if (userError || !userData) {
      return NextResponse.json(
        { error: "User not found or not linked to a clinic" },
        { status: 404 },
      );
    }

    const clinicId = userData.clinic_id;

    // Update clinic basic info
    const { error: clinicError } = await supabase
      .from("clinics")
      .update({
        name: clinicName,
        tone_of_voice: aiTone,
        whatsapp_number: waPhoneId || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", clinicId);

    if (clinicError) {
      throw clinicError;
    }

    // Upsert clinic_customizations (catalog, FAQs, etc.)
    const { error: customError } = await supabase
      .from("clinic_customizations")
      .upsert(
        {
          clinic_id: clinicId,
          catalog: catalog || [],
          faqs: faqs || [],
          custom_prompt: `You are a helpful AI assistant for ${clinicName}. 
Tone: ${aiTone}. 
Language: ${primaryLang}. 
Booking strategy: ${bookingStrategy}.`,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "clinic_id",
        },
      );

    if (customError) {
      throw customError;
    }

    return NextResponse.json({
      success: true,
      message: "Clinic settings updated successfully",
    });
  } catch (err: unknown) {
    console.error("Onboarding error:", err);
    return NextResponse.json(
      {
        error:
          err instanceof Error
            ? err.message
            : "Failed to update clinic settings",
      },
      { status: 500 },
    );
  }
}

/**
 * GET /api/clinics/onboard
 *
 * Retrieves clinic settings and customizations including catalog, FAQs, and WhatsApp settings.
 */
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "Missing userId parameter" },
        { status: 400 },
      );
    }

    const supabase = await createClient();

    // 1. Get user's clinic_id
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("clinic_id")
      .eq("id", userId)
      .single();

    if (userError || !userData) {
      return NextResponse.json(
        { error: "User not found or not linked to a clinic" },
        { status: 404 },
      );
    }

    const clinicId = userData.clinic_id;

    // 2. Fetch clinic info
    const { data: clinic, error: clinicError } = await supabase
      .from("clinics")
      .select("*")
      .eq("id", clinicId)
      .single();

    if (clinicError || !clinic) {
      return NextResponse.json(
        { error: "Clinic not found" },
        { status: 404 },
      );
    }

    // 3. Fetch customizations
    const { data: customizations } = await supabase
      .from("clinic_customizations")
      .select("*")
      .eq("clinic_id", clinicId)
      .maybeSingle();

    return NextResponse.json({
      success: true,
      clinicName: clinic.name,
      aiTone: clinic.tone_of_voice || "professional",
      primaryLang: "en",
      waPhoneId: clinic.whatsapp_number || "",
      catalog: customizations?.catalog || [],
      faqs: customizations?.faqs || [],
      bookingStrategy: "callback",
      calComUrl: "",
      calComApiKey: ""
    });
  } catch (err: unknown) {
    console.error("Fetch settings error:", err);
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "Failed to load settings",
      },
      { status: 500 },
    );
  }
}
