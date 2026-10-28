-- ============================================================================
-- CMRG DATA COLLECT - ENTERPRISE RLS SECURITY HARDENING MIGRATION (PHASE 1.1)
-- Communication and Marketing Research Group Limited (CMRG Ltd.)
-- Milestone 1.1: Advanced Tenant Isolation, Role Escalation Prevention & RLS Audit
-- ============================================================================

-- 1. Ensure RLS is enabled on all tables
alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.project_memberships enable row level security;
alter table public.questionnaires enable row level security;
alter table public.questionnaire_versions enable row level security;
alter table public.submissions enable row level security;
alter table public.submission_answers enable row level security;
alter table public.review_flags enable row level security;
alter table public.audit_events enable row level security;

-- 2. Secure helper function with fixed search_path to prevent schema spoofing
create or replace function public.get_user_role()
returns text
language sql security definer
stable
set search_path = public, pg_temp
as $$
  select role from public.profiles where id = auth.uid();
$$;

-- 3. PROFILES POLICIES & ROLE ESCALATION PREVENTION
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

-- 4. PROJECTS POLICIES (Tenant & Membership Scope)
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

-- 5. PROJECT MEMBERSHIPS POLICIES
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

-- 6. QUESTIONNAIRES & VERSIONS POLICIES
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

-- 7. SUBMISSIONS & ANSWERS POLICIES (Strict Enumerator & Project Enforcement)
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

-- 8. REVIEW FLAGS POLICIES
drop policy if exists "Allow read/write review flags for supervisors and admins" on public.review_flags;
create policy "Allow read/write review flags for supervisors and admins"
  on public.review_flags for all
  using (public.get_user_role() in ('Admin', 'Field Supervisor', 'Data Analyst'));

-- 9. AUDIT EVENTS POLICIES (Anti-Forgery & Tamper Proofing)
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
