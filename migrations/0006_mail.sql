alter table email_outbox add column if not exists sender text not null default 'contact@dmttemple.com';

create table if not exists email_sequence_log (
  id         text primary key,
  user_id    text not null,
  letter_key text not null,
  sent_at    timestamptz not null default now()
);
create unique index if not exists email_sequence_user_letter_idx on email_sequence_log (user_id, letter_key);
