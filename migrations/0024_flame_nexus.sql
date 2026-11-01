insert into integration_config (key, value)
values ('flame_capacity', '10')
on conflict (key) do nothing;

insert into study_circle (name, description, kind)
select 'The Encounter Archive', 'First-person accounts of unusual or spiritual experiences. What you lived, not what the room must believe.', 'house'
where not exists (select 1 from study_circle where name = 'The Encounter Archive');

insert into study_circle (name, description, kind)
select 'Entity Index', 'Compare entities, symbols, and recurring imagery. These are personal accounts, not verified facts.', 'house'
where not exists (select 1 from study_circle where name = 'Entity Index');

insert into study_circle (name, description, kind)
select 'Trip Reports', 'Personal accounts, from beautiful revelations to difficult experiences. No one has to have taken anything to read or to belong.', 'house'
where not exists (select 1 from study_circle where name = 'Trip Reports');

insert into study_circle (name, description, kind)
select 'The Decryption Room', 'The Cosmic Operating System, metaphysical philosophy, and interpretation.', 'house'
where not exists (select 1 from study_circle where name = 'The Decryption Room');

insert into study_circle (name, description, kind)
select 'The Common Room', 'Introductions, friendships, art, music, and general conversation.', 'house'
where not exists (select 1 from study_circle where name = 'The Common Room');

create table if not exists nexus_report (
  id          text primary key,
  reporter_id text not null,
  target_kind text not null,
  target_id   text not null,
  reason      text not null default '',
  created_at  timestamptz not null default now()
);
