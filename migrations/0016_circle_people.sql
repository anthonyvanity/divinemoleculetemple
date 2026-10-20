alter table study_circle add column if not exists kind text not null default 'house';
alter table study_circle add column if not exists owner_id text not null default '';

create table if not exists circle_member (
  circle_id integer not null references study_circle(id) on delete cascade,
  user_id   text not null,
  primary key (circle_id, user_id)
);
