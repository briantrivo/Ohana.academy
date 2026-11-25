import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { Pool } from "pg";

export const SUPABASE_RESOURCES_BUCKET = "ohana-resources";

export function getSupabaseUrl(): string {
  return (
    process.env.SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    ""
  ).trim();
}

export function getSupabaseServiceKey(): string {
  return (
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SECRET_KEY ||
    ""
  ).trim();
}

export function isSupabaseConfigured(): boolean {
  return Boolean(getSupabaseUrl() && getSupabaseServiceKey());
}

let _supabaseAdmin: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient | null {
  const url = getSupabaseUrl();
  const key = getSupabaseServiceKey();
  if (!url || !key) return null;

  if (!_supabaseAdmin) {
    _supabaseAdmin = createClient(url, key, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }
  return _supabaseAdmin;
}

const SCHEMA_STATEMENTS = `
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

create table if not exists ohana_activation_codes (
  code text primary key,
  label text not null,
  target_course_id text not null,
  max_uses integer not null default 100,
  used_count integer not null default 0,
  active boolean not null default true,
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

alter table ohana_users enable row level security;
alter table ohana_courses enable row level security;
alter table ohana_orders enable row level security;
alter table ohana_activation_codes enable row level security;
alter table ohana_certificates enable row level security;
alter table ohana_enrollments enable row level security;
alter table ohana_lesson_progress enable row level security;
alter table ohana_quiz_scores enable row level security;
`;

let _initPromise: Promise<void> | null = null;

export async function ensureSupabaseReady(): Promise<void> {
  if (!isSupabaseConfigured()) return;
  if (_initPromise) return _initPromise;

  _initPromise = (async () => {
    const pgConn =
      process.env.POSTGRES_URL_NON_POOLING ||
      process.env.POSTGRES_URL ||
      process.env.DATABASE_URL;

    if (pgConn) {
      let cleanConn = pgConn;
      let useSsl = !pgConn.includes("localhost");
      try {
        const parsed = new URL(pgConn);
        parsed.searchParams.delete("sslmode");
        parsed.searchParams.delete("supa");
        cleanConn = parsed.toString();
      } catch {}

      const pool = new Pool({
        connectionString: cleanConn,
        ssl: useSsl ? { rejectUnauthorized: false } : false,
      });
      try {
        await pool.query(SCHEMA_STATEMENTS);
        await pool.query("NOTIFY pgrst, 'reload schema';");
      } catch (err) {
        console.warn("Supabase auto-schema init warning:", err);
      } finally {
        await pool.end().catch(() => {});
      }
    }

    const admin = getSupabaseAdmin();
    if (admin) {
      try {
        const { data: buckets } = await admin.storage.listBuckets();
        const exists = (buckets || []).some(
          (b) => b.name === SUPABASE_RESOURCES_BUCKET
        );
        if (!exists) {
          await admin.storage.createBucket(SUPABASE_RESOURCES_BUCKET, {
            public: false,
            fileSizeLimit: 26214400, // 25 MB
          });
        }
      } catch (err) {
        console.warn("Supabase bucket init warning:", err);
      }
    }
  })();

  return _initPromise;
}
