-- ============================================================================
-- CMRG DATA COLLECT - UNIFIED ENTERPRISE SUPABASE MASTER SCHEMA & RLS MIGRATION
-- Communication and Marketing Research Group Limited (CMRG Ltd.)
-- Tagline: Tech savvy • Data Integrity • Actionable insights
-- ============================================================================
-- This script provisions the complete database schema, UUID extensions, tables,
-- performance indexes, helper functions, and advanced Row Level Security (RLS)
-- policies with anti-role-escalation and tenant isolation safeguards.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 0. EXTENSIONS & PREREQUISITES
-- ----------------------------------------------------------------------------
create extension if not exists "uuid-ossp";

-- ----------------------------------------------------------------------------
-- 1. TABLE: profiles
-- Stores user accounts, roles (Admin, Field Supervisor, Data Analyst, Enumerator),
-- and geopolitical zone assignments across Nigeria.
-- ----------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text not null,
  email text not null unique,
  role text not null check (role in ('Admin', 'Field Supervisor', 'Data Analyst', 'Enumerator')),
  zone text check (zone in ('North-West', 'North-East', 'North-Central', 'South-West', 'South-East', 'South-South')),
  state text,
  phone text,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

comment on table public.profiles is 'CMRG staff and field enumerator profiles linked to Supabase Auth.';


