import { createClient } from '@supabase/supabase-js'

// サーバーサイド用（Service Role Key使用）
export const createServerSupabase = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}
