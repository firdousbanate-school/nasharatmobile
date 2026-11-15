-- 0075: Restore authenticated EXECUTE grant on is_last_active_school_admin(uuid).
--
-- Migration 0046_dissociate_school_user.sql grants EXECUTE to authenticated and
-- service_role, and the RLS battery tests call is_last_active_school_admin as
-- an authenticated user.

grant execute on function public.is_last_active_school_admin(uuid) to authenticated, service_role;
