create table if not exists nexus_comment (
  id         text primary key,
  entry_id   text not null references nexus_entry(id) on delete cascade,
  user_id    text not null,
  body       text not null,
  created_at timestamptz not null default now()
);
create index if not exists nexus_comment_entry_idx on nexus_comment (entry_id, created_at);
