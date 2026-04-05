-- ============================================================
-- Inkline Schema
-- Run this in your Supabase SQL editor (Dashboard > SQL Editor)
-- ============================================================

-- Enable UUID extension
create extension if not exists "pgcrypto";

-- ─── ENUM TYPES ─────────────────────────────────────────────

create type user_role as enum ('writer', 'artist', 'letterer', 'colorist');
create type project_format as enum ('webtoon', 'manhwa', 'manga', 'comic');
create type content_block_type as enum ('dialogue', 'caption', 'sfx');
create type thread_status as enum ('submitted', 'in_progress', 'draft_received', 'approved');
create type asset_status as enum ('draft', 'approved', 'rejected');

-- ─── USERS ──────────────────────────────────────────────────

create table users (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text not null unique,
  name        text not null,
  role        user_role not null default 'writer',
  avatar_url  text,
  created_at  timestamptz not null default now()
);

alter table users enable row level security;
create policy "Users can view their own profile" on users for select using (auth.uid() = id);
create policy "Users can update their own profile" on users for update using (auth.uid() = id);

-- ─── PROJECTS ───────────────────────────────────────────────

create table projects (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  format      project_format not null default 'webtoon',
  owner_id    uuid not null references users(id) on delete cascade,
  created_at  timestamptz not null default now()
);

alter table projects enable row level security;
create policy "Owner can manage project" on projects for all using (auth.uid() = owner_id);
create policy "Members can view project" on projects for select using (
  exists (select 1 from project_members where project_id = projects.id and user_id = auth.uid())
);

-- ─── PROJECT MEMBERS ────────────────────────────────────────

create table project_members (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid not null references projects(id) on delete cascade,
  user_id     uuid not null references users(id) on delete cascade,
  role        user_role not null,
  invited_at  timestamptz not null default now(),
  unique (project_id, user_id)
);

alter table project_members enable row level security;
create policy "Owner can manage members" on project_members for all using (
  exists (select 1 from projects where id = project_members.project_id and owner_id = auth.uid())
);
create policy "Members can view members" on project_members for select using (
  user_id = auth.uid() or
  exists (select 1 from projects where id = project_members.project_id and owner_id = auth.uid())
);

-- ─── EPISODES ───────────────────────────────────────────────

create table episodes (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid not null references projects(id) on delete cascade,
  number      int not null,
  title       text not null,
  brief       text not null default '',
  created_at  timestamptz not null default now(),
  unique (project_id, number)
);

alter table episodes enable row level security;
create policy "Project access for episodes" on episodes for all using (
  exists (
    select 1 from projects p
    left join project_members pm on pm.project_id = p.id
    where p.id = episodes.project_id
      and (p.owner_id = auth.uid() or pm.user_id = auth.uid())
  )
);

-- ─── PAGES ──────────────────────────────────────────────────

create table pages (
  id          uuid primary key default gen_random_uuid(),
  episode_id  uuid not null references episodes(id) on delete cascade,
  number      int not null,
  layout_note text not null default '',
  unique (episode_id, number)
);

alter table pages enable row level security;
create policy "Project access for pages" on pages for all using (
  exists (
    select 1 from episodes e
    join projects p on p.id = e.project_id
    left join project_members pm on pm.project_id = p.id
    where e.id = pages.episode_id
      and (p.owner_id = auth.uid() or pm.user_id = auth.uid())
  )
);

-- ─── PANELS ─────────────────────────────────────────────────

create table panels (
  id          uuid primary key default gen_random_uuid(),
  page_id     uuid not null references pages(id) on delete cascade,
  number      int not null,
  shot        text not null default '',
  description text not null default '',
  "order"     int not null default 0,
  unique (page_id, number)
);

alter table panels enable row level security;
create policy "Project access for panels" on panels for all using (
  exists (
    select 1 from pages pg
    join episodes e on e.id = pg.episode_id
    join projects p on p.id = e.project_id
    left join project_members pm on pm.project_id = p.id
    where pg.id = panels.page_id
      and (p.owner_id = auth.uid() or pm.user_id = auth.uid())
  )
);

