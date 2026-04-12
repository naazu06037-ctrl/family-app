import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase'
import { getTodayEvents, oauth2Client } from '@/lib/google'

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

    // トークンが期限切れの場合は自動リフレッシュ
    oauth2Client.setCredentials({
      access_token: accessTokenRow.value,
      refresh_token: refreshTokenRow.value,
    })

    oauth2Client.on('tokens', async (tokens) => {
      if (tokens.access_token) {
        await supabase
          .from('app_settings')
          .upsert({ key: 'google_access_token', value: tokens.access_token })
      }
    })

    const events = await getTodayEvents(accessTokenRow.value, refreshTokenRow.value)
    return NextResponse.json({ events })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'カレンダーの取得に失敗しました' }, { status: 500 })
  }
}
