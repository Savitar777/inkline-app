-- ============================================================
-- Inkline Schema
-- Run this in your Supabase SQL editor (Dashboard > SQL Editor)
--
-- Structure: enums → tables → indexes → RLS enable → functions → policies
--            → realtime → triggers → RPCs
-- ============================================================

-- Enable UUID extension
create extension if not exists "pgcrypto";

-- ═══════════════════════════════════════════════════════════════
-- 1. ENUM TYPES
-- ═══════════════════════════════════════════════════════════════

create type user_role as enum ('writer', 'artist', 'letterer', 'colorist', 'admin');
create type project_format as enum ('webtoon', 'manhwa', 'manga', 'comic');
create type content_block_type as enum ('dialogue', 'caption', 'sfx');
create type thread_status as enum ('submitted', 'in_progress', 'draft_received', 'approved');
create type asset_status as enum ('draft', 'approved', 'rejected');
create type panel_status as enum ('draft', 'submitted', 'in_progress', 'draft_received', 'changes_requested', 'approved');

-- ═══════════════════════════════════════════════════════════════
-- 2. TABLES
-- ═══════════════════════════════════════════════════════════════

create table users (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text not null unique,
  name        text not null,
  role        user_role not null default 'writer',
  avatar_url  text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table projects (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  format      project_format not null default 'webtoon',
  owner_id    uuid not null references users(id) on delete cascade,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table project_members (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid not null references projects(id) on delete cascade,
  user_id     uuid not null references users(id) on delete cascade,
  role        user_role not null,
  invited_at  timestamptz not null default now(),
  unique (project_id, user_id)
);

create table episodes (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid not null references projects(id) on delete cascade,
  number      int not null,
  title       text not null,
  brief       text not null default '',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (project_id, number)
);

create table pages (
  id          uuid primary key default gen_random_uuid(),
  episode_id  uuid not null references episodes(id) on delete cascade,
  number      int not null,
  layout_note text not null default '',
  unique (episode_id, number)
);

create table panels (
  id          uuid primary key default gen_random_uuid(),
  page_id     uuid not null references pages(id) on delete cascade,
  number      int not null,
  shot        text not null default '',
  description text not null default '',
  "order"     int not null default 0,
  status      panel_status not null default 'draft',
  asset_url   text,
  unique (page_id, number)
);

create table content_blocks (
  id            uuid primary key default gen_random_uuid(),
  panel_id      uuid not null references panels(id) on delete cascade,
  type          content_block_type not null,
  "character"   text,
  parenthetical text,
  "text"        text not null default '',
  "order"       int not null default 0
);

create table characters (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid not null references projects(id) on delete cascade,
  name        text not null,
  role        text not null default '',
  description text not null default '',
  color       text not null default '#22C55E'
);

create table threads (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid not null references projects(id) on delete cascade,
  episode_id  uuid not null references episodes(id) on delete cascade,
  label       text not null,
  page_range  text not null default '',
  status      thread_status not null default 'submitted',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table messages (
  id              uuid primary key default gen_random_uuid(),
  thread_id       uuid not null references threads(id) on delete cascade,
  sender_id       uuid not null references users(id) on delete cascade,
  "text"          text,
  attachment_url  text,
  created_at      timestamptz not null default now()
);

create table panel_assets (
  id            uuid primary key default gen_random_uuid(),
  panel_id      uuid not null references panels(id) on delete cascade,
  uploaded_by   uuid not null references users(id) on delete cascade,
  file_url      text not null,
  status        asset_status not null default 'draft',
  version       int not null default 1,
  created_at    timestamptz not null default now()
);

-- ═══════════════════════════════════════════════════════════════
-- 3. INDEXES
-- ═══════════════════════════════════════════════════════════════

create index idx_projects_owner    on projects        using btree (owner_id);
create index idx_pm_project        on project_members using btree (project_id);
create index idx_pm_user           on project_members using btree (user_id);
create index idx_episodes_project  on episodes        using btree (project_id);
create index idx_pages_episode     on pages           using btree (episode_id);
create index idx_panels_page       on panels          using btree (page_id);
create index idx_cb_panel          on content_blocks  using btree (panel_id);
create index idx_chars_project     on characters      using btree (project_id);
create index idx_threads_project   on threads         using btree (project_id);
create index idx_threads_episode   on threads         using btree (episode_id);
create index idx_messages_thread   on messages        using btree (thread_id);
create index idx_messages_sender   on messages        using btree (sender_id);
create index idx_pa_panel          on panel_assets    using btree (panel_id);
create index idx_threads_created   on threads         using btree (created_at);
create index idx_messages_created  on messages        using btree (created_at);
create index idx_pa_panel_version  on panel_assets    using btree (panel_id, version);

-- ═══════════════════════════════════════════════════════════════
-- 4. ENABLE ROW LEVEL SECURITY
-- ═══════════════════════════════════════════════════════════════

alter table users           enable row level security;
alter table projects        enable row level security;
alter table project_members enable row level security;
alter table episodes        enable row level security;
alter table pages           enable row level security;
alter table panels          enable row level security;
alter table content_blocks  enable row level security;
alter table characters      enable row level security;
alter table threads         enable row level security;
alter table messages        enable row level security;
alter table panel_assets    enable row level security;

-- ═══════════════════════════════════════════════════════════════
-- 5. HELPER FUNCTIONS (used by policies below)
-- ═══════════════════════════════════════════════════════════════

-- Admin check — returns true if the current user has the 'admin' role
create or replace function is_admin()
returns boolean language sql security definer stable set search_path = '' as $$
  select exists (select 1 from public.users where id = auth.uid() and role = 'admin');
$$;

-- Reusable project-membership check for RLS policies
create or replace function is_project_member(_project_id uuid)
returns boolean language sql security definer stable set search_path = '' as $$
  select exists (
    select 1 from public.projects p
    left join public.project_members pm on pm.project_id = p.id and pm.user_id = auth.uid()
    where p.id = _project_id
      and (p.owner_id = auth.uid() or pm.user_id is not null)
  );
$$;

-- Get the caller's role within a project (used for role-specific RLS)
create or replace function get_member_role(_project_id uuid)
returns public.user_role language sql security definer stable set search_path = '' as $$
  select case
    when p.owner_id = auth.uid() then u.role
    else pm.role
  end
  from public.projects p
  left join public.project_members pm on pm.project_id = p.id and pm.user_id = auth.uid()
  left join public.users u on u.id = auth.uid()
  where p.id = _project_id
    and (p.owner_id = auth.uid() or pm.user_id is not null)
  limit 1;
$$;

-- ═══════════════════════════════════════════════════════════════
-- 6. RLS POLICIES
-- ═══════════════════════════════════════════════════════════════

-- ── users ──
create policy "users_select_own"
  on users for select
  using ( (select auth.uid()) = id or is_admin() );

create policy "users_select_teammates"
  on users for select
  using (
    exists (
      select 1 from project_members pm1
      join project_members pm2 on pm2.project_id = pm1.project_id
      where pm1.user_id = (select auth.uid())
        and pm2.user_id = users.id
    )
    or exists (
      select 1 from projects p
      join project_members pm on pm.project_id = p.id
      where p.owner_id = (select auth.uid()) and pm.user_id = users.id
    )
  );

create policy "users_update_own"
  on users for update
  using ( (select auth.uid()) = id or is_admin() )
  with check ( (select auth.uid()) = id or is_admin() );

-- Deny direct INSERT on users — only handle_new_user trigger creates rows
create policy "users_insert_deny"
  on users for insert
  with check ( false );

-- ── projects ──
create policy "projects_select"
  on projects for select to authenticated
  using (
    owner_id = (select auth.uid())
    or exists (
      select 1 from project_members
      where project_id = projects.id and user_id = (select auth.uid())
    )
    or is_admin()
  );

create policy "projects_insert"
  on projects for insert to authenticated
  with check ( owner_id = (select auth.uid()) );

create policy "projects_update"
  on projects for update to authenticated
  using ( owner_id = (select auth.uid()) or is_admin() );

create policy "projects_delete"
  on projects for delete to authenticated
  using ( owner_id = (select auth.uid()) or is_admin() );

-- ── project_members ──
create policy "pm_select"
  on project_members for select to authenticated
  using (
    user_id = (select auth.uid())
    or exists (select 1 from projects where id = project_members.project_id and owner_id = (select auth.uid()))
    or is_admin()
  );

create policy "pm_insert"
  on project_members for insert to authenticated
  with check (
    exists (select 1 from projects where id = project_members.project_id and owner_id = (select auth.uid()))
    or is_admin()
  );

create policy "pm_update"
  on project_members for update to authenticated
  using (
    exists (select 1 from projects where id = project_members.project_id and owner_id = (select auth.uid()))
  );

create policy "pm_delete"
  on project_members for delete to authenticated
  using (
    user_id = (select auth.uid())
    or exists (select 1 from projects where id = project_members.project_id and owner_id = (select auth.uid()))
    or is_admin()
  );

-- ── episodes ──
create policy "episodes_select"
  on episodes for select to authenticated
  using ( is_project_member(project_id) );

create policy "episodes_insert"
  on episodes for insert to authenticated
  with check ( (is_project_member(project_id) and get_member_role(project_id) = 'writer') or is_admin() );

create policy "episodes_update"
  on episodes for update to authenticated
  using ( (is_project_member(project_id) and get_member_role(project_id) = 'writer') or is_admin() );

create policy "episodes_delete"
  on episodes for delete to authenticated
  using ( (is_project_member(project_id) and get_member_role(project_id) = 'writer') or is_admin() );

-- ── pages ──
create policy "pages_select"
  on pages for select to authenticated
  using (
    exists (select 1 from episodes e where e.id = pages.episode_id and is_project_member(e.project_id))
  );

create policy "pages_insert"
  on pages for insert to authenticated
  with check (
    exists (select 1 from episodes e where e.id = pages.episode_id and is_project_member(e.project_id) and get_member_role(e.project_id) = 'writer')
  );

create policy "pages_update"
  on pages for update to authenticated
  using (
    exists (select 1 from episodes e where e.id = pages.episode_id and is_project_member(e.project_id) and get_member_role(e.project_id) = 'writer')
  );

create policy "pages_delete"
  on pages for delete to authenticated
  using (
    exists (select 1 from episodes e where e.id = pages.episode_id and is_project_member(e.project_id) and get_member_role(e.project_id) = 'writer')
  );

-- ── panels ──
create policy "panels_select"
  on panels for select to authenticated
  using (
    exists (
      select 1 from pages pg join episodes e on e.id = pg.episode_id
      where pg.id = panels.page_id and is_project_member(e.project_id)
    )
  );

create policy "panels_insert"
  on panels for insert to authenticated
  with check (
    exists (
      select 1 from pages pg join episodes e on e.id = pg.episode_id
      where pg.id = panels.page_id and is_project_member(e.project_id) and get_member_role(e.project_id) = 'writer'
    )
  );

create policy "panels_update"
  on panels for update to authenticated
  using (
    exists (
      select 1 from pages pg join episodes e on e.id = pg.episode_id
      where pg.id = panels.page_id and is_project_member(e.project_id)
        and get_member_role(e.project_id) in ('writer', 'artist')
    )
  );

create policy "panels_delete"
  on panels for delete to authenticated
  using (
    exists (
      select 1 from pages pg join episodes e on e.id = pg.episode_id
      where pg.id = panels.page_id and is_project_member(e.project_id) and get_member_role(e.project_id) = 'writer'
    )
  );

-- ── content_blocks ──
create policy "content_blocks_select"
  on content_blocks for select to authenticated
  using (
    exists (
      select 1 from panels pan join pages pg on pg.id = pan.page_id join episodes e on e.id = pg.episode_id
      where pan.id = content_blocks.panel_id and is_project_member(e.project_id)
    )
  );

create policy "content_blocks_write"
  on content_blocks for insert to authenticated
  with check (
    exists (
      select 1 from panels pan join pages pg on pg.id = pan.page_id join episodes e on e.id = pg.episode_id
      where pan.id = content_blocks.panel_id and is_project_member(e.project_id) and get_member_role(e.project_id) = 'writer'
    )
  );

create policy "content_blocks_update"
  on content_blocks for update to authenticated
  using (
    exists (
      select 1 from panels pan join pages pg on pg.id = pan.page_id join episodes e on e.id = pg.episode_id
      where pan.id = content_blocks.panel_id and is_project_member(e.project_id) and get_member_role(e.project_id) = 'writer'
    )
  );

create policy "content_blocks_delete"
  on content_blocks for delete to authenticated
  using (
    exists (
      select 1 from panels pan join pages pg on pg.id = pan.page_id join episodes e on e.id = pg.episode_id
      where pan.id = content_blocks.panel_id and is_project_member(e.project_id) and get_member_role(e.project_id) = 'writer'
    )
  );

-- ── characters ──
create policy "characters_select"
  on characters for select to authenticated
  using ( is_project_member(project_id) );

create policy "characters_write"
  on characters for insert to authenticated
  with check ( is_project_member(project_id) and get_member_role(project_id) = 'writer' );

create policy "characters_update"
  on characters for update to authenticated
  using ( is_project_member(project_id) and get_member_role(project_id) = 'writer' );

create policy "characters_delete"
  on characters for delete to authenticated
  using ( is_project_member(project_id) and get_member_role(project_id) = 'writer' );

-- ── threads ──
create policy "threads_select"
  on threads for select to authenticated
  using ( is_project_member(project_id) );

create policy "threads_insert"
  on threads for insert to authenticated
  with check ( is_project_member(project_id) );

create policy "threads_update"
  on threads for update to authenticated
  using ( is_project_member(project_id) );

create policy "threads_delete"
  on threads for delete to authenticated
  using ( is_project_member(project_id) and get_member_role(project_id) = 'writer' );

-- ── messages ──
create policy "messages_select"
  on messages for select to authenticated
  using (
    exists (select 1 from threads t where t.id = messages.thread_id and is_project_member(t.project_id))
  );

create policy "messages_insert"
  on messages for insert to authenticated
  with check (
    exists (select 1 from threads t where t.id = messages.thread_id and is_project_member(t.project_id))
    and sender_id = (select auth.uid())
  );

create policy "messages_update"
  on messages for update to authenticated
  using (
    sender_id = (select auth.uid())
    and exists (select 1 from threads t where t.id = messages.thread_id and is_project_member(t.project_id))
  );

create policy "messages_delete"
  on messages for delete to authenticated
  using (
    sender_id = (select auth.uid())
    and exists (select 1 from threads t where t.id = messages.thread_id and is_project_member(t.project_id))
  );

-- ── panel_assets ──
create policy "panel_assets_select"
  on panel_assets for select to authenticated
  using (
    exists (
      select 1 from panels pan join pages pg on pg.id = pan.page_id join episodes e on e.id = pg.episode_id
      where pan.id = panel_assets.panel_id and is_project_member(e.project_id)
    )
  );

create policy "panel_assets_insert"
  on panel_assets for insert to authenticated
  with check (
    exists (
      select 1 from panels pan join pages pg on pg.id = pan.page_id join episodes e on e.id = pg.episode_id
      where pan.id = panel_assets.panel_id and is_project_member(e.project_id)
        and get_member_role(e.project_id) in ('artist', 'colorist')
    )
    and uploaded_by = (select auth.uid())
  );

create policy "panel_assets_update"
  on panel_assets for update to authenticated
  using (
    uploaded_by = (select auth.uid())
    and exists (
      select 1 from panels pan join pages pg on pg.id = pan.page_id join episodes e on e.id = pg.episode_id
      where pan.id = panel_assets.panel_id and is_project_member(e.project_id)
    )
  );

create policy "panel_assets_delete"
  on panel_assets for delete to authenticated
  using (
    uploaded_by = (select auth.uid())
    and exists (
      select 1 from panels pan join pages pg on pg.id = pan.page_id join episodes e on e.id = pg.episode_id
      where pan.id = panel_assets.panel_id and is_project_member(e.project_id)
    )
  );

-- ═══════════════════════════════════════════════════════════════
-- 7. REALTIME
-- ═══════════════════════════════════════════════════════════════

alter publication supabase_realtime add table messages;
alter publication supabase_realtime add table threads;
alter publication supabase_realtime add table panel_assets;

-- ═══════════════════════════════════════════════════════════════
-- 8. TRIGGERS
-- ═══════════════════════════════════════════════════════════════

-- Auto-create user profile on signup
create or replace function handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.users (id, email, name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    coalesce((new.raw_user_meta_data->>'role')::public.user_role, 'writer')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- Prevent users from changing their own role
create or replace function prevent_role_change()
returns trigger language plpgsql as $$
begin
  -- Admins can change any user's role; non-admins cannot change their own
  if new.role is distinct from old.role then
    if not exists (select 1 from users where id = auth.uid() and role = 'admin') then
      raise exception 'Cannot change your own role';
    end if;
  end if;
  return new;
end;
$$;

create trigger trg_prevent_role_change
  before update on users for each row execute procedure prevent_role_change();

-- Auto-update updated_at timestamps
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_users_updated    before update on users    for each row execute procedure set_updated_at();
create trigger trg_projects_updated before update on projects for each row execute procedure set_updated_at();
create trigger trg_episodes_updated before update on episodes for each row execute procedure set_updated_at();
create trigger trg_threads_updated  before update on threads  for each row execute procedure set_updated_at();

-- ═══════════════════════════════════════════════════════════════
-- 8b. RESOURCE LIMIT TRIGGERS
-- ═══════════════════════════════════════════════════════════════

create or replace function check_episode_limit()
returns trigger language plpgsql as $$
begin
  if (select count(*) from episodes where project_id = new.project_id) >= 50 then
    raise exception 'Episode limit reached (max 50 per project)';
  end if;
  return new;
end;
$$;
create trigger trg_episode_limit before insert on episodes for each row execute procedure check_episode_limit();

create or replace function check_page_limit()
returns trigger language plpgsql as $$
begin
  if (select count(*) from pages where episode_id = new.episode_id) >= 100 then
    raise exception 'Page limit reached (max 100 per episode)';
  end if;
  return new;
end;
$$;
create trigger trg_page_limit before insert on pages for each row execute procedure check_page_limit();

create or replace function check_panel_limit()
returns trigger language plpgsql as $$
begin
  if (select count(*) from panels where page_id = new.page_id) >= 20 then
    raise exception 'Panel limit reached (max 20 per page)';
  end if;
  return new;
end;
$$;
create trigger trg_panel_limit before insert on panels for each row execute procedure check_panel_limit();

create or replace function check_content_block_limit()
returns trigger language plpgsql as $$
begin
  if (select count(*) from content_blocks where panel_id = new.panel_id) >= 50 then
    raise exception 'Content block limit reached (max 50 per panel)';
  end if;
  return new;
end;
$$;
create trigger trg_content_block_limit before insert on content_blocks for each row execute procedure check_content_block_limit();

create or replace function check_message_limit()
returns trigger language plpgsql as $$
begin
  if (select count(*) from messages where thread_id = new.thread_id) >= 1000 then
    raise exception 'Message limit reached (max 1000 per thread)';
  end if;
  return new;
end;
$$;
create trigger trg_message_limit before insert on messages for each row execute procedure check_message_limit();

create or replace function check_character_limit()
returns trigger language plpgsql as $$
begin
  if (select count(*) from characters where project_id = new.project_id) >= 100 then
    raise exception 'Character limit reached (max 100 per project)';
  end if;
  return new;
end;
$$;
create trigger trg_character_limit before insert on characters for each row execute procedure check_character_limit();

create or replace function check_thread_limit()
returns trigger language plpgsql as $$
begin
  if (select count(*) from threads where project_id = new.project_id) >= 50 then
    raise exception 'Thread limit reached (max 50 per project)';
  end if;
  return new;
end;
$$;
create trigger trg_thread_limit before insert on threads for each row execute procedure check_thread_limit();

-- Text length constraints
alter table episodes add constraint chk_brief_length check (length(brief) <= 5000);
alter table panels add constraint chk_description_length check (length(description) <= 5000);
alter table content_blocks add constraint chk_text_length check (length("text") <= 10000);
alter table messages add constraint chk_message_text_length check (length("text") <= 5000);

-- ═══════════════════════════════════════════════════════════════
-- 9. RPC FUNCTIONS
-- ═══════════════════════════════════════════════════════════════

-- Look up user by email for invitations (bypasses users RLS)
-- Requires caller to be the owner of the specified project
create or replace function find_user_by_email(lookup_email text, for_project_id uuid default null)
returns uuid language plpgsql security definer stable set search_path = '' as $$
declare
  found_id uuid;
begin
  -- If a project was specified, verify the caller owns it
  if for_project_id is not null then
    if not exists (
      select 1 from public.projects where id = for_project_id and owner_id = auth.uid()
    ) then
      raise exception 'Only project owners can look up users by email';
    end if;
  end if;

  select id into found_id from public.users where email = lookup_email limit 1;
  return found_id;
end;
$$;
