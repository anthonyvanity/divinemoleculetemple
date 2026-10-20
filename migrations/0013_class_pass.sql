create table if not exists class_pass (
  user_id    text not null,
  code       text not null,
  payment_id text not null default '',
  created_at timestamptz not null default now(),
  primary key (user_id, code)
);
