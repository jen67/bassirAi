import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

/**
 * POST /api/webhooks/n8n-outgoing
 *
 * Triggered when a receptionist sends a manual message from the inbox.
 * This endpoint forwards the message to n8n, which then sends it via WhatsApp/Instagram/Facebook.
 *
 * @param conversation_id - Conversation UUID
 * @param message - Message content to send
 * @param channel - Destination channel (whatsapp, instagram, facebook)
 *
 * @returns { success: true, n8n_response }
 */
export async function POST(request: Request) {
  try {
    const { conversation_id, message, channel } = await request.json();

    // Validate required fields
    if (!conversation_id || !message || !channel) {
      return NextResponse.json(
        {
          error: "Missing required fields: conversation_id, message, channel",
        },
        { status: 400 },
      );
    }

    // Validate channel
    const validChannels = ["whatsapp", "instagram", "facebook"];
    if (!validChannels.includes(channel)) {
      return NextResponse.json(
        {
          error: "Invalid channel. Must be: whatsapp, instagram, or facebook",
        },
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

    // Get conversation details
    const { data: conversation, error: convError } = await supabase
      .from("conversations")
      .select("*")
      .eq("id", conversation_id)
      .eq("clinic_id", clinicId) // Security: enforce clinic isolation
      .single();

    if (convError || !conversation) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 },
      );
    }

    // Get clinic details for n8n
    const { data: clinic, error: clinicError } = await supabase
      .from("clinics")
      .select("*")
      .eq("id", clinicId)
      .single();

    if (clinicError || !clinic) {
      return NextResponse.json({ error: "Clinic not found" }, { status: 404 });
    }

    // Save message to database first
    const { data: savedMessage, error: messageError } = await supabase
      .from("messages")
      .insert({
        clinic_id: clinicId,
        conversation_id,
        content: message,
        direction: "outbound",
        is_ai_generated: false, // Human-sent message
      })
      .select()
      .single();

    if (messageError) {
      console.error("Error saving message:", messageError);
      throw messageError;
    }

    // Update conversation last_message_at
    await supabase
      .from("conversations")
      .update({ last_message_at: new Date().toISOString() })
      .eq("id", conversation_id);

    // Forward to n8n for delivery (if n8n webhook URL is configured)
    const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL;

    if (n8nWebhookUrl) {
      try {
        const n8nPayload = {
          action: "send_message",
          channel,
          patient_phone: conversation.patient_phone,
          message,
          clinic_id: clinicId,
          // Add platform-specific credentials
          credentials: {
            whatsapp_token:
              channel === "whatsapp" ? clinic.whatsapp_token : null,
            whatsapp_phone_id:
              channel === "whatsapp" ? clinic.whatsapp_phone_id : null,
            instagram_token:
              channel === "instagram" ? clinic.instagram_access_token : null,
            facebook_token:
              channel === "facebook" ? clinic.facebook_access_token : null,
          },
        };

        const n8nResponse = await fetch(n8nWebhookUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(n8nPayload),
        });

        if (!n8nResponse.ok) {
          console.error(
            "n8n webhook failed:",
            n8nResponse.status,
            await n8nResponse.text(),
          );
          // Don't throw - message is already saved
        }

        const n8nData = await n8nResponse.json();

        return NextResponse.json({
          success: true,
          message_id: savedMessage.id,
          n8n_response: n8nData,
          delivery_status: "sent_to_n8n",
        });
      } catch (n8nError) {
        console.error("n8n delivery error:", n8nError);
        // Message is saved, just n8n delivery failed
        return NextResponse.json({
          success: true,
          message_id: savedMessage.id,
          delivery_status: "saved_locally",
          warning: "n8n delivery failed, message saved to database only",
        });
      }
    }

    // n8n not configured - message saved locally only
    return NextResponse.json({
      success: true,
      message_id: savedMessage.id,
      delivery_status: "saved_locally",
      warning: "N8N_WEBHOOK_URL not configured",
    });
  } catch (err: unknown) {
    console.error("Outgoing webhook error:", err);
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : "Failed to send message",
      },
      { status: 500 },
    );
  }
}
