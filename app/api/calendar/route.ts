import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
import { createServerSupabase } from '@/lib/supabase'
import { getTodayEvents } from '@/lib/google'

export async function GET() {
  try {
    const supabase = createServerSupabase()

    // 保存済みトークンを取得
    const { data: accessTokenRow } = await supabase
      .from('app_settings')
      .select('value')
      .eq('key', 'google_access_token')
      .single()

    const { data: refreshTokenRow } = await supabase
      .from('app_settings')
      .select('value')
      .eq('key', 'google_refresh_token')
      .single()

    if (!accessTokenRow || !refreshTokenRow) {
      return NextResponse.json(
        { error: 'Googleカレンダーが未連携です。設定ページから連携してください。' },
        { status: 401 }
      )
    }

    const events = await getTodayEvents(
      accessTokenRow.value,
      refreshTokenRow.value,
      async (newAccessToken) => {
        await supabase
          .from('app_settings')
          .upsert({ key: 'google_access_token', value: newAccessToken })
      }
    )
    return NextResponse.json({ events })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'カレンダーの取得に失敗しました' }, { status: 500 })
  }
}
