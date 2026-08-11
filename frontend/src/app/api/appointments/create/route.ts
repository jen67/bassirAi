import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

/**
 * POST /api/appointments/create
 *
 * Creates a new appointment for a patient.
 *
 * @param patient_name - Patient's full name
 * @param patient_phone - Patient's phone number
 * @param procedure - Name of the procedure/service
 * @param appointment_date - ISO date string for the appointment
 * @param notes - Optional notes about the appointment
 * @param conversation_id - Optional conversation ID if booking from chat
 *
 * @returns { appointmentId: string, success: true }
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
    const {
      patient_name,
      patient_phone,
      procedure,
      appointment_date,
      notes,
      conversation_id,
    } = await request.json();

    // Validate required fields
    if (!patient_name || !patient_phone || !procedure || !appointment_date) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: patient_name, patient_phone, procedure, appointment_date",
        },
        { status: 400 },
      );
    }

    // Input validation
    if (patient_name.length < 2 || patient_name.length > 100) {
      return NextResponse.json(
        { error: "Patient name must be between 2 and 100 characters" },
        { status: 400 },
      );
    }

    // Validate phone format (E.164)
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    if (!phoneRegex.test(patient_phone.replace(/[\s-]/g, ""))) {
      return NextResponse.json(
        {
          error:
            "Invalid phone number format. Use international format (e.g., +2348012345678)",
        },
        { status: 400 },
      );
    }

    if (procedure.length < 3 || procedure.length > 200) {
      return NextResponse.json(
        { error: "Procedure must be between 3 and 200 characters" },
        { status: 400 },
      );
    }

    // Validate date format and ensure it's in the future
    const appointmentDateTime = new Date(appointment_date);
    if (isNaN(appointmentDateTime.getTime())) {
      return NextResponse.json(
        { error: "Invalid appointment date format" },
        { status: 400 },
      );
    }

    if (appointmentDateTime < new Date()) {
      return NextResponse.json(
        { error: "Appointment date cannot be in the past" },
        { status: 400 },
      );
    }

    if (notes && notes.length > 1000) {
      return NextResponse.json(
        { error: "Notes must be less than 1000 characters" },
        { status: 400 },
      );
    }

    console.log("Creating appointment:", {
      clinicId,
      patient_name,
      patient_phone,
      procedure,
      appointment_date,
    });

    // Insert appointment
    const { data, error } = await supabase
      .from("appointments")
      .insert({
        clinic_id: clinicId,
        conversation_id: conversation_id || null,
        patient_name,
        patient_phone,
        procedure,
        appointment_date,
        status: "pending",
        notes: notes || null,
      })
      .select()
      .single();

    if (error) {
      console.error("Failed to create appointment:", error);

      // Check for specific errors
      if (error.code === "23503") {
        return NextResponse.json(
          {
            error:
              "Invalid clinic or conversation ID. Please refresh and try again.",
          },
          { status: 400 },
        );
      }

      throw error;
    }

    console.log("Appointment created successfully:", data.id);

    // Optionally update conversation status to 'booked'
    if (conversation_id) {
      await supabase
        .from("conversations")
        .update({ status: "booked" })
        .eq("id", conversation_id);
    }

    return NextResponse.json({
      appointmentId: data.id,
      appointment: data,
      success: true,
      message: "Appointment created successfully",
    });
  } catch (err: unknown) {
    console.error("Create appointment error:", err);
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "Failed to create appointment",
      },
      { status: 500 },
    );
  }
}
