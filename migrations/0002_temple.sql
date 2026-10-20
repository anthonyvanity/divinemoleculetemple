-- Divine Molecule Temple data model (Base44 entity map).
-- Catalog tables are world-readable. Per-user tables are scoped by user_id TEXT.

create table if not exists course (
  id            serial primary key,
  code          text not null unique,
  title         text not null,
  department    text not null default '',
  access_level  text not null default 'initiate',
  description   text not null default '',
  kind          text not null default 'core' -- core | standalone
);

create table if not exists course_module (
  id            serial primary key,
  course_id     integer not null references course(id) on delete cascade,
  code          text not null,
  title         text not null,
  body          text not null default '',
  sort_order    integer not null default 0,
  access_level  text not null default 'initiate'
);

create table if not exists ceremony (
  id          serial primary key,
  slug        text not null unique,
  title       text not null,
  when_label  text not null default '',
  line        text not null default '',
  starts_at   timestamptz
);

create table if not exists library_work (
  id            serial primary key,
  slug          text not null unique,
  title         text not null,
  kicker        text not null default '',
  line          text not null default '',
  access_level  text not null default 'public'
);

create table if not exists transmission (
  id            serial primary key,
  slug          text not null unique,
  title         text not null,
  path_label    text not null default 'seeker',
  body          text not null default '',
  scheduled_at  timestamptz,
  duration_min  integer,
  video_url     text
);

create table if not exists mission_update (
  id            serial primary key,
  title         text not null,
  body          text not null default '',
  published_at  timestamptz not null default now()
);

create table if not exists study_circle (
  id          serial primary key,
  name        text not null,
  description text not null default ''
);

create table if not exists integration_config (
  key   text primary key,
  value text not null default ''
);

create table if not exists member_profile (
  user_id     text primary key,
  handle      text not null default '',
  flame_name  text not null default '',
  bio         text not null default '',
  sigil       integer not null default 1,
  avatar_url  text,
  joined_at   timestamptz not null default now()
);

create table if not exists user_membership (
  id      text primary key,
  user_id text not null,
  tier    text not null default 'seeker',
  status  text not null default 'active',
  since   timestamptz not null default now()
);
create index if not exists user_membership_user_id_idx on user_membership (user_id);

create table if not exists user_progress (
  id      text primary key,
  user_id text not null,
  node_id text not null,
  status  text not null default 'complete',
  percent integer not null default 100
);
create unique index if not exists user_progress_user_node_idx on user_progress (user_id, node_id);

create table if not exists awakening_enrollment (
  id          text primary key,
  user_id     text not null unique,
  started_at  timestamptz not null default now(),
  days_json   text not null default '[]'
);

create table if not exists daily_ritual_log (
  id            text primary key,
  user_id       text not null,
  ritual        text not null,
  duration_min  integer not null default 0,
  notes         text not null default '',
  logged_at     timestamptz not null default now()
);
create index if not exists daily_ritual_log_user_id_idx on daily_ritual_log (user_id);

create table if not exists meditation_session (
  id            text primary key,
  user_id       text not null,
  duration_min  integer not null default 0,
  notes         text not null default '',
  logged_at     timestamptz not null default now()
);
create index if not exists meditation_session_user_id_idx on meditation_session (user_id);

create table if not exists nexus_entry (
  id          text primary key,
  user_id     text not null,
  body        text not null,
  visibility  text not null default 'anonymous',
  topic       text not null default 'ongoing',
  created_at  timestamptz not null default now()
);
create index if not exists nexus_entry_created_idx on nexus_entry (created_at desc);

create table if not exists friendship (
  id            text primary key,
  user_id       text not null,
  other_user_id text not null,
  status        text not null default 'pending'
);
create unique index if not exists friendship_pair_idx on friendship (user_id, other_user_id);

create table if not exists circle_message (
  id          text primary key,
  circle_id   integer not null references study_circle(id) on delete cascade,
  user_id     text not null,
  body        text not null,
  created_at  timestamptz not null default now()
);

create table if not exists discussion (
  id          text primary key,
  user_id     text not null,
  title       text not null,
  body        text not null,
  created_at  timestamptz not null default now()
);

create table if not exists contribution (
  id          text primary key,
  user_id     text not null,
  tier        text not null,
  amount      integer not null,
  note        text not null default '',
  created_at  timestamptz not null default now()
);
create index if not exists contribution_user_id_idx on contribution (user_id);

create table if not exists card_mail_request (
  id        text primary key,
  user_id   text not null,
  name      text not null default '',
  country   text not null default '',
  street    text not null default '',
  city      text not null default '',
  region    text not null default '',
  zip       text not null default '',
  shipped   boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists contact_request (
  id          text primary key,
  user_id     text,
  name        text not null,
  email       text not null,
  message     text not null,
  created_at  timestamptz not null default now()
);

create table if not exists course_purchase (
  id          text primary key,
  user_id     text not null,
  course_id   integer not null references course(id),
  created_at  timestamptz not null default now()
);

create table if not exists video_guide_booking (
  id          text primary key,
  user_id     text not null,
  guide       text not null default 'Chancellor Monday',
  slot        text not null,
  notes       text not null default '',
  created_at  timestamptz not null default now()
);
create index if not exists video_guide_booking_user_id_idx on video_guide_booking (user_id);
