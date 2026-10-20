create table if not exists reading_mark (
  user_id    text not null,
  work       text not null,
  page       integer not null default 0,
  updated_at timestamptz not null default now(),
  primary key (user_id, work)
);

create table if not exists member_code (
  id         text primary key,
  user_id    text not null,
  title      text not null default '',
  body       text not null,
  visibility text not null default 'private',
  created_at timestamptz not null default now()
);
create index if not exists member_code_user_idx on member_code (user_id, created_at desc);
