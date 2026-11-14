-- 0072: Qualify achievement_attachments.school_id in achievement_attachments_insert policy
-- so it compares against the inserted row's school_id rather than sa.school_id = sa.school_id.

alter policy achievement_attachments_insert on public.achievement_attachments
  with check (
    (
      public.is_platform_owner()
      or public.has_permission('calendar.manage', school_id)
    )
    and exists (
      select 1 from public.school_achievements sa
      where sa.id = achievement_id
        and sa.school_id = achievement_attachments.school_id
    )
  );
