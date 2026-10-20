create table if not exists class_note (
  user_id    text not null,
  code       text not null,
  body       text not null default '',
  updated_at timestamptz not null default now(),
  primary key (user_id, code)
);
