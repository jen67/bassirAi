import { NextResponse } from 'next/server'
import { createAdminClient } from '@/utils/supabase/admin'

export async function POST(request: Request) {
  try {
    const { userId, clinicId, email, fullName, role } = await request.json()

    if (!userId || !clinicId || !email || !fullName || !role) {
      return NextResponse.json({ error: 'Missing user registration details' }, { status: 400 })
    }

    const supabase = createAdminClient()

    // Insert user linking them to the clinic in public schema
    const { error } = await supabase
      .from('users')
      .insert({
        id: userId,
        clinic_id: clinicId,
        email,
        full_name: fullName,
        role,
        is_active: true,
      })

    if (error) {
      return NextResponse.json({ error: error.message || 'Failed to insert public user profile' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 })
  }
}
