create table if not exists house_file (
  id          text primary key,
  kind        text not null,
  title       text not null,
  body        text not null default '',
  gate        text not null default 'initiate',
  filename    text not null default '',
  mime        text not null default '',
  bytes       bytea,
  created_by  text not null,
  created_at  timestamptz not null default now()
);

create table if not exists auth_bridge (
  id          text primary key,
  token       text not null,
  expires_at  timestamptz not null,
  used        boolean not null default false
);
