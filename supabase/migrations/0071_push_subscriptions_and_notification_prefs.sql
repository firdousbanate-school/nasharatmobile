-- 0071: Web Push subscriptions, per-user notification preferences, and notification delete policy.

-- 1. Allow recipients to delete their own notifications
drop policy if exists notifications_delete on public.notifications;
create policy notifications_delete on public.notifications
  for delete to authenticated
  using (user_id = auth.uid());

-- 2. Web Push device subscriptions (per user / browser endpoint)
create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  school_id uuid not null references public.schools(id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  user_agent text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists push_subscriptions_user_idx
  on public.push_subscriptions (user_id);

create index if not exists push_subscriptions_school_idx
  on public.push_subscriptions (school_id);

alter table public.push_subscriptions enable row level security;

drop policy if exists push_subscriptions_select_own on public.push_subscriptions;
create policy push_subscriptions_select_own on public.push_subscriptions
  for select to authenticated
  using (user_id = auth.uid());

drop policy if exists push_subscriptions_insert_own on public.push_subscriptions;
create policy push_subscriptions_insert_own on public.push_subscriptions
  for insert to authenticated
  with check (user_id = auth.uid() and public.is_school_member(school_id));

drop policy if exists push_subscriptions_update_own on public.push_subscriptions;
create policy push_subscriptions_update_own on public.push_subscriptions
  for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid() and public.is_school_member(school_id));

drop policy if exists push_subscriptions_delete_own on public.push_subscriptions;
create policy push_subscriptions_delete_own on public.push_subscriptions
  for delete to authenticated
  using (user_id = auth.uid());

-- 3. Per-user notification preferences (in-app and push toggles per module)
create table if not exists public.notification_preferences (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  school_id uuid not null references public.schools(id) on delete cascade,
  circular_in_app boolean not null default true,
  circular_push boolean not null default true,
  maintenance_in_app boolean not null default true,
  maintenance_push boolean not null default true,
  calendar_in_app boolean not null default true,
  calendar_push boolean not null default true,
  updated_at timestamptz not null default now()
);

create index if not exists notification_preferences_school_idx
  on public.notification_preferences (school_id);

alter table public.notification_preferences enable row level security;

drop policy if exists notification_preferences_select_own on public.notification_preferences;
create policy notification_preferences_select_own on public.notification_preferences
  for select to authenticated
  using (user_id = auth.uid());

drop policy if exists notification_preferences_insert_own on public.notification_preferences;
create policy notification_preferences_insert_own on public.notification_preferences
  for insert to authenticated
  with check (user_id = auth.uid() and public.is_school_member(school_id));

drop policy if exists notification_preferences_update_own on public.notification_preferences;
create policy notification_preferences_update_own on public.notification_preferences
  for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid() and public.is_school_member(school_id));
