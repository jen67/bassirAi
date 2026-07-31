import { NextResponse } from 'next/server'
import { createAdminClient } from '@/utils/supabase/admin'

export async function POST(request: Request) {
  try {
    const {
      userId,
      clinicName,
      aiTone,
      catalog,
      faqs,
      bookingStrategy,
      calComUrl,
    } = await request.json()

    if (!userId || !clinicName) {
      return NextResponse.json({ error: 'Missing clinic onboarding parameters' }, { status: 400 })
    }

    const supabase = createAdminClient()

    // 1. Resolve clinic_id from users table
    const { data: userRecord, error: userErr } = await supabase
      .from('users')
      .select('clinic_id')
      .eq('id', userId)
      .single()

    if (userErr || !userRecord?.clinic_id) {
      return NextResponse.json({ error: userErr?.message || 'Clinic association not found for user' }, { status: 404 })
    }

    const clinicId = userRecord.clinic_id

    // 2. Update clinics table
    const { error: clinicErr } = await supabase
      .from('clinics')
      .update({
        name: clinicName,
        tone_of_voice: aiTone,
      })
      .eq('id', clinicId)

    if (clinicErr) {
      return NextResponse.json({ error: clinicErr.message }, { status: 500 })
    }

    // 3. Upsert customization variables (Hybrid FAQ lists and Prompt models)
    const { error: customErr } = await supabase
      .from('clinic_customizations')
      .upsert({
        clinic_id: clinicId,
        catalog: catalog || [],
        faqs: faqs || [],
        custom_prompt: `You are a helpful customer care agent representing ${clinicName}. Introduce yourself clearly. Ensure all prices are stated in Naira (₦). Encourage patients to book callback consultations.`,
      })

    if (customErr) {
      return NextResponse.json({ error: customErr.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 })
  }
}
