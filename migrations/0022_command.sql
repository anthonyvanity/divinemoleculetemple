-- Rank, access, and payment are different facts.

alter table user_membership add column if not exists billing_status text not null default '';
alter table user_membership add column if not exists access_source text not null default '';
alter table user_membership add column if not exists grant_reason text not null default '';
alter table user_membership add column if not exists granted_by text not null default '';
alter table user_membership add column if not exists grant_expires date;
alter table user_membership add column if not exists founding boolean not null default false;
alter table user_membership add column if not exists suspended boolean not null default false;
alter table user_membership add column if not exists campaign text not null default '';

update user_membership
set billing_status = 'paying', access_source = 'subscription'
where coalesce(stripe_subscription, '') <> '' and billing_status = '';

update user_membership
set billing_status = 'scholarship', access_source = 'scholarship'
where scholarship = true and billing_status = '' and coalesce(stripe_subscription, '') = '';

update user_membership
set billing_status = 'complimentary', access_source = 'legacy'
where tier in ('initiate', 'patron')
  and billing_status = ''
  and coalesce(stripe_subscription, '') = ''
  and coalesce(role, 'member') <> 'chancellor';

create table if not exists temple_document (
  id           text primary key,
  kind         text not null default 'prayer',
  title        text not null,
  purpose      text not null default '',
  body         text not null default '',
  access_tier  text not null default 'initiate',
  status       text not null default 'draft',
  publish_at   timestamptz,
  category     text not null default '',
  sort_order   integer not null default 0,
  updated_by   text not null default '',
  updated_at   timestamptz not null default now()
);

create table if not exists document_revision (
  id           text primary key,
  document_id  text not null,
  title        text not null,
  body         text not null,
  status       text not null,
  access_tier  text not null default '',
  actor_id     text not null,
  created_at   timestamptz not null default now()
);

create table if not exists admin_preview (
  user_id  text primary key,
  as_tier  text not null default ''
);

create table if not exists admin_staff (
  user_id    text primary key,
  role       text not null,
  granted_by text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists ascension_campaign (
  id         text primary key,
  name       text not null,
  tier       text not null default 'initiate',
  mode       text not null default 'complimentary_indefinite',
  note       text not null default '',
  created_by text not null default '',
  created_at timestamptz not null default now()
);
