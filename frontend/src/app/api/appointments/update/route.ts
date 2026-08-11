import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

/**
 * POST /api/appointments/update
 *
 * Updates an existing appointment's status or details.
 *
 * @param id - Appointment ID (required)
 * @param status - New status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
 * @param notes - Updated notes (optional)
 * @param appointment_date - Updated date (optional)
 *
 * @returns { success: true }
 */
export async function POST(request: Request) {
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

    // Parse request body
    const { id, status, notes, appointment_date } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: "Appointment ID is required" },
        { status: 400 },
      );
    }

    // Validate UUID format
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return NextResponse.json(
        { error: "Invalid appointment ID format" },
        { status: 400 },
      );
    }

    console.log("Updating appointment:", {
      id,
      status,
      notes,
      appointment_date,
    });

    // Build update object
    const updates: Record<string, unknown> = {};

    if (status) {
      // Validate status
      if (
        !["pending", "confirmed", "completed", "cancelled"].includes(status)
      ) {
        return NextResponse.json({ error: "Invalid status" }, { status: 400 });
      }
      updates.status = status;
    }

    if (notes !== undefined) {
      if (notes && notes.length > 1000) {
        return NextResponse.json(
          { error: "Notes must be less than 1000 characters" },
          { status: 400 },
        );
      }
      updates.notes = notes;
    }

    if (appointment_date) {
      const appointmentDateTime = new Date(appointment_date);
      if (isNaN(appointmentDateTime.getTime())) {
        return NextResponse.json(
          { error: "Invalid appointment date format" },
          { status: 400 },
        );
      }
      updates.appointment_date = appointment_date;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: "No fields to update" },
        { status: 400 },
      );
    }

    // Update appointment (ensure it belongs to user's clinic)
    const { data, error } = await supabase
      .from("appointments")
      .update(updates)
      .eq("id", id)
      .eq("clinic_id", clinicId)
      .select()
      .single();

    if (error) {
      console.error("Failed to update appointment:", error);

      if (error.code === "PGRST116") {
        return NextResponse.json(
          {
            error:
              "Appointment not found or you don't have permission to update it",
          },
          { status: 404 },
        );
      }

      throw error;
    }

    console.log("Appointment updated successfully:", data.id);

    return NextResponse.json({
      appointment: data,
      success: true,
      message: "Appointment updated successfully",
    });
  } catch (err: unknown) {
    console.error("Update appointment error:", err);
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "Failed to update appointment",
      },
      { status: 500 },
    );
  }
}
