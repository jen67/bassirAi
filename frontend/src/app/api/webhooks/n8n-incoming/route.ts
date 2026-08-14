import { NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";

/**
 * POST /api/webhooks/n8n-incoming
 *
 * Receives processed messages from n8n workflow after AI generation.
 * This endpoint is called by n8n after it generates an AI response.
 *
 * @param patient_phone - Patient's phone number (E.164 format)
 * @param patient_name - Patient's name (optional)
 * @param channel - Message channel (whatsapp, instagram, facebook)
 * @param message - Original patient message
 * @param ai_response - Generated AI response
 * @param intent - Classified intent (booking, faq, greeting, complaint, human_support)
 * @param clinic_id - Clinic UUID (for multi-tenancy)
 *
 * @returns { success: true, conversation_id, message_id }
 */
export async function POST(request: Request) {
  try {
    const {
      patient_phone,
      patient_name,
      channel,
      message,
      ai_response,
      intent,
      clinic_id,
    } = await request.json();

    // Validate required fields
    if (!patient_phone || !channel || !message || !clinic_id) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: patient_phone, channel, message, clinic_id",
        },
        { status: 400 },
      );
    }

    // Validate phone format (E.164)
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    if (!phoneRegex.test(patient_phone.replace(/[\s-]/g, ""))) {
      return NextResponse.json(
        { error: "Invalid phone number format. Use E.164 format." },
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

    const supabase = createAdminClient();

    // 1. Find or create conversation
    let conversation;
    const { data: existingConv, error: convFindError } = await supabase
      .from("conversations")
      .select("*")
      .eq("clinic_id", clinic_id)
      .eq("patient_phone", patient_phone)
      .eq("channel", channel)
      .maybeSingle();

    if (convFindError) {
      console.error("Error finding conversation:", convFindError);
      throw convFindError;
    }

    if (existingConv) {
      // Update existing conversation
      conversation = existingConv;
      const { error: updateError } = await supabase
        .from("conversations")
        .update({
          last_message_at: new Date().toISOString(),
          status: intent === "booking" ? "active" : existingConv.status,
        })
        .eq("id", existingConv.id);

      if (updateError) {
        console.error("Error updating conversation:", updateError);
      }
    } else {
      // Create new conversation
      const { data: newConv, error: createError } = await supabase
        .from("conversations")
        .insert({
          clinic_id,
          patient_phone,
          patient_name: patient_name || null,
          channel,
          status: intent === "booking" ? "active" : "new",
          is_human_takeover: false,
          last_message_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (createError) {
        console.error("Error creating conversation:", createError);
        throw createError;
      }

      conversation = newConv;
    }

    // 2. Insert inbound message (patient's message)
    const { data: inboundMessage, error: inboundError } = await supabase
      .from("messages")
      .insert({
        clinic_id,
        conversation_id: conversation.id,
        content: message,
        direction: "inbound",
        is_ai_generated: false,
      })
      .select()
      .single();

    if (inboundError) {
      console.error("Error inserting inbound message:", inboundError);
      throw inboundError;
    }

    // 3. Insert outbound message (AI response) - only if ai_response exists
    let outboundMessage = null;
    if (ai_response) {
      const { data: outMsg, error: outboundError } = await supabase
        .from("messages")
        .insert({
          clinic_id,
          conversation_id: conversation.id,
          content: ai_response,
          direction: "outbound",
          is_ai_generated: true,
        })
        .select()
        .single();

      if (outboundError) {
        console.error("Error inserting outbound message:", outboundError);
        // Don't throw - inbound message is already saved
      } else {
        outboundMessage = outMsg;
      }
    }

    console.log("n8n webhook processed successfully:", {
      conversation_id: conversation.id,
      inbound_message_id: inboundMessage.id,
      outbound_message_id: outboundMessage?.id || null,
      intent,
    });

    return NextResponse.json({
      success: true,
      conversation_id: conversation.id,
      inbound_message_id: inboundMessage.id,
      outbound_message_id: outboundMessage?.id || null,
      message: "Messages saved to database successfully",
    });
  } catch (err: unknown) {
    console.error("n8n webhook error:", err);
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "Failed to process n8n webhook",
      },
      { status: 500 },
    );
  }
}

/**
 * GET /api/webhooks/n8n-incoming
 *
 * Health check endpoint for n8n webhook
 */
export async function GET() {
  return NextResponse.json({
    status: "healthy",
    endpoint: "/api/webhooks/n8n-incoming",
    method: "POST",
    purpose: "Receives processed messages from n8n workflow",
    timestamp: new Date().toISOString(),
  });
}
