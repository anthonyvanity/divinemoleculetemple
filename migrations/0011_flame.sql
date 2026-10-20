create table if not exists flame_list (
  email      text primary key,
  created_at timestamptz not null default now()
);
