import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
import { createServerSupabase } from '@/lib/supabase'
import { getTodayEvents, oauth2Client } from '@/lib/google'
import { sendLineMessage, buildMorningMessage } from '@/lib/line'

export async function GET(req: NextRequest) {
  // Vercel Cronからのリクエストを認証（ローカルテスト時はスキップ）
  const authHeader = req.headers.get('authorization')
  const isLocal = process.env.NODE_ENV === 'development'
  if (!isLocal && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const supabase = createServerSupabase()

    // Googleカレンダーのトークン取得
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

    let events: Array<{ title: string; start: string; allDay: boolean }> = []

    if (accessTokenRow && refreshTokenRow) {
      oauth2Client.on('tokens', async (tokens) => {
        if (tokens.access_token) {
          await supabase
            .from('app_settings')
            .upsert({ key: 'google_access_token', value: tokens.access_token })
        }
      })

      events = await getTodayEvents(accessTokenRow.value, refreshTokenRow.value)
    }

    // 未購入の買い物数を取得
    const { count: shoppingCount } = await supabase
      .from('shopping_items')
      .select('*', { count: 'exact', head: true })
      .eq('checked', false)

    const message = buildMorningMessage(events, shoppingCount || 0)

    // LINEに送信（夫婦それぞれに送信）
    const lineUserId = process.env.LINE_USER_ID
    const lineUserId2 = process.env.LINE_USER_ID_2

    if (lineUserId) {
      await sendLineMessage(lineUserId, message)
    }
    if (lineUserId2) {
      await sendLineMessage(lineUserId2, message)
    }

    return NextResponse.json({ ok: true, message })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: '通知の送信に失敗しました' }, { status: 500 })
  }
}
