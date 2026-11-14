-- 0073: Restore security_invoker = false on public.public_school_profiles.
--
-- public.schools and public.school_settings restrict SELECT to authenticated
-- school members, so setting security_invoker = true blocks anonymous visitors
-- from reading the public homepage (see 0035_fix_security_definer_view_and_linter.sql).

alter view public.public_school_profiles set (security_invoker = false);
