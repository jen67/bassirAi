import { NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";

/**
 * POST /api/clinics/register
 *
 * Creates a new clinic record in the database.
 * This is called during the registration flow BEFORE the user signs up.
 *
 * @param clinicName - Name of the clinic (e.g., "Zuri Aesthetic Clinic")
 * @param adminEmail - Email of the admin user
 * @returns { clinicId: string, success: true }
 */
export async function POST(request: Request) {
  try {
    const { clinicName, adminEmail } = await request.json();

    if (!clinicName || !adminEmail) {
      console.error(
        "Missing fields - clinicName:",
        clinicName,
        "adminEmail:",
        adminEmail,
      );
      return NextResponse.json(
        { error: "Missing required fields: clinicName and adminEmail" },
        { status: 400 },
      );
    }

    // Validate clinic name
    if (clinicName.length < 2 || clinicName.length > 200) {
      return NextResponse.json(
        { error: "Clinic name must be between 2 and 200 characters" },
        { status: 400 },
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(adminEmail)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 },
      );
    }

    const supabase = createAdminClient();

    // Log the connection attempt
    console.log("Attempting to connect to Supabase and create clinic...");

    // Insert new clinic record
    const { data, error } = await supabase
      .from("clinics")
      .insert({
        name: clinicName,
        email: adminEmail,
        ai_mode: true,
        tone_of_voice: "professional",
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      console.error("Supabase insert error:", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      });

      // Return more specific error messages
      if (error.code === "23505") {
        return NextResponse.json(
          {
            error:
              "A clinic with this email already exists. Please use a different email or sign in instead.",
          },
          { status: 409 },
        );
      }

      if (
        error.message?.includes("relation") &&
        error.message?.includes("does not exist")
      ) {
        return NextResponse.json(
          {
            error:
              "Database table not found. Please run the database schema setup first.",
          },
          { status: 500 },
        );
      }

      throw error;
    }

    console.log("Clinic created successfully with ID:", data.id);

    return NextResponse.json({
      clinicId: data.id,
      success: true,
      message: "Clinic profile created successfully",
    });
  } catch (err: unknown) {
    console.error("Clinic registration error:", err);

    if (err instanceof Error) {
      return NextResponse.json(
        {
          error: err.message,
          debug: "Check server console for detailed error logs",
        },
        { status: 500 },
      );
    }

    return NextResponse.json(
      { error: "Failed to create clinic profile" },
      { status: 500 },
    );
  }
}
