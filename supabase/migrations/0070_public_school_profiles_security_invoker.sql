-- 0070: Switch public.public_school_profiles to security_invoker = true
-- while preserving anonymous read access to curated public school fields.
--
-- Supabase Database Advisor flags views with `security_invoker = false`
-- (`0010_security_definer_view`). However, `public.schools` and
-- `public.school_settings` restrict SELECT via RLS to authenticated school
-- members (and `school_settings` holds non-public policy/notification JSONB
-- columns that must not be exposed to `anon`).
--
-- Solution: Encapsulate the curated active-school projection in a
-- `SECURITY DEFINER` function with a fixed `search_path = public`, and set
-- `security_invoker = true` on `public.public_school_profiles`.

create or replace function public.list_public_school_profiles()
returns table (
  id uuid,
  name_ar text,
  name_en text,
  slug text,
  logo_path text,
  timezone text,
  public_description text,
  vision text,
  mission text,
  objectives text,
  phone text,
  manager_name_ar text,
  manager_name_en text,
  assistant_manager_ar text,
  assistant_manager_en text,
  assistant_manager_2_ar text,
  assistant_manager_2_en text,
  address_ar text,
  address_en text,
  academic_year text,
  vision_ar text,
  vision_en text,
  mission_ar text,
  mission_en text,
  email text,
  assistant_manager_3_ar text,
  assistant_manager_3_en text
)
language sql
stable
security definer
set search_path = public
as $$
  select
    s.id,
    s.name_ar,
    s.name_en,
    s.slug,
    s.logo_path,
    s.timezone,
    ss.public_description,
    ss.vision,
    ss.mission,
    ss.objectives,
    s.phone,
    s.manager_name_ar,
    s.manager_name_en,
    s.assistant_manager_ar,
    s.assistant_manager_en,
    s.assistant_manager_2_ar,
    s.assistant_manager_2_en,
    s.address_ar,
    s.address_en,
    ss.academic_year,
    ss.vision_ar,
    ss.vision_en,
    ss.mission_ar,
    ss.mission_en,
    s.email,
    s.assistant_manager_3_ar,
    s.assistant_manager_3_en
  from public.schools s
  left join public.school_settings ss on ss.school_id = s.id
  where s.is_active;
$$;

revoke all on function public.list_public_school_profiles() from public;
grant execute on function public.list_public_school_profiles() to anon, authenticated, service_role;

create or replace view public.public_school_profiles
with (security_invoker = true) as
select
  id,
  name_ar,
  name_en,
  slug,
  logo_path,
  timezone,
  public_description,
  vision,
  mission,
  objectives,
  phone,
  manager_name_ar,
  manager_name_en,
  assistant_manager_ar,
  assistant_manager_en,
  assistant_manager_2_ar,
  assistant_manager_2_en,
  address_ar,
  address_en,
  academic_year,
  vision_ar,
  vision_en,
  mission_ar,
  mission_en,
  email,
  assistant_manager_3_ar,
  assistant_manager_3_en
from public.list_public_school_profiles();

alter view public.public_school_profiles set (security_invoker = true);

revoke all on public.public_school_profiles from public;
grant select on public.public_school_profiles to anon, authenticated;
