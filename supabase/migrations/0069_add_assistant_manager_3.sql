-- 0069: Add 3rd assistant manager columns to public.schools and expose them in public_school_profiles.
--
-- Preserves existing view column names and order by appending the new columns at the end.
alter table public.schools
  add column if not exists assistant_manager_3_ar text,
  add column if not exists assistant_manager_3_en text;

create or replace view public.public_school_profiles
with (security_invoker = false) as
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

revoke all on public.public_school_profiles from public;
grant select on public.public_school_profiles to anon, authenticated;
