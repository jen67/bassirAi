import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

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
      return NextResponse.json(
        { error: "User clinic not found" },
        { status: 404 },
      );
    }

    const clinicId = userData.clinic_id;

    const { phone, takeover } = await request.json();

    if (!phone) {
      return NextResponse.json(
        { error: "Missing patient phone parameter" },
        { status: 400 },
      );
    }

    // Validate phone format (basic E.164 check)
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    if (!phoneRegex.test(phone.replace(/[\s-]/g, ""))) {
      return NextResponse.json(
        { error: "Invalid phone number format" },
        { status: 400 },
      );
    }

    // Update the is_human_takeover status - ONLY for this clinic's conversations
    const { error } = await supabase
      .from("conversations")
      .update({ is_human_takeover: !!takeover })
      .eq("patient_phone", phone)
      .eq("clinic_id", clinicId); // CRITICAL: Enforce multi-tenancy

    if (error) {
      console.error("Toggle takeover error:", error);
      return NextResponse.json(
        { error: "Failed to update conversation" },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true, is_human_takeover: !!takeover });
  } catch (err: unknown) {
    console.error("Toggle takeover error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
