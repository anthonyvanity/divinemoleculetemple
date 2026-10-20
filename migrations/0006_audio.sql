create table if not exists house_audio (
  id          text primary key,
  title       text not null,
  path_label  text not null default 'seeker',
  mime        text not null default 'audio/mpeg',
  bytes       bytea not null,
  created_by  text not null,
  created_at  timestamptz not null default now()
);
