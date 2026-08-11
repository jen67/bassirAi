import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

/**
 * GET /api/appointments/list
 *
 * Fetches all appointments for the authenticated user's clinic.
 * Supports optional filtering by status and date range.
 *
 * Query params:
 * - status: 'pending' | 'confirmed' | 'completed' | 'cancelled' (optional)
 * - from_date: ISO date string (optional)
 * - to_date: ISO date string (optional)
 *
 * @returns Array of appointments with patient and appointment details
 */
export async function GET(request: Request) {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's clinic_id
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("clinic_id")
      .eq("id", user.id)
      .single();

    if (userError || !userData) {
      console.error("Failed to fetch user clinic:", userError);
      return NextResponse.json(
        { error: "User clinic not found" },
        { status: 404 },
      );
    }

    const clinicId = userData.clinic_id;

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const fromDate = searchParams.get("from_date");
    const toDate = searchParams.get("to_date");

    // Build query
    let query = supabase
      .from("appointments")
      .select("*")
      .eq("clinic_id", clinicId)
      .order("appointment_date", { ascending: true });

    // Apply filters
    if (status && status !== "all") {
      query = query.eq("status", status);
    }

    if (fromDate) {
      query = query.gte("appointment_date", fromDate);
    }

    if (toDate) {
      query = query.lte("appointment_date", toDate);
    }

    const { data: appointments, error: appointmentsError } = await query;

    if (appointmentsError) {
      console.error("Failed to fetch appointments:", appointmentsError);
      throw appointmentsError;
    }

    return NextResponse.json({
      appointments: appointments || [],
      success: true,
    });
  } catch (err: unknown) {
    console.error("Appointments list error:", err);
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "Failed to fetch appointments",
      },
      { status: 500 },
    );
  }
}
