import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

/**
 * POST /api/ai/generate
 *
 * Integrates with n8n workflow for AI response generation.
 * If n8n is configured, forwards to n8n for processing.
 * Otherwise, falls back to direct Groq API or template responses.
 */
export async function POST(request: Request) {
  try {
    const { clinicId, conversationId, messageText, isArabic } =
      await request.json();

    if (!clinicId || !conversationId || !messageText) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: clinicId, conversationId, messageText",
        },
        { status: 400 },
      );
    }

    const supabase = await createClient();

    // Get conversation details
    const { data: conversation, error: convError } = await supabase
      .from("conversations")
      .select("*")
      .eq("id", conversationId)
      .single();

    if (convError || !conversation) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 },
      );
    }

    // Check if n8n integration is enabled
    const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL;

    if (n8nWebhookUrl) {
      try {
        // Forward to n8n workflow
        const n8nPayload = {
          userId: conversation.patient_phone,
          name: conversation.patient_name || "Patient",
          phone: conversation.patient_phone,
          channel: conversation.channel,
          language: isArabic ? "ar" : "en",
          message: messageText,
          clinicId: clinicId,
          conversationId: conversationId,
        };

        const n8nResponse = await fetch(n8nWebhookUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(n8nPayload),
        });

        if (n8nResponse.ok) {
          const n8nData = await n8nResponse.json();

          return NextResponse.json({
            success: true,
            reply: n8nData.response || "Message processed by n8n",
            source: "n8n",
          });
        } else {
          console.error(
            "n8n webhook failed, falling back to direct processing",
          );
        }
      } catch (n8nError) {
        console.error("n8n integration error, using fallback:", n8nError);
      }
    }

    // Fallback: Direct processing without n8n
    const supabaseClient = await createClient();

    // 1. Fetch clinic info
    const { data: clinic } = await supabaseClient
      .from("clinics")
      .select("name, tone_of_voice")
      .eq("id", clinicId)
      .single();

    // 2. Fetch customizations (Prompt, FAQ, Catalog)
    const { data: custom } = await supabaseClient
      .from("clinic_customizations")
      .select("catalog, faqs, custom_prompt")
      .eq("clinic_id", clinicId)
      .maybeSingle();

    const groqKey = process.env.GROQ_API_KEY;

    let aiReply = "";

    // 3. Check if Groq API Key is present. If yes, query Llama 3.3
    if (groqKey) {
      try {
        const systemPrompt = `You are a helpful AI medical receptionist for ${clinic?.name || "Zuri Aesthetic Clinic"}.
Tone: ${clinic?.tone_of_voice || "professional"}.
Primary Language: ${isArabic ? "Arabic" : "English"}.

Instructions:
${custom?.custom_prompt || "Greet the patient politely and answer their questions based on the FAQ and catalog."}

Clinic Services & Pricing Catalog:
${JSON.stringify(custom?.catalog || [])}

Frequently Asked Questions (FAQs):
${JSON.stringify(custom?.faqs || [])}

Answer the patient's inquiry accurately. Keep responses concise (under 3 sentences) and conversational.`;

        const response = await fetch(
          "https://api.groq.com/openai/v1/chat/completions",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${groqKey}`,
            },
            body: JSON.stringify({
              model: "llama-3.3-70b-versatile",
              messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: messageText },
              ],
              temperature: 0.3,
              max_tokens: 150,
            }),
          },
        );

        if (response.ok) {
          const data = await response.json();
          aiReply = data.choices?.[0]?.message?.content?.trim() || "";
        } else {
          console.error("Groq API error response:", await response.text());
        }
      } catch (err) {
        console.error("Failed to fetch from Groq API:", err);
      }
    }

    // 4. Fallback if Groq API failed or is not configured
    if (!aiReply) {
      console.log("Using local templates for AI reply simulation.");
      aiReply =
        "Thank you for contacting Zuri Aesthetic! Our practitioner will contact you shortly. Would you like to schedule a callback?";

      if (isArabic) {
        if (messageText.includes("موقع") || messageText.includes("أين")) {
          aiReply =
            "موقعنا في ليكي فاز 1، لاغوس. ويتوفر موقف مجاني للسيارات أمام مدخل العيادة لجميع المرضى!";
        } else {
          aiReply =
            "أهلاً بك في عيادة زوري للتجميل في ليكي! سيقوم طبيبنا بالتواصل معك قريباً. هل تود حجز موعد للاتصال بك؟";
        }
      } else if (messageText.toLowerCase().includes("botox")) {
        aiReply =
          "Botox treatments at Zuri Clinic range from ₦180,000 to ₦300,000. Would you like to book a consultation session?";
      } else if (
        messageText.toLowerCase().includes("filler") ||
        messageText.includes("فيلر")
      ) {
        aiReply =
          "Lip Filler (Juvederm) at Zuri Clinic is ₦450,000 - ₦600,000 per syringe. Shall I check available callback times?";
      } else if (
        messageText.toLowerCase().includes("located") ||
        messageText.toLowerCase().includes("location") ||
        messageText.toLowerCase().includes("where")
      ) {
        aiReply =
          "We are located in Lekki Phase 1, Lagos. We provide free parking validation right in front of the clinic entrance for all patients!";
      } else if (
        messageText.toLowerCase().includes("laser") ||
        messageText.toLowerCase().includes("resurfacing")
      ) {
        aiReply =
          "Zuri Clinic offers advanced Laser Skin Resurfacing starting from ₦250,000 per session. Would you like to schedule a consultation with our dermatologist?";
      }
    }

    // 5. Insert simulated AI outbound reply into Supabase
    const { error: insertErr } = await supabaseClient.from("messages").insert({
      clinic_id: clinicId,
      conversation_id: conversationId,
      content: aiReply,
      direction: "outbound",
      is_ai_generated: true,
    });

    if (insertErr) {
      console.error(
        "Failed to insert AI reply into Supabase:",
        insertErr.message,
      );
      return NextResponse.json({ error: insertErr.message }, { status: 500 });
    }

    // 6. Update conversation timestamp
    await supabaseClient
      .from("conversations")
      .update({ last_message_at: new Date().toISOString() })
      .eq("id", conversationId);

    return NextResponse.json({
      success: true,
      reply: aiReply,
      source: "fallback",
    });
  } catch (err: unknown) {
    console.error("AI Generation route error:", err);
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "Failed to process AI response",
      },
      { status: 500 },
    );
  }
}
