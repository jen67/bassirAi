const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// 1. Manually parse .env variables from frontend directory
const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
  console.error('Error: .env file not found in frontend directory.');
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split(/\r?\n/).forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    const key = match[1];
    let value = match[2] || '';
    // Remove quotes
    if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
    if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
    env[key] = value.trim();
  }
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY missing in .env.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function main() {
  const args = process.argv.slice(2);
  const phone = args[0] || '+234 803 111 2222';
  const messageText = args[1] || 'Hi, how much is Botox?';
  const isArabic = args[2] === 'arabic' || messageText.match(/[\u0600-\u06FF]/);

  console.log(`\n⚡ Starting Inbound WhatsApp Simulator...`);
  console.log(`📱 Patient Phone: ${phone}`);
  console.log(`💬 Message Content: "${messageText}"`);

  // 1. Retrieve first clinic from DB
  const { data: clinics, error: clinicErr } = await supabase.from('clinics').select('id, name').limit(1);
  if (clinicErr || !clinics || clinics.length === 0) {
    console.error('Error fetching clinics. Make sure a clinic is registered in the database (or complete onboarding first!).');
    return;
  }
  const clinic = clinics[0];
  console.log(`🏥 Targeting Clinic: ${clinic.name} (${clinic.id})`);

  // 2. Resolve Conversation
  let { data: conv, error: convErr } = await supabase
    .from('conversations')
    .select('id, is_human_takeover')
    .eq('clinic_id', clinic.id)
    .eq('patient_phone', phone)
    .eq('channel', 'whatsapp')
    .maybeSingle();

  if (convErr) {
    console.error('Error checking conversation:', convErr.message);
    return;
  }

  let conversationId;
  let isTakeover = false;

  if (!conv) {
    console.log(`🆕 No conversation found. Creating new conversation thread...`);
    const { data: newConv, error: createErr } = await supabase
      .from('conversations')
      .insert({
        clinic_id: clinic.id,
        patient_phone: phone,
        patient_name: phone === '+234 803 111 2222' ? 'Chioma Adebayo' : (phone === '+234 812 333 4444' ? 'Kelechi Okafor' : 'New Patient'),
        channel: 'whatsapp',
        status: 'new',
        is_human_takeover: false
      })
      .select('id, is_human_takeover')
      .single();

    if (createErr) {
      console.error('Error creating conversation:', createErr.message);
      return;
    }
    conversationId = newConv.id;
    isTakeover = newConv.is_human_takeover;
  } else {
    conversationId = conv.id;
    isTakeover = conv.is_human_takeover;
    console.log(`🔄 Found existing conversation (${conversationId}). Takeover status: ${isTakeover}`);
  }

  // 3. Log Inbound Patient Message
  console.log(`📥 Logging inbound patient message in database...`);
  const { error: msgErr } = await supabase.from('messages').insert({
    clinic_id: clinic.id,
    conversation_id: conversationId,
    content: messageText,
    direction: 'inbound',
    is_ai_generated: false
  });

  if (msgErr) {
    console.error('Error inserting patient message:', msgErr.message);
    return;
  }
  console.log(`✅ Message logged successfully! (It will now be visible in Next.js inbox in real-time)`);

  // 4. Run AI responder if takeover is false
  if (isTakeover) {
    console.log(`⚠️ Human Takeover is ACTIVE. AI auto-responder remains SILENT.`);
    return;
  }

  console.log(`🤖 AI auto-responder is active. Generating response in 1.5 seconds...`);
  setTimeout(async () => {
    let aiReply = "Thank you for contacting Zuri Aesthetic! Our practitioner will contact you shortly. Would you like to schedule a callback?";
    if (isArabic) {
      aiReply = "أهلاً بك في عيادة زوري للتجميل في ليكي! سيقوم طبيبنا بالتواصل معك قريباً. هل تود حجز موعد للاتصال بك؟";
    } else if (messageText.toLowerCase().includes('botox')) {
      aiReply = "Botox treatments at Zuri Clinic range from ₦180,000 to ₦300,000. Would you like to book a consultation session?";
    } else if (messageText.toLowerCase().includes('filler') || messageText.includes('فيلر')) {
      aiReply = "Lip Filler (Juvederm) at Zuri Clinic is ₦450,000 - ₦600,000 per syringe. Shall I check available callback times?";
    }

    console.log(`📤 Sending AI reply: "${aiReply}"`);
    const { error: aiErr } = await supabase.from('messages').insert({
      clinic_id: clinic.id,
      conversation_id: conversationId,
      content: aiReply,
      direction: 'outbound',
      is_ai_generated: true
    });

    if (aiErr) {
      console.error('Error inserting AI message:', aiErr.message);
      return;
    }

    // Update conversation timestamp
    await supabase
      .from('conversations')
      .update({ last_message_at: new Date().toISOString() })
      .eq('id', conversationId);

    console.log(`✅ AI message logged successfully! (It will now stream to Next.js in real-time)`);
  }, 1500);
}

main();
