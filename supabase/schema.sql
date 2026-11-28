-- OHANA ACADEMY LMS - SUPABASE POSTGRES SCHEMA
-- Hỗ trợ cả tự động khởi tạo khi kết nối qua Vercel Marketplace
-- và dán chạy thủ công trong Supabase SQL Editor.

create table if not exists ohana_users (
  id text primary key,
  name text not null,
  email text unique not null,
  phone text default '',
  department text,
  role text not null default 'student',
  avatar text,
  auth_provider text default 'credentials',
  google_sub text,
  password_hash text,
  created_at timestamptz not null default now(),
  last_login_at timestamptz
);

create table if not exists ohana_courses (
  id text primary key,
  slug text unique not null,
  data jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists ohana_orders (
  order_code text primary key,
  order_type text not null default 'course',
  plan_id text,
  duration_days integer,
  course_id text not null,
  course_slug text not null,
  course_title text not null,
  user_id text not null,
  customer_name text not null,
  customer_email text not null,
  customer_phone text default '',
  original_amount bigint not null default 0,
  discount_amount bigint not null default 0,
  final_amount bigint not null default 0,
  coupon_code text,
  status text not null default 'pending',
  payment_method text not null default 'vietqr',
  transaction_ref text,
  created_at timestamptz not null default now(),
  paid_at timestamptz
);

create table if not exists ohana_membership_plans (
  id text primary key,
  name text not null,
  subtitle text default '',
  duration_days integer not null default 30,
  price bigint not null default 0,
  original_price bigint,
  badge text,
  features jsonb not null default '[]'::jsonb,
  active boolean not null default true,
  sort_order integer not null default 1,
  created_at timestamptz not null default now()
);

create table if not exists ohana_subscriptions (
  user_id text primary key,
  plan_id text not null,
  plan_name text not null,
  started_at timestamptz not null default now(),
  expires_at timestamptz not null,
  last_order_code text,
  updated_at timestamptz not null default now()
);

alter table ohana_users add column if not exists referral_code text;
alter table ohana_users add column if not exists referred_by_user_id text;
alter table ohana_users add column if not exists affiliate_enabled boolean not null default false;
alter table ohana_users add column if not exists affiliate_payout jsonb;

alter table ohana_orders add column if not exists referrer_user_id text;
alter table ohana_orders add column if not exists referral_code text;

create table if not exists ohana_affiliate_commissions (
  id text primary key,
  order_code text unique not null,
  order_type text not null default 'course',
  item_title text not null,
  order_amount bigint not null default 0,
  commission_rate numeric(5,4) not null default 0.10,
  commission_amount bigint not null default 0,
  referrer_user_id text not null,
  referrer_name text not null,
  referrer_email text not null,
  referrer_phone text default '',
  referral_code text not null,
  buyer_user_id text not null,
  buyer_name text not null,
  buyer_email text not null,
  status text not null default 'pending',
  payout_note text,
  created_at timestamptz not null default now(),
  paid_at timestamptz
);

create table if not exists ohana_activation_codes (
  code text primary key,
  label text not null,
  target_course_id text not null,
  max_uses integer not null default 100,
  used_count integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists ohana_coupons (
  code text primary key,
  label text not null,
  discount_type text not null default 'fixed',
  discount_value bigint not null default 0,
  target_course_id text not null default 'ALL',
  max_uses integer not null default 100,
  used_count integer not null default 0,
  active boolean not null default false,
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists ohana_certificates (
  code text primary key,
  course_id text not null,
  course_slug text not null,
  course_title text not null,
  student_name text not null,
  student_email text not null,
  issuer text not null,
  issued_at timestamptz not null default now(),
  quiz_score integer
);

create table if not exists ohana_enrollments (
  user_id text not null,
  course_id text not null,
  created_at timestamptz not null default now(),
  primary key (user_id, course_id)
);

create table if not exists ohana_lesson_progress (
  user_id text not null,
  course_id text not null,
  lesson_id text not null,
  completed_at timestamptz not null default now(),
  primary key (user_id, course_id, lesson_id)
);

create table if not exists ohana_quiz_scores (
  user_id text not null,
  lesson_id text not null,
  best_score integer not null default 0,
  updated_at timestamptz not null default now(),
  primary key (user_id, lesson_id)
);

-- Bật Row Level Security để khóa truy cập trực tiếp từ Browser Anon Key;
-- Toàn bộ đọc/ghi đi qua Server API của Ohana Academy với Service Role Key.
alter table ohana_users enable row level security;
alter table ohana_courses enable row level security;
alter table ohana_orders enable row level security;
alter table ohana_activation_codes enable row level security;
alter table ohana_coupons enable row level security;
alter table ohana_certificates enable row level security;
alter table ohana_enrollments enable row level security;
alter table ohana_lesson_progress enable row level security;
alter table ohana_quiz_scores enable row level security;
alter table ohana_membership_plans enable row level security;
alter table ohana_subscriptions enable row level security;
alter table ohana_affiliate_commissions enable row level security;
