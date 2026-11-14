-- 0074: Restore EXECUTE grants for authenticated on bootstrap_platform_owner and set_audit_actor.
--
-- Both RPCs are called with the signed-in user's session client
-- (src/actions/auth/bootstrapPlatformOwnerClaim.ts and src/lib/audit/setAuditActor.ts)
-- and enforce caller identity/ownership inside the functions (0020, 0052, 0065).

grant execute on function public.bootstrap_platform_owner(uuid) to authenticated, service_role;
grant execute on function public.set_audit_actor(uuid, text) to authenticated, service_role;
