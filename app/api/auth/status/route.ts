import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET() {
  const supabase = createServerSupabase()
  const { data } = await supabase
    .from('app_settings')
    .select('key')
    .eq('key', 'google_refresh_token')
    .single()

  return NextResponse.json({ googleConnected: !!data })
}
