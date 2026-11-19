-- One Tree 開幕版資料表。正式環境用 Supabase 時照這份建立。
-- 苗圃帳號只能更新 updates 的照片、高度、樹況與說明，不能讀取 planters.contact。

create table groups (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  type text not null check (type in ('association', 'company', 'family', 'individual')),
  stay_start date not null,
  stay_end date not null,
  guest_count integer not null check (guest_count > 0),
  sample boolean not null default false,
  created_at timestamptz not null default now()
);

create table trees (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  pin_hash text not null,
  pin_enc text not null,
  token_hash text not null,
  token_enc text not null,
  group_id uuid not null references groups (id),
  species text not null,
  location text not null,
  planted_on date not null,
  status text not null check (status in ('growing', 'watching', 'replant_needed', 'replanted')),
  is_public boolean not null default true,
  height_cm integer,
  status_reason text not null default '',
  next_check_month text not null default '',
  replanted_on date,
  replanted_name text not null default '',
  replanted_by_guest boolean not null default false,
  sample boolean not null default false,
  failed_attempts integer not null default 0,
  locked_until timestamptz
);

create table planters (
  id uuid primary key default gen_random_uuid(),
  tree_id uuid not null references trees (id),
  display_name text not null,
  contact text not null default '',
  notify_consent boolean not null default false,
  locale text not null default 'zh-TW'
);

create table updates (
  id uuid primary key default gen_random_uuid(),
  tree_id uuid not null references trees (id),
  season text not null,
  taken_on date not null,
  photos jsonb not null default '[]',
  height_cm integer,
  status text not null,
  species text not null,
  note text not null default '',
  uploader text not null,
  sample boolean not null default false,
  created_at timestamptz not null default now()
);

create table messages (
  id uuid primary key default gen_random_uuid(),
  tree_id uuid not null references trees (id),
  content text not null,
  is_public boolean not null default false,
  author_name text not null,
  created_at timestamptz not null default now()
);

create table certificates (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references groups (id),
  number text not null unique,
  local_spend integer,
  nursery_visitors integer,
  trees_planted integer,
  sample boolean not null default false
);

create table notifications (
  id uuid primary key default gen_random_uuid(),
  planter_id uuid,
  tree_id uuid not null references trees (id),
  type text not null,
  channel text not null,
  sent_at timestamptz not null default now(),
  result text not null,
  detail text not null default '',
  body text not null
);

create table staff (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  password_hash text not null,
  role text not null check (role in ('staff', 'nursery')),
  failed_attempts integer not null default 0,
  locked_until timestamptz
);
