alter table user_membership add column if not exists scholarship boolean not null default false;
alter table user_membership add column if not exists discount_pct integer not null default 0;
alter table user_membership add column if not exists role text not null default 'member';
alter table user_membership add column if not exists note text not null default '';

create table if not exists email_outbox (
  id          text primary key,
  subject     text not null,
  body        text not null,
  audience    text not null default 'all',
  created_by  text not null,
  status      text not null default 'queued',
  created_at  timestamptz not null default now()
);
