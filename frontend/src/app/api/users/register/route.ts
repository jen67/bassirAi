import { NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";

/**
 * POST /api/users/register
 *
 * Creates a user record in the public.users table after Supabase Auth signup.
 * Links the auth user to their clinic and assigns a role.
 *
 * @param userId - Supabase auth.users.id (from signup response)
 * @param clinicId - The clinic this user belongs to
 * @param email - User's email address
 * @param fullName - User's full name
 * @param role - 'clinic_admin' or 'receptionist'
 * @returns { success: true }
 */
export async function POST(request: Request) {
  try {
    const { userId, clinicId, email, fullName, role } = await request.json();

    console.log("User registration request:", {
      userId,
      clinicId,
      email,
      fullName,
      role,
    });

    if (!userId || !clinicId || !email || !fullName || !role) {
      console.error("Missing required fields:", {
        userId,
        clinicId,
        email,
        fullName,
        role,
      });
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Validate UUID formats
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(userId)) {
      return NextResponse.json(
        { error: "Invalid user ID format" },
        { status: 400 },
      );
    }

    if (!uuidRegex.test(clinicId)) {
      return NextResponse.json(
        { error: "Invalid clinic ID format" },
        { status: 400 },
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 },
      );
    }

    // Validate full name
    if (fullName.length < 2 || fullName.length > 100) {
      return NextResponse.json(
        { error: "Full name must be between 2 and 100 characters" },
        { status: 400 },
      );
    }

    // Validate role
    if (!["clinic_admin", "receptionist"].includes(role)) {
      console.error("Invalid role provided:", role);
      return NextResponse.json(
        { error: "Invalid role. Must be clinic_admin or receptionist" },
        { status: 400 },
      );
    }

    const supabase = createAdminClient();

    console.log("Attempting to insert user into database...");

    // Insert user record into public.users table
    const { error } = await supabase.from("users").insert({
      id: userId,
      clinic_id: clinicId,
      email,
      full_name: fullName,
      role,
      is_active: true,
    });

    if (error) {
      console.error("Supabase user insert error:", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      });

      // Provide helpful error messages
      if (error.code === "23505") {
        return NextResponse.json(
          { error: "User profile already exists in the database." },
          { status: 409 },
        );
      }

      if (error.code === "23503") {
        return NextResponse.json(
          {
            error:
              "The clinic ID does not exist. Please create the clinic first.",
          },
          { status: 400 },
        );
      }

      throw error;
    }

    console.log("User profile created successfully for user ID:", userId);

    return NextResponse.json({
      success: true,
      message: "User profile linked to database successfully",
    });
  } catch (err: unknown) {
    console.error("User registration error:", err);

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
      { error: "Failed to create user profile" },
      { status: 500 },
    );
  }
}
