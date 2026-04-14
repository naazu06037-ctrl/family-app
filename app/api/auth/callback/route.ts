import { NextRequest, NextResponse } from 'next/server'
import { getTokensFromCode } from '@/lib/google'
import { createServerSupabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code')
  if (!code) {
    return NextResponse.redirect(new URL('/setup?error=no_code', req.url))
  }

  try {
    const tokens = await getTokensFromCode(code)
    console.log('tokens:', JSON.stringify({ access_token: !!tokens.access_token, refresh_token: !!tokens.refresh_token }))
    const supabase = createServerSupabase()
    console.log('SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
    console.log('SERVICE_KEY starts with:', process.env.SUPABASE_SERVICE_ROLE_KEY?.substring(0, 20))

    if (tokens.access_token) {
      const { error: e1 } = await supabase
        .from('app_settings')
        .upsert({ key: 'google_access_token', value: tokens.access_token, updated_at: new Date().toISOString() })
      console.log('access_token save error:', JSON.stringify(e1))
    }
    if (tokens.refresh_token) {
      const { error: e2 } = await supabase
        .from('app_settings')
        .upsert({ key: 'google_refresh_token', value: tokens.refresh_token, updated_at: new Date().toISOString() })
      console.log('refresh_token save error:', JSON.stringify(e2))
    }

    return NextResponse.redirect(new URL('/setup?success=google', req.url))
  } catch (err) {
    console.error(err)
    return NextResponse.redirect(new URL('/setup?error=auth_failed', req.url))
  }
}
