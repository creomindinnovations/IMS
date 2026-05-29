-- IMS on Supabase (free tier): run in Supabase Dashboard → SQL Editor

-- Extensions
create extension if not exists "uuid-ossp";

-- Profiles (linked to auth.users)
create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  name text not null default '',
  role text not null check (role in ('admin', 'teamlead', 'intern')),
  department text default '',
  is_active boolean not null default true,
  team_lead_id uuid references public.users(id) on delete set null,
  start_date date,
  end_date date,
  stipend numeric,
  created_at timestamptz not null default now()
);

create table if not exists public.attendance (
  id text primary key,
  uid uuid not null references public.users(id) on delete cascade,
  date text not null,
  check_in timestamptz,
  check_out timestamptz,
  status text check (status in ('present', 'late')),
  is_late boolean default false,
  duration_minutes int
);

create table if not exists public.leave_requests (
  id uuid primary key default gen_random_uuid(),
  uid uuid not null references public.users(id) on delete cascade,
  intern_name text default '',
  start_date text not null,
  end_date text not null,
  reason text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now(),
  reviewed_at timestamptz,
  admin_note text default '',
  reviewed_by uuid references public.users(id)
);

create table if not exists public.tutorials (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text default '',
  category text default 'general',
  type text not null check (type in ('youtube', 'pdf', 'video')),
  url text default '',
  is_published boolean not null default false,
  "order" int default 0,
  uploaded_by uuid references public.users(id),
  created_at timestamptz not null default now()
);

create table if not exists public.progress (
  uid uuid primary key references public.users(id) on delete cascade,
  completed_tutorials jsonb not null default '[]'::jsonb,
  last_updated timestamptz default now()
);

create table if not exists public.announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  scope text not null default 'global',
  posted_by uuid references public.users(id),
  created_at timestamptz not null default now()
);

