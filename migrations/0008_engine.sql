-- Content is data. The archive and the sequences are records, not pages.

create table if not exists archive_item (
  id              text primary key,
  title           text not null,
  slug            text not null unique,
  content_type    text not null default 'COS',
  volume_number   integer not null default 0,
  chapter_number  integer not null default 0,
  sequence        integer not null default 0,
  subtitle        text not null default '',
  excerpt         text not null default '',
  body            text not null default '',
  access_tier     text not null default 'public',
  published       boolean not null default false,
  featured        boolean not null default false,
  tags            text not null default '',
  cover_image     text not null default '',
  download_url    text not null default '',
  seo_title       text not null default '',
  seo_description text not null default '',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  published_at    timestamptz
);

create table if not exists archive_relation (
  from_id text not null references archive_item(id) on delete cascade,
  to_id   text not null references archive_item(id) on delete cascade,
  primary key (from_id, to_id)
);

create table if not exists program (
  id               text primary key,
  title            text not null,
  slug             text not null unique,
  program_type     text not null default 'SEQUENCE',
  subtitle         text not null default '',
  description      text not null default '',
  access_tier      text not null default 'seeker',
  published        boolean not null default false,
  featured         boolean not null default false,
  completion_title text not null default '',
  completion_body  text not null default '',
  cover_image      text not null default '',
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  published_at     timestamptz
);

create table if not exists program_step (
  id                text primary key,
  program_id        text not null references program(id) on delete cascade,
  step_number       integer not null,
  title             text not null,
  subtitle          text not null default '',
  instruction       text not null default '',
  reflection_prompt text not null default '',
  completion_label  text not null default 'Seal record',
  required_input    boolean not null default false,
  published         boolean not null default true,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  unique (program_id, step_number)
);

create table if not exists program_progress (
  id           text primary key,
  member_id    text not null,
  program_id   text not null references program(id) on delete cascade,
  step_id      text not null references program_step(id) on delete cascade,
  step_number  integer not null,
  reflection   text not null default '',
  completed_at timestamptz not null default now(),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  unique (member_id, program_id, step_id)
);

create table if not exists saved_item (
  id              text primary key,
  member_id       text not null,
  archive_item_id text not null references archive_item(id) on delete cascade,
  created_at      timestamptz not null default now(),
  unique (member_id, archive_item_id)
);

create table if not exists reading_history (
  id              text primary key,
  member_id       text not null,
  archive_item_id text not null references archive_item(id) on delete cascade,
  last_opened_at  timestamptz not null default now(),
  unique (member_id, archive_item_id)
);

