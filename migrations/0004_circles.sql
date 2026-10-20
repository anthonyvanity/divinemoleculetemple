insert into study_circle (name, description)
select 'Scholarship of the Enlightened', 'Working group for FM-201 and the architecture of consciousness.'
where not exists (select 1 from study_circle where name = 'Scholarship of the Enlightened');

insert into study_circle (name, description)
select 'Night Watch', 'After-hours integration. Dreams, static, and the perimeter.'
where not exists (select 1 from study_circle where name = 'Night Watch');

insert into study_circle (name, description)
select 'Integration Lab', 'What happened, what it meant, what changed. Group processing.'
where not exists (select 1 from study_circle where name = 'Integration Lab');

insert into study_circle (name, description)
select 'The Grid', 'Open channel for seekers still mapping the field.'
where not exists (select 1 from study_circle where name = 'The Grid');

create index if not exists circle_message_circle_idx on circle_message (circle_id, created_at);
