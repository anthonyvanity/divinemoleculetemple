create table if not exists nexus_like (
  entry_id   text not null references nexus_entry(id) on delete cascade,
  user_id    text not null,
  created_at timestamptz not null default now(),
  primary key (entry_id, user_id)
);
