import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET() {
  const supabase = createServerSupabase()
  const { data, error } = await supabase
    .from('shopping_items')
    .select('*')
    .order('created_at', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ items: data })
}

export async function POST(req: NextRequest) {
  const { name } = await req.json()
  if (!name) return NextResponse.json({ error: '名前が必要です' }, { status: 400 })

  const supabase = createServerSupabase()
  const { data, error } = await supabase
    .from('shopping_items')
    .insert({ name, checked: false })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ item: data })
}

export async function PATCH(req: NextRequest) {
  const { id, checked } = await req.json()
  if (!id) return NextResponse.json({ error: 'IDが必要です' }, { status: 400 })

  const supabase = createServerSupabase()
  const { error } = await supabase
    .from('shopping_items')
    .update({ checked })
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'IDが必要です' }, { status: 400 })

  const supabase = createServerSupabase()
  const { error } = await supabase.from('shopping_items').delete().eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