-- ─── CONTENT BLOCKS ─────────────────────────────────────────

create table content_blocks (
  id            uuid primary key default gen_random_uuid(),
  panel_id      uuid not null references panels(id) on delete cascade,
  type          content_block_type not null,
  character     text,
  parenthetical text,
  text          text not null default '',
  "order"       int not null default 0
);

alter table content_blocks enable row level security;
create policy "Project access for content_blocks" on content_blocks for all using (
  exists (
    select 1 from panels pan
    join pages pg on pg.id = pan.page_id
    join episodes e on e.id = pg.episode_id
    join projects p on p.id = e.project_id
    left join project_members pm on pm.project_id = p.id
    where pan.id = content_blocks.panel_id
      and (p.owner_id = auth.uid() or pm.user_id = auth.uid())
  )
);

-- ─── CHARACTERS ─────────────────────────────────────────────

create table characters (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid not null references projects(id) on delete cascade,
  name        text not null,
  role        text not null default '',
  desc        text not null default '',
  color       text not null default '#22C55E'
);

alter table characters enable row level security;
create policy "Project access for characters" on characters for all using (
  exists (
    select 1 from projects p
    left join project_members pm on pm.project_id = p.id
    where p.id = characters.project_id
      and (p.owner_id = auth.uid() or pm.user_id = auth.uid())
  )
);

-- ─── THREADS ────────────────────────────────────────────────

create table threads (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid not null references projects(id) on delete cascade,
  episode_id  uuid not null references episodes(id) on delete cascade,
  label       text not null,
  page_range  text not null default '',
  status      thread_status not null default 'submitted',
  created_at  timestamptz not null default now()
);

alter table threads enable row level security;
create policy "Project access for threads" on threads for all using (
  exists (
    select 1 from projects p
    left join project_members pm on pm.project_id = p.id
    where p.id = threads.project_id
      and (p.owner_id = auth.uid() or pm.user_id = auth.uid())
  )
);

-- ─── MESSAGES ───────────────────────────────────────────────

create table messages (
  id              uuid primary key default gen_random_uuid(),
  thread_id       uuid not null references threads(id) on delete cascade,
  sender_id       uuid not null references users(id) on delete cascade,
  text            text,
  attachment_url  text,
  created_at      timestamptz not null default now()
);

alter table messages enable row level security;
create policy "Project access for messages" on messages for all using (
  exists (
    select 1 from threads t
    join projects p on p.id = t.project_id
    left join project_members pm on pm.project_id = p.id
    where t.id = messages.thread_id
      and (p.owner_id = auth.uid() or pm.user_id = auth.uid())
  )
);

-- ─── PANEL ASSETS ───────────────────────────────────────────

create table panel_assets (
  id            uuid primary key default gen_random_uuid(),
  panel_id      uuid not null references panels(id) on delete cascade,
  uploaded_by   uuid not null references users(id) on delete cascade,
  file_url      text not null,
  status        asset_status not null default 'draft',
  version       int not null default 1,
  created_at    timestamptz not null default now()
);

alter table panel_assets enable row level security;
create policy "Project access for panel_assets" on panel_assets for all using (
  exists (
    select 1 from panels pan
    join pages pg on pg.id = pan.page_id
    join episodes e on e.id = pg.episode_id
    join projects p on p.id = e.project_id
    left join project_members pm on pm.project_id = p.id
    where pan.id = panel_assets.panel_id
      and (p.owner_id = auth.uid() or pm.user_id = auth.uid())
  )
);

-- ─── REALTIME ───────────────────────────────────────────────

-- Enable realtime for collaboration tables
alter publication supabase_realtime add table messages;
alter publication supabase_realtime add table threads;
alter publication supabase_realtime add table panel_assets;

-- ─── AUTO-CREATE USER PROFILE ON SIGNUP ─────────────────────

create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.users (id, email, name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    coalesce((new.raw_user_meta_data->>'role')::user_role, 'writer')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();
