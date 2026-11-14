-- 0071: Harden achievement_attachments table & storage RLS policies.
--
-- Aligns achievement_attachments INSERT/DELETE and storage.objects INSERT/DELETE
-- with school_achievements (0049): requires platform owner or `calendar.manage`
-- scoped to the target school, and validates parent school/achievement ownership.

alter policy achievement_attachments_insert on public.achievement_attachments
  with check (
    (
      public.is_platform_owner()
      or public.has_permission('calendar.manage', school_id)
    )
    and exists (
      select 1 from public.school_achievements sa
      where sa.id = achievement_id
        and sa.school_id = school_id
    )
  );

alter policy achievement_attachments_delete on public.achievement_attachments
  using (
    public.is_platform_owner()
    or public.has_permission('calendar.manage', school_id)
  );

alter policy "achievement attachments uploaded by school members"
  on storage.objects
  with check (
    bucket_id = 'achievement-attachments'
    and public.is_active_user()
    and (storage.foldername(name))[1] ~ '^[0-9a-fA-F-]{36}$'
    and (
      public.is_platform_owner()
      or public.has_permission('calendar.manage', ((storage.foldername(name))[1])::uuid)
    )
    and exists (
      select 1 from public.schools s where s.id = ((storage.foldername(name))[1])::uuid
    )
  );

alter policy "achievement attachments deleted by uploaders"
  on storage.objects
  using (
    bucket_id = 'achievement-attachments'
    and public.is_active_user()
    and (storage.foldername(name))[1] ~ '^[0-9a-fA-F-]{36}$'
    and (
      public.is_platform_owner()
      or public.has_permission('calendar.manage', ((storage.foldername(name))[1])::uuid)
    )
  );
