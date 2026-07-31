import { NextResponse } from 'next/server'
import { createAdminClient } from '@/utils/supabase/admin'

export async function POST(request: Request) {
  try {
    const { clinicName, adminEmail } = await request.json()

    if (!clinicName || !adminEmail) {
      return NextResponse.json({ error: 'Missing clinic registration fields' }, { status: 400 })
    }

    const supabase = createAdminClient()

    // 1. Insert the clinic
    const { data: clinic, error: clinicErr } = await supabase
      .from('clinics')
      .insert({
        name: clinicName,
        email: adminEmail,
        ai_mode: true,
        tone_of_voice: 'professional',
      })
      .select('id')
      .single()

    if (clinicErr || !clinic) {
      return NextResponse.json({ error: clinicErr?.message || 'Failed to insert clinic record' }, { status: 500 })
    }

    const clinicId = clinic.id

    // 2. Initialize default customizations (FAQ, Catalog, Prompt, and unique Pinecone namespace)
    const normalizedName = clinicName.toLowerCase().replace(/[^a-z0-9]/g, '-')
    const pineconeNamespace = `${normalizedName}-${clinicId.slice(0, 8)}-ns`

    const { error: customErr } = await supabase
      .from('clinic_customizations')
      .insert({
        clinic_id: clinicId,
        catalog: [],
        faqs: [],
        custom_prompt: `You are a helpful customer care agent representing ${clinicName}. Introduce yourself clearly. Encourage patients to book callback consultations.`,
        pinecone_namespace: pineconeNamespace,
      })

    if (customErr) {
      return NextResponse.json({ error: customErr.message || 'Failed to initialize clinic customizations' }, { status: 500 })
    }

    return NextResponse.json({ clinicId, pineconeNamespace })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 })
  }
}
