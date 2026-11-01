-- Pass the Flame. Sponsorship money and scholarship access are different rows.

create table if not exists flame_waitlist (
  user_id    text primary key,
  status     text not null default 'pending',
  note       text not null default '',
  notify     boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists flame_sponsor (
  id                   text primary key,
  user_id              text not null,
  status               text not null default 'active',
  amount_cents         integer not null default 2200,
  stripe_subscription  text not null default '',
  stripe_session       text not null default '',
  period_end           timestamptz,
  started_at           timestamptz not null default now(),
  canceled_at          timestamptz
);

create unique index if not exists flame_sponsor_session_idx on flame_sponsor (stripe_session);
create unique index if not exists flame_one_open_sponsor on flame_sponsor (user_id) where status in ('active', 'past_due', 'paused');

create table if not exists flame_award (
  id           text primary key,
  sponsor_id   text not null default '',
  recipient_id text not null,
  anon_code    text not null,
  status       text not null default 'active',
  funding      text not null default 'sponsored',
  consent      text not null default 'private',
  reason       text not null default '',
  granted_by   text not null default '',
  expires      date,
  grace_until  date,
  created_at   timestamptz not null default now()
);

create unique index if not exists flame_one_open_recipient on flame_award (recipient_id) where status in ('active', 'grace');

create table if not exists flame_message (
  id         text primary key,
  award_id   text not null,
  from_role  text not null,
  body       text not null,
  status     text not null default 'pending',
  created_at timestamptz not null default now()
);