-- ----------------------------------------------------------------------------
-- 2. TABLE: projects
-- Stores research studies, project codes, client organizations, sectors,
-- fieldwork date windows, and target vs completed interview quotas.
-- ----------------------------------------------------------------------------
create table if not exists public.projects (
  id uuid default uuid_generate_v4() primary key,
  code text not null unique,
  title text not null,
  client text not null,
  sector text not null check (sector in ('FMCG', 'Public Opinion', 'Agriculture', 'Healthcare', 'Financial Services', 'Energy')),
  status text not null default 'Draft' check (status in ('Active', 'Draft', 'Paused', 'Completed')),
  start_date date not null,
  end_date date not null,
  target_interviews integer not null default 1000,
  completed_interviews integer not null default 0,
  rejected_interviews integer not null default 0,
  regions text[] not null default '{}',
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

comment on table public.projects is 'Active and archived market research projects and quotas.';


-- ----------------------------------------------------------------------------
-- 3. TABLE: project_memberships
-- Assigns supervisors and field enumerators to specific research projects.
-- ----------------------------------------------------------------------------
create table if not exists public.project_memberships (
  id uuid default uuid_generate_v4() primary key,
  project_id uuid references public.projects(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  assigned_role text not null check (assigned_role in ('Supervisor', 'Enumerator')),
  assigned_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(project_id, user_id)
);

comment on table public.project_memberships is 'Mapping table connecting staff to assigned research projects.';


-- ----------------------------------------------------------------------------
-- 4. TABLE: questionnaires
-- Stores ODK and SurveyCTO compatible questionnaire definitions, schemas,
-- and XML XForm representations.
-- ----------------------------------------------------------------------------
create table if not exists public.questionnaires (
  id uuid default uuid_generate_v4() primary key,
  project_id uuid references public.projects(id) on delete cascade not null,
  title text not null,
  version text not null default '1.0',
  schema_json jsonb not null default '[]'::jsonb,
  xform_xml text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

comment on table public.questionnaires is 'Questionnaire form structures and ODK XML definitions.';


-- ----------------------------------------------------------------------------
-- 5. TABLE: questionnaire_versions
-- Maintains immutable version history for questionnaires.
-- ----------------------------------------------------------------------------
create table if not exists public.questionnaire_versions (
  id uuid default uuid_generate_v4() primary key,
  questionnaire_id uuid references public.questionnaires(id) on delete cascade not null,
  version text not null,
  schema_json jsonb not null,
  changelog text,
  published_by uuid references public.profiles(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

comment on table public.questionnaire_versions is 'Historical version snapshots of survey instruments.';


-- ----------------------------------------------------------------------------
-- 6. TABLE: submissions
-- Stores field interview submissions transmitted from Android tablets.
-- Includes offline synchronization safeguards (`client_submission_uuid`),
-- GPS latitude, longitude, accuracy, interview duration, and review status.
-- ----------------------------------------------------------------------------
create table if not exists public.submissions (
  id uuid default uuid_generate_v4() primary key,
  client_submission_uuid uuid not null unique, -- Prevents duplicate submissions during offline sync retries
  project_id uuid references public.projects(id) on delete cascade not null,
  enumerator_id uuid references public.profiles(id) on delete set null,
  state text not null,
  lga text not null,
  gps_lat double precision not null,
  gps_lng double precision not null,
  gps_accuracy double precision not null,
  duration_seconds integer not null default 0,
  device_id text not null,
  status text not null default 'Pending' check (status in ('Approved', 'Flagged', 'Pending', 'Rejected')),
  flag_reason text,
  audio_url text,
  synced_at timestamp with time zone default timezone('utc'::text, now()) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

comment on table public.submissions is 'Field interview submissions with GPS audit trails and offline sync IDs.';


-- ----------------------------------------------------------------------------
-- 7. TABLE: submission_answers
-- Stores normalized key-value responses for each questionnaire variable.
-- ----------------------------------------------------------------------------
create table if not exists public.submission_answers (
  id uuid default uuid_generate_v4() primary key,
  submission_id uuid references public.submissions(id) on delete cascade not null,
  variable_name text not null,
  answer_value text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

comment on table public.submission_answers is 'Individual question answers corresponding to questionnaire variables.';


-- ----------------------------------------------------------------------------
-- 8. TABLE: review_flags
-- Stores quality control audit flags (speeders, GPS mismatches, outliers).
-- ----------------------------------------------------------------------------
create table if not exists public.review_flags (
  id uuid default uuid_generate_v4() primary key,
  submission_id uuid references public.submissions(id) on delete cascade not null,
  supervisor_id uuid references public.profiles(id) on delete set null,
  flag_type text not null check (flag_type in ('Speeder', 'GPS_Mismatch', 'Outlier', 'Duplicate', 'Manual')),
  notes text,
  resolved boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

comment on table public.review_flags is 'Quality audit flags and supervisor review remarks.';


-- ----------------------------------------------------------------------------
-- 9. TABLE: audit_events
-- Immutable system audit trail recording sensitive data modifications and logins.
-- ----------------------------------------------------------------------------
create table if not exists public.audit_events (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete set null,
  action text not null,
  details text not null,
  ip_address text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

comment on table public.audit_events is 'Immutable security and operational audit trail.';


-- ============================================================================
-- PERFORMANCE INDEXES
-- ============================================================================
create index if not exists idx_submissions_project on public.submissions(project_id);
create index if not exists idx_submissions_enumerator on public.submissions(enumerator_id);
create index if not exists idx_submissions_client_uuid on public.submissions(client_submission_uuid);
create index if not exists idx_submission_answers_sub on public.submission_answers(submission_id);
create index if not exists idx_project_memberships_user on public.project_memberships(user_id);
create index if not exists idx_project_memberships_project on public.project_memberships(project_id);


-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES & HARDENING
-- ============================================================================

-- Enable RLS on all enterprise tables
alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.project_memberships enable row level security;
alter table public.questionnaires enable row level security;
alter table public.questionnaire_versions enable row level security;
alter table public.submissions enable row level security;
alter table public.submission_answers enable row level security;
alter table public.review_flags enable row level security;
alter table public.audit_events enable row level security;

-- Secure helper function with fixed search_path to prevent schema spoofing
create or replace function public.get_user_role()
returns text
language sql security definer
stable
set search_path = public, pg_temp
as $$
  select role from public.profiles where id = auth.uid();
$$;

-- 1. PROFILES POLICIES & ROLE ESCALATION PREVENTION
drop policy if exists "Allow read access to profiles for authenticated users" on public.profiles;
create policy "Allow read access to profiles for authenticated users"
  on public.profiles for select
  using (auth.role() = 'authenticated');

drop policy if exists "Allow users to update own profile or admin" on public.profiles;
create policy "Allow users to update own profile or admin"
  on public.profiles for update
  using (auth.uid() = id or public.get_user_role() = 'Admin')
  with check (
    (auth.uid() = id and role = (select p.role from public.profiles p where p.id = auth.uid()))
    or public.get_user_role() = 'Admin'
  );

drop policy if exists "Allow admin to insert profiles" on public.profiles;
create policy "Allow admin to insert profiles"
  on public.profiles for insert
  with check (auth.role() = 'authenticated' and (public.get_user_role() = 'Admin' or not exists (select 1 from public.profiles)));

-- 2. PROJECTS POLICIES
drop policy if exists "Allow read access to projects for authenticated users" on public.projects;
create policy "Allow read access to projects for authenticated users"
  on public.projects for select
  using (
    public.get_user_role() in ('Admin', 'Field Supervisor', 'Data Analyst')
    or exists (
      select 1 from public.project_memberships pm 
      where pm.project_id = projects.id and pm.user_id = auth.uid()
    )
  );

drop policy if exists "Allow admin and supervisors to insert/update projects" on public.projects;
create policy "Allow admin and supervisors to insert/update projects"
  on public.projects for all
  using (public.get_user_role() in ('Admin', 'Field Supervisor'));

-- 3. PROJECT MEMBERSHIPS POLICIES
drop policy if exists "Allow read access to project memberships" on public.project_memberships;
create policy "Allow read access to project memberships"
  on public.project_memberships for select
  using (
    public.get_user_role() in ('Admin', 'Field Supervisor') 
    or user_id = auth.uid()
  );

drop policy if exists "Allow admin and supervisors to manage memberships" on public.project_memberships;
create policy "Allow admin and supervisors to manage memberships"
  on public.project_memberships for all
  using (public.get_user_role() in ('Admin', 'Field Supervisor'));

-- 4. QUESTIONNAIRES & VERSIONS POLICIES
drop policy if exists "Allow read questionnaires for authenticated" on public.questionnaires;
create policy "Allow read questionnaires for authenticated"
  on public.questionnaires for select
  using (
    public.get_user_role() in ('Admin', 'Field Supervisor', 'Data Analyst')
    or exists (
      select 1 from public.project_memberships pm 
      where pm.project_id = questionnaires.project_id and pm.user_id = auth.uid()
    )
  );

drop policy if exists "Allow manage questionnaires for admin and supervisors" on public.questionnaires;
create policy "Allow manage questionnaires for admin and supervisors"
  on public.questionnaires for all
  using (public.get_user_role() in ('Admin', 'Field Supervisor'));

drop policy if exists "Allow read questionnaire versions for authenticated" on public.questionnaire_versions;
create policy "Allow read questionnaire versions for authenticated"
  on public.questionnaire_versions for select
  using (auth.role() = 'authenticated');

drop policy if exists "Allow insert questionnaire versions for admin and supervisors" on public.questionnaire_versions;
create policy "Allow insert questionnaire versions for admin and supervisors"
  on public.questionnaire_versions for insert
  with check (public.get_user_role() in ('Admin', 'Field Supervisor'));

-- 5. SUBMISSIONS & ANSWERS POLICIES
drop policy if exists "Allow enumerators to insert submissions" on public.submissions;
create policy "Allow enumerators to insert submissions"
  on public.submissions for insert
  with check (
    auth.role() = 'authenticated' 
    and (
      public.get_user_role() in ('Admin', 'Field Supervisor')
      or exists (
        select 1 from public.project_memberships pm 
        where pm.project_id = submissions.project_id and pm.user_id = auth.uid()
      )
    )
    and (enumerator_id = auth.uid() or public.get_user_role() in ('Admin', 'Field Supervisor'))
  );

drop policy if exists "Allow read submissions for authorized roles" on public.submissions;
create policy "Allow read submissions for authorized roles"
  on public.submissions for select
  using (
    public.get_user_role() in ('Admin', 'Field Supervisor', 'Data Analyst') 
    or enumerator_id = auth.uid()
  );

drop policy if exists "Allow supervisors to update submission review status" on public.submissions;
create policy "Allow supervisors to update submission review status"
  on public.submissions for update
  using (public.get_user_role() in ('Admin', 'Field Supervisor'));

drop policy if exists "Allow insert submission answers for authenticated" on public.submission_answers;
create policy "Allow insert submission answers for authenticated"
  on public.submission_answers for insert
  with check (
    auth.role() = 'authenticated'
    and exists (
      select 1 from public.submissions s
      where s.id = submission_answers.submission_id
      and (s.enumerator_id = auth.uid() or public.get_user_role() in ('Admin', 'Field Supervisor', 'Data Analyst'))
    )
  );

drop policy if exists "Allow read submission answers for authorized" on public.submission_answers;
create policy "Allow read submission answers for authorized"
  on public.submission_answers for select
  using (
    auth.role() = 'authenticated'
    and exists (
      select 1 from public.submissions s
      where s.id = submission_answers.submission_id
      and (public.get_user_role() in ('Admin', 'Field Supervisor', 'Data Analyst') or s.enumerator_id = auth.uid())
    )
  );

-- 6. REVIEW FLAGS POLICIES
drop policy if exists "Allow read/write review flags for supervisors and admins" on public.review_flags;
create policy "Allow read/write review flags for supervisors and admins"
  on public.review_flags for all
  using (public.get_user_role() in ('Admin', 'Field Supervisor', 'Data Analyst'));

-- 7. AUDIT EVENTS POLICIES
drop policy if exists "Allow admins to read audit logs" on public.audit_events;
create policy "Allow admins to read audit logs"
  on public.audit_events for select
  using (public.get_user_role() in ('Admin', 'Field Supervisor'));

drop policy if exists "Allow authenticated users to create audit events" on public.audit_events;
create policy "Allow authenticated users to create audit events"
  on public.audit_events for insert
  with check (
    auth.role() = 'authenticated'
    and (user_id = auth.uid() or user_id is null)
  );
