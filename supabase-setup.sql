-- Supabaseで実行するSQL
-- 「SQL Editor」タブからこのSQLを貼り付けて実行してください

-- 買い物リストテーブル
create table if not exists shopping_items (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  checked boolean default false,
  created_at timestamptz default now()
);

-- 子供の行事・書類テーブル
create table if not exists kid_events (
  id uuid default gen_random_uuid() primary key,
  kid_name text not null,
  title text not null,
  event_date date not null,
  category text default 'event',
  description text,
  created_at timestamptz default now()
);

-- アプリ設定テーブル（Googleトークン保存用）
create table if not exists app_settings (
  key text primary key,
  value text not null,
  updated_at timestamptz default now()
);

-- Row Level Security を無効化（家族のみのアプリなので不要）
alter table shopping_items disable row level security;
alter table kid_events disable row level security;
alter table app_settings disable row level security;
