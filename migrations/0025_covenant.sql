alter table member_profile add column if not exists listed boolean not null default true;

create table if not exists covenant_acceptance (
  user_id     text not null,
  version     text not null,
  accepted_at timestamptz not null default now(),
  primary key (user_id, version)
);

create table if not exists member_block (
  user_id    text not null,
  blocked_id text not null,
  created_at timestamptz not null default now(),
  primary key (user_id, blocked_id)
);

create table if not exists nexxus_limit (
  user_id    text primary key,
  until      timestamptz,
  reason     text not null default '',
  set_by     text not null default ''
);

create table if not exists member_warning (
  id         text primary key,
  user_id    text not null,
  body       text not null,
  created_at timestamptz not null default now()
);

create table if not exists covenant_appeal (
  id         text primary key,
  user_id    text not null,
  body       text not null,
  status     text not null default 'open',
  decision   text not null default '',
  created_at timestamptz not null default now()
);

insert into integration_config (key, value)
values ('covenant_version', '2026-10-23')
on conflict (key) do nothing;
