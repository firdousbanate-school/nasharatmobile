-- Shared (cross-instance) rate-limit counters for authentication endpoints.
--
-- The in-process limiter in the app only counts per serverless instance. This adds a small
-- database-backed fixed-window counter so login / password-reset / owner-claim limits hold
-- across instances. The table is server-only: RLS is enabled with NO policies (deny by default
-- for anon and authenticated) and only the service role may call the function.
create table if not exists public.rate_limit_counters (
  key text primary key,
  window_start timestamptz not null default now(),
  count integer not null default 0
);

alter table public.rate_limit_counters enable row level security;
revoke all on public.rate_limit_counters from anon, authenticated;

-- Atomically consumes one token for `p_key`. Returns true while the caller is within
-- `p_limit` attempts per `p_window_seconds`, false once the limit is exceeded.
create or replace function public.consume_rate_limit(
  p_key text,
  p_limit integer,
  p_window_seconds integer
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count integer;
begin
  if p_key is null or length(p_key) = 0 or length(p_key) > 300
     or p_limit is null or p_limit < 1
     or p_window_seconds is null or p_window_seconds < 1 then
    raise exception 'invalid rate limit arguments' using errcode = '22023';
  end if;

  insert into public.rate_limit_counters as c (key, window_start, count)
  values (p_key, now(), 1)
  on conflict (key) do update
    set window_start = case
          when c.window_start <= now() - make_interval(secs => p_window_seconds) then now()
          else c.window_start
        end,
        count = case
          when c.window_start <= now() - make_interval(secs => p_window_seconds) then 1
          else c.count + 1
        end
  returning c.count into v_count;

  -- Opportunistic cleanup keeps the table small without a scheduled job.
  if random() < 0.01 then
    delete from public.rate_limit_counters where window_start < now() - interval '1 day';
  end if;

  return v_count <= p_limit;
end;
$$;

revoke all on function public.consume_rate_limit(text, integer, integer) from public;
grant execute on function public.consume_rate_limit(text, integer, integer) to service_role;
