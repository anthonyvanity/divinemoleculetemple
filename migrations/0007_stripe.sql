alter table user_membership add column if not exists stripe_customer text not null default '';
alter table user_membership add column if not exists stripe_subscription text not null default '';

create table if not exists stripe_payment (
  id         text primary key,
  user_id    text not null default '',
  email      text not null default '',
  kind       text not null default '',
  label      text not null default '',
  amount     integer not null default 0,
  currency   text not null default 'usd',
  status     text not null default '',
  created_at timestamptz not null default now()
);
