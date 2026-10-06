-- Publish shared workflow tables to Supabase Realtime for two-device demos
-- and production-style customer/worker synchronization.

do $$
begin
  if exists (
    select 1
    from pg_publication
    where pubname = 'supabase_realtime'
  ) then
    if not exists (
      select 1
      from pg_publication_tables
      where pubname = 'supabase_realtime'
        and schemaname = 'public'
        and tablename = 'service_requests'
    ) then
      alter publication supabase_realtime
      add table public.service_requests;
    end if;

    if not exists (
      select 1
      from pg_publication_tables
      where pubname = 'supabase_realtime'
        and schemaname = 'public'
        and tablename = 'service_proposals'
    ) then
      alter publication supabase_realtime
      add table public.service_proposals;
    end if;

    if not exists (
      select 1
      from pg_publication_tables
      where pubname = 'supabase_realtime'
        and schemaname = 'public'
        and tablename = 'service_request_comments'
    ) then
      alter publication supabase_realtime
      add table public.service_request_comments;
    end if;

    if not exists (
      select 1
      from pg_publication_tables
      where pubname = 'supabase_realtime'
        and schemaname = 'public'
        and tablename = 'job_messages'
    ) then
      alter publication supabase_realtime
      add table public.job_messages;
    end if;

    if not exists (
      select 1
      from pg_publication_tables
      where pubname = 'supabase_realtime'
        and schemaname = 'public'
        and tablename = 'job_material_requests'
    ) then
      alter publication supabase_realtime
      add table public.job_material_requests;
    end if;

    if not exists (
      select 1
      from pg_publication_tables
      where pubname = 'supabase_realtime'
        and schemaname = 'public'
        and tablename = 'app_notifications'
    ) then
      alter publication supabase_realtime
      add table public.app_notifications;
    end if;

    if not exists (
      select 1
      from pg_publication_tables
      where pubname = 'supabase_realtime'
        and schemaname = 'public'
        and tablename = 'service_orders'
    ) then
      alter publication supabase_realtime
      add table public.service_orders;
    end if;
  end if;
end;
$$;
