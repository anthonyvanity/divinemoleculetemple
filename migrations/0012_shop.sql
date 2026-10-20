create table if not exists shop_order (
  id         text primary key,
  user_id    text not null default '',
  email      text not null default '',
  name       text not null default '',
  sku        text not null,
  title      text not null,
  amount     integer not null default 0,
  ship_line  text not null default '',
  city       text not null default '',
  region     text not null default '',
  zip        text not null default '',
  country    text not null default '',
  status     text not null default 'paid',
  created_at timestamptz not null default now()
);
