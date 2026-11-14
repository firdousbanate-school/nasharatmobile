-- 0070: Revoke direct RPC EXECUTE grants on trigger/event-trigger functions
-- and server-only helper `is_last_active_school_admin` from PUBLIC, anon, and authenticated.
--
-- Trigger functions execute under the trigger's own SECURITY DEFINER context and
-- must never be directly callable via PostgREST `/rest/v1/rpc/*`.
-- `is_last_active_school_admin(uuid)` is only called by `service_role` (adminClient)
-- and inside SECURITY DEFINER functions/triggers owned by `postgres`.

revoke all on function public.audit_row_change() from public, anon, authenticated;
revoke all on function public.enforce_assignment_integrity() from public, anon, authenticated;
revoke all on function public.enforce_circular_scope() from public, anon, authenticated;
revoke all on function public.enforce_circular_status_transition() from public, anon, authenticated;
revoke all on function public.enforce_dissociation_consistency() from public, anon, authenticated;
revoke all on function public.enforce_maintenance_update_scope() from public, anon, authenticated;
revoke all on function public.enforce_notification_read_only() from public, anon, authenticated;
revoke all on function public.enforce_profile_self_update() from public, anon, authenticated;
revoke all on function public.enforce_role_key_reserved() from public, anon, authenticated;
revoke all on function public.rls_auto_enable() from public, anon, authenticated;
revoke all on function public.sync_maintenance_request_operator() from public, anon, authenticated;
revoke all on function public.sync_profile_department_to_assignments() from public, anon, authenticated;

revoke all on function public.is_last_active_school_admin(uuid) from public, anon, authenticated;
grant execute on function public.is_last_active_school_admin(uuid) to service_role;