create table if not exists admin_audit (
  id         text primary key,
  actor_id   text not null,
  action     text not null,
  target     text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists archive_item_list_idx on archive_item (published, sequence, title);
create index if not exists program_step_order_idx on program_step (program_id, step_number);
create index if not exists program_progress_member_idx on program_progress (member_id, program_id);

insert into program (id, title, slug, program_type, subtitle, description, access_tier, published, featured, completion_title, completion_body, published_at)
values
  (
    'prog-awakening',
    'The 7-Day Awakening',
    '7-day-awakening',
    'SEQUENCE',
    'Seeker to the threshold',
    'The seven-day sequence already named by the Temple. Instructional text beyond the existing day-lines is marked for the Chancellor to enter.',
    'seeker',
    true,
    true,
    'The threshold',
    'Seven records are sealed. The gate is the one you already walked.',
    now()
  ),
  (
    'prog-flame',
    '11: The Flame Protocols',
    '11-flame-protocols',
    'SEQUENCE',
    'Eleven steps',
    'A sequence shell. The Temple has not yet placed the protocol text in the record. Nothing here is invented doctrine.',
    'initiate',
    true,
    false,
    '[CONTENT REQUIRED]',
    '[CONTENT REQUIRED]',
    now()
  )
on conflict (id) do nothing;

insert into program_step (id, program_id, step_number, title, subtitle, instruction, reflection_prompt, required_input, published) values
  ('step-aw-1', 'prog-awakening', 1, 'Zero-Point', 'Day 01', 'Establishing the perceptual baseline.', 'Record what you noticed.', true, true),
  ('step-aw-2', 'prog-awakening', 2, 'Signal & Noise', 'Day 02', 'Separating transmission from interference.', 'Record what you noticed.', true, true),
  ('step-aw-3', 'prog-awakening', 3, 'The Architecture of Belief', 'Day 03', 'Maps are not territories.', 'Record what you noticed.', true, true),
  ('step-aw-4', 'prog-awakening', 4, 'The Filter', 'Day 04', 'Eleven million bits in, forty through.', 'Record what you noticed.', true, true),
  ('step-aw-5', 'prog-awakening', 5, 'The Witness Posture', 'Day 05', 'Thought as data, not identity.', 'Record what you noticed.', true, true),
  ('step-aw-6', 'prog-awakening', 6, 'The Override', 'Day 06', 'Speak as operator, not as costume.', 'Record what you noticed.', true, true),
  ('step-aw-7', 'prog-awakening', 7, 'The Threshold', 'Day 07', 'Stay online. The gate opens.', 'Record what you noticed.', true, true)
on conflict (id) do nothing;

insert into program_step (id, program_id, step_number, title, subtitle, instruction, reflection_prompt, required_input, published)
select
  'step-fl-' || n,
  'prog-flame',
  n,
  'Protocol ' || lpad(n::text, 2, '0'),
  '',
  '[CONTENT REQUIRED]',
  '[CONTENT REQUIRED]',
  false,
  true
from generate_series(1, 11) as n
on conflict (id) do nothing;

insert into archive_item (
  id, title, slug, content_type, volume_number, chapter_number, sequence,
  subtitle, excerpt, body, access_tier, published, featured, tags, published_at
) values
  (
    'arc-cos',
    'The Cosmic Operating System',
    'the-cosmic-operating-system',
    'COS',
    1,
    0,
    0,
    'Volume I',
    'What it is, how it runs, how it hacks you.',
    'The decryption manual. Chapter bodies stay [CONTENT REQUIRED] until the Chancellor enters the Temple text. These titles are the ones already on the COS page.',
    'public',
    true,
    true,
    'cos,volume-i',
    now()
  ),
  ('arc-v1-1', 'Structure of the Simulation', 'structure-of-the-simulation', 'COS', 1, 1, 1, 'Volume I · Chapter 001', 'Named on the COS page. The chapter body is not in the vault yet.', '[CONTENT REQUIRED]', 'public', true, false, 'cos,volume-i', now()),
  ('arc-v1-2', 'Avatar Stack', 'avatar-stack', 'COS', 1, 2, 2, 'Volume I · Chapter 002', 'Named on the COS page. The chapter body is not in the vault yet.', '[CONTENT REQUIRED]', 'public', true, false, 'cos,volume-i', now()),
  ('arc-v1-3', 'Parasite Logic', 'parasite-logic', 'COS', 1, 3, 3, 'Volume I · Chapter 003', 'Named on the COS page. The chapter body is not in the vault yet.', '[CONTENT REQUIRED]', 'public', true, false, 'cos,volume-i', now()),
  ('arc-v1-4', 'Contract Insertion Points', 'contract-insertion-points', 'COS', 1, 4, 4, 'Volume I · Chapter 004', 'Named on the COS page. The chapter body is not in the vault yet.', '[CONTENT REQUIRED]', 'public', true, false, 'cos,volume-i', now()),
  ('arc-v1-5', 'Feedback Loops', 'feedback-loops', 'COS', 1, 5, 5, 'Volume I · Chapter 005', 'Named on the COS page. The chapter body is not in the vault yet.', '[CONTENT REQUIRED]', 'public', true, false, 'cos,volume-i', now()),
  ('arc-v1-6', 'Implantation and Interference', 'implantation-interference', 'COS', 1, 6, 6, 'Volume I · Chapter 006', 'Named on the COS page. The chapter body is not in the vault yet.', '[CONTENT REQUIRED]', 'public', true, false, 'cos,volume-i', now()),
  ('arc-v1-7', 'The Loop Trap', 'the-loop-trap', 'COS', 1, 7, 7, 'Volume I · Chapter 007', 'Named on the COS page. The chapter body is not in the vault yet.', '[CONTENT REQUIRED]', 'public', true, false, 'cos,volume-i', now()),
  ('arc-v1-8', 'Memory Scramble', 'memory-scramble', 'COS', 1, 8, 8, 'Volume I · Chapter 008', 'Named on the COS page. The chapter body is not in the vault yet.', '[CONTENT REQUIRED]', 'public', true, false, 'cos,volume-i', now()),
  ('arc-v1-9', 'Authority Reclaimed', 'authority-reclaimed', 'COS', 1, 9, 9, 'Volume I · Chapter 009', 'Named on the COS page. The chapter body is not in the vault yet.', '[CONTENT REQUIRED]', 'public', true, false, 'cos,volume-i', now()),
  ('arc-v1-10', 'The Flame Core', 'the-flame-core', 'COS', 1, 10, 10, 'Volume I · Chapter 010', 'Named on the COS page. The chapter body is not in the vault yet.', '[CONTENT REQUIRED]', 'seeker', true, false, 'cos,volume-i', now())
on conflict (id) do nothing;
