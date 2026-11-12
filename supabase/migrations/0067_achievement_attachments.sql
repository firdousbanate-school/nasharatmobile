-- 0067: Achievement attachments table and storage bucket

create table if not exists public.achievement_attachments (
  id uuid primary key default gen_random_uuid(),
  achievement_id uuid not null references public.school_achievements(id) on delete cascade,
  school_id uuid not null references public.schools(id) on delete cascade,
  path text not null unique,
  mime text,
  size_bytes bigint,
  uploaded_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now()
);

create index if not exists achievement_attachments_achievement_idx on public.achievement_attachments (achievement_id);
create index if not exists achievement_attachments_school_idx on public.achievement_attachments (school_id);

alter table public.achievement_attachments enable row level security;

grant select, insert, update, delete on public.achievement_attachments to authenticated;
grant select on public.achievement_attachments to anon;

create policy achievement_attachments_select on public.achievement_attachments
  for select to anon, authenticated
  using (
    exists (
      select 1 from public.school_achievements sa
      where sa.id = achievement_id
        and (
          sa.visibility = 'public'
          or public.is_school_member(sa.school_id)
          or public.is_platform_owner()
        )
    )
  );

create policy achievement_attachments_insert on public.achievement_attachments
  for insert to authenticated
  with check (
    public.is_platform_owner()
    or public.has_permission('calendar.manage', school_id)
    or (
      uploaded_by = auth.uid()
      and public.is_school_member(school_id)
    )
  );

create policy achievement_attachments_delete on public.achievement_attachments
  for delete to authenticated
  using (
    public.is_platform_owner()
    or public.has_permission('calendar.manage', school_id)
    or (
      uploaded_by = auth.uid()
      and public.is_school_member(school_id)
    )
  );

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'achievement-attachments',
  'achievement-attachments',
  true,
  26214400,
  array['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
)
on conflict (id) do update set
  file_size_limit = 26214400,
  allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];

create policy "achievement attachments uploaded by school members"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'achievement-attachments'
    and public.is_active_user()
    and (storage.foldername(name))[1] ~ '^[0-9a-fA-F-]{36}$'
  );

create policy "achievement attachments read by public"
  on storage.objects for select to anon, authenticated
  using (bucket_id = 'achievement-attachments');

create policy "achievement attachments deleted by uploaders"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'achievement-attachments'
    and (
      public.is_platform_owner()
      or public.is_active_user()
    )
  );
