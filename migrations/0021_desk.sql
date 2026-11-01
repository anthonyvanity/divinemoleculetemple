create table if not exists member_desk (
  user_id text primary key,
  schedule_json text not null default '{}',
  practice_json text not null default '{}',
  last_class text not null default '',
  updated_at timestamptz not null default now()
);
