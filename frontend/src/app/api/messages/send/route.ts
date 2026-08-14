import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

/**
 * POST /api/messages/send
 *
 * Sends a manual message from inbox (human takeover mode).
 * This is called when a receptionist types and sends a message.
 *
 * @param conversation_id - Conversation UUID
 * @param message - Message content
 *
 * @returns { success: true, message_id }
 */
export async function POST(request: Request) {
  try {
    const { conversation_id, message } = await request.json();

    if (!conversation_id || !message) {
      return NextResponse.json(
        { error: "Missing required fields: conversation_id, message" },
        { status: 400 },
      );
    }

    // Validate message length
    if (message.trim().length === 0) {
      return NextResponse.json(
        { error: "Message cannot be empty" },
        { status: 400 },
      );
    }

    if (message.length > 4096) {
      return NextResponse.json(
        { error: "Message too long (max 4096 characters)" },
        { status: 400 },
      );
    }

    const supabase = await createClient();

    // Get authenticated user
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

    // Get conversation and verify it belongs to this clinic
    const { data: conversation, error: convError } = await supabase
      .from("conversations")
      .select("*")
      .eq("id", conversation_id)
      .eq("clinic_id", clinicId) // Security check
      .single();

    if (convError || !conversation) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 },
      );
    }

    // Verify human takeover is enabled
    if (!conversation.is_human_takeover) {
      return NextResponse.json(
        {
          error:
            "Human takeover not enabled. Toggle AI mode off before sending manual messages.",
        },
        { status: 400 },
      );
    }

    // Insert message
    const { data: savedMessage, error: messageError } = await supabase
      .from("messages")
      .insert({
        clinic_id: clinicId,
        conversation_id,
        content: message.trim(),
        direction: "outbound",
        is_ai_generated: false,
      })
      .select()
      .single();

    if (messageError) {
      console.error("Error saving message:", messageError);
      throw messageError;
    }

    // Update conversation last_message_at
    const { error: updateError } = await supabase
      .from("conversations")
      .update({ last_message_at: new Date().toISOString() })
      .eq("id", conversation_id);

    if (updateError) {
      console.error("Error updating conversation:", updateError);
    }

    // Forward to n8n for actual delivery via WhatsApp/Instagram/Facebook
    const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL;

    if (n8nWebhookUrl) {
      // Call outgoing webhook endpoint
      try {
        await fetch(
          `${request.url.replace("/api/messages/send", "/api/webhooks/n8n-outgoing")}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Cookie: request.headers.get("cookie") || "",
            },
            body: JSON.stringify({
              conversation_id,
              message: message.trim(),
              channel: conversation.channel,
            }),
          },
        );
      } catch (err) {
        console.error("Failed to forward to n8n:", err);
        // Don't fail the request - message is saved
      }
    }

    return NextResponse.json({
      success: true,
      message_id: savedMessage.id,
      message: "Message sent successfully",
    });
  } catch (err: unknown) {
    console.error("Send message error:", err);
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : "Failed to send message",
      },
      { status: 500 },
    );
  }
}
