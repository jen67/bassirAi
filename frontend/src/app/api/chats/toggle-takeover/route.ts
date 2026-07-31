import { NextResponse } from 'next/server'
import { createAdminClient } from '@/utils/supabase/admin'

export async function POST(request: Request) {
  try {
    const { phone, takeover } = await request.json()

    if (!phone) {
      return NextResponse.json({ error: 'Missing patient phone parameter' }, { status: 400 })
    }

    const supabase = createAdminClient()

    // Update the is_human_takeover status in conversations table
    const { error } = await supabase
      .from('conversations')
      .update({ is_human_takeover: !!takeover })
      .eq('patient_phone', phone)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, is_human_takeover: !!takeover })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 })
  }
}
