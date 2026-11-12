-- 0065: Remove the EXECUTE grants that Supabase's default privileges left on
-- anon and authenticated for server-only functions.
--
-- 0064 revoked `consume_rate_limit` from PUBLIC only. Supabase's default
-- privileges grant EXECUTE on every new function in schema `public` explicitly
-- to anon, authenticated and service_role, and `revoke ... from public` does not
-- remove those explicit ACL entries. The function therefore stayed callable with
-- the anonymous key, which let any client write to `rate_limit_counters` through
-- it. Confirmed on the linked project: the ACL read
-- `postgres=X | anon=X | authenticated=X | service_role=X` and a POST to
-- /rest/v1/rpc/consume_rate_limit with the publishable key returned 200.
--
-- 0052 has the same gap for `set_audit_actor`: it revoked from anon only, so the
-- inherited PUBLIC grant kept the function callable anonymously.
--
-- Convention from 0023: revoke from public, anon and authenticated, then grant
-- EXECUTE to exactly the roles that need it.

-- Server-only: the app calls this with the service-role client.
revoke all on function public.consume_rate_limit(text, integer, integer)
  from public, anon, authenticated;
grant execute on function public.consume_rate_limit(text, integer, integer)
  to service_role;

-- Signed-in users still need this to attribute their own writes; anon never does.
revoke all on function public.set_audit_actor(uuid, text)
  from public, anon;
grant execute on function public.set_audit_actor(uuid, text)
  to authenticated, service_role;