create table if not exists public.certificates (
  id uuid primary key default gen_random_uuid(),
  intern_uid uuid not null references public.users(id) on delete cascade,
  intern_name text,
  type text,
  role text,
  department text,
  start_date timestamptz,
  end_date timestamptz,
  cert_id text not null unique,
  qr_data text,
  status text not null default 'pending' check (status in ('pending', 'approved')),
  pdf_url text,
  approved_by uuid references public.users(id),
  approved_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.offer_letters (
  id uuid primary key default gen_random_uuid(),
  letter_id text not null,
  intern_uid uuid not null references public.users(id) on delete cascade,
  intern_name text,
  role text,
  department text,
  start_date timestamptz,
  end_date timestamptz,
  stipend numeric,
  pdf_url text,
  generated_by uuid references public.users(id),
  created_at timestamptz not null default now()
);

create table if not exists public.settings (
  key text primary key,
  company_name text default 'Your Startup',
  logo_url text default '',
  address text default '',
  late_hour int default 10,
  late_minute int default 0
);

insert into public.settings (key, company_name)
values ('branding', 'IMS')
on conflict (key) do nothing;

-- Helper: current user's role
create or replace function public.current_user_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role from public.users where id = auth.uid();
$$;

-- RLS
alter table public.users enable row level security;
alter table public.attendance enable row level security;
alter table public.leave_requests enable row level security;
alter table public.tutorials enable row level security;
alter table public.progress enable row level security;
alter table public.announcements enable row level security;
alter table public.certificates enable row level security;
alter table public.offer_letters enable row level security;
alter table public.settings enable row level security;

-- Users policies
create policy "users_select_own" on public.users for select using (auth.uid() = id);
create policy "users_select_admin" on public.users for select using (public.current_user_role() = 'admin');
create policy "users_insert_admin" on public.users for insert with check (public.current_user_role() = 'admin');
create policy "users_update_own_or_admin" on public.users for update using (
  auth.uid() = id or public.current_user_role() = 'admin'
);
create policy "users_delete_admin" on public.users for delete using (public.current_user_role() = 'admin');

-- Attendance
create policy "attendance_select_auth" on public.attendance for select to authenticated using (true);
create policy "attendance_insert_own" on public.attendance for insert with check (auth.uid() = uid);
create policy "attendance_update_own" on public.attendance for update using (auth.uid() = uid);
create policy "attendance_delete_admin" on public.attendance for delete using (public.current_user_role() = 'admin');

-- Leave requests
create policy "leave_select" on public.leave_requests for select using (
  auth.uid() = uid
  or public.current_user_role() in ('admin', 'teamlead')
);
create policy "leave_insert_own" on public.leave_requests for insert with check (
  auth.uid() = uid and status = 'pending'
);
create policy "leave_update_admin" on public.leave_requests for update using (public.current_user_role() = 'admin');

-- Tutorials
create policy "tutorials_select" on public.tutorials for select using (
  is_published = true
  or public.current_user_role() in ('admin', 'teamlead')
);
create policy "tutorials_write_lead" on public.tutorials for insert with check (
  public.current_user_role() in ('admin', 'teamlead')
);
create policy "tutorials_update_admin" on public.tutorials for update using (public.current_user_role() = 'admin');
create policy "tutorials_delete_admin" on public.tutorials for delete using (public.current_user_role() = 'admin');

-- Progress
create policy "progress_select" on public.progress for select using (
  auth.uid() = uid
  or public.current_user_role() in ('admin', 'teamlead')
);
create policy "progress_upsert_own" on public.progress for insert with check (auth.uid() = uid);
create policy "progress_update_own" on public.progress for update using (auth.uid() = uid);

-- Announcements
create policy "announcements_select_auth" on public.announcements for select to authenticated using (true);
create policy "announcements_write" on public.announcements for insert with check (
  public.current_user_role() in ('admin', 'teamlead')
);
create policy "announcements_update" on public.announcements for update using (
  public.current_user_role() in ('admin', 'teamlead')
);
create policy "announcements_delete" on public.announcements for delete using (
  public.current_user_role() in ('admin', 'teamlead')
);

-- Certificates
create policy "certificates_select" on public.certificates for select using (
  auth.uid() = intern_uid
  or public.current_user_role() = 'admin'
  or (public.current_user_role() = 'teamlead' and status = 'approved')
);
create policy "certificates_public_verify" on public.certificates for select to anon using (status = 'approved');
create policy "certificates_insert_admin" on public.certificates for insert with check (public.current_user_role() = 'admin');
create policy "certificates_update_admin" on public.certificates for update using (public.current_user_role() = 'admin');
create policy "certificates_delete_admin" on public.certificates for delete using (public.current_user_role() = 'admin');

-- Offer letters
create policy "offer_select" on public.offer_letters for select using (
  auth.uid() = intern_uid or public.current_user_role() = 'admin'
);
create policy "offer_insert_admin" on public.offer_letters for insert with check (public.current_user_role() = 'admin');
create policy "offer_update_admin" on public.offer_letters for update using (public.current_user_role() = 'admin');
create policy "offer_delete_admin" on public.offer_letters for delete using (public.current_user_role() = 'admin');

-- Settings
create policy "settings_select_auth" on public.settings for select to authenticated using (true);
create policy "settings_update_admin" on public.settings for update using (public.current_user_role() = 'admin');
create policy "settings_insert_admin" on public.settings for insert with check (public.current_user_role() = 'admin');

-- Storage bucket (create in Dashboard → Storage → New bucket: "ims", public)
-- Or run:
-- insert into storage.buckets (id, name, public) values ('ims', 'ims', true) on conflict do nothing;

-- Storage policies (run after bucket exists)
-- create policy "ims_read_auth" on storage.objects for select to authenticated using (bucket_id = 'ims');
-- create policy "ims_write_auth" on storage.objects for insert to authenticated with check (bucket_id = 'ims');
-- create policy "ims_update_auth" on storage.objects for update to authenticated using (bucket_id = 'ims');

-- Trigger: create profile row when auth user signs up (optional; admin usually creates users)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, email, name, role, department, is_active)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'role', 'intern'),
    coalesce(new.raw_user_meta_data->>'department', ''),
    true
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
