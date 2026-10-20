insert into course (code, title, department, access_level, description, kind) values
  ('FM-101', 'Introduction to the Temple & The Divine Molecule', 'Foundations of the Machine', 'initiate', 'Orientation node of the Temple curriculum.', 'core'),
  ('FM-201', 'Anatomy of the Avatar & The Nine-Body Stack', 'Foundations of the Machine', 'adept', 'What the seeker is wearing.', 'core'),
  ('QT-101', 'Resonance & The Waveform Collapse', 'Quantum Theology', 'initiate', 'The physics of God, belief, and the resonance field.', 'core'),
  ('SD-101', 'The Nature of the Simulation', 'Simulation Decryption', 'initiate', 'Understanding the machine you live inside.', 'core'),
  ('EE-W1', 'Parasitic Architecture & Detection', 'Exorcism Engineering', 'inner', 'Anomalies treated as malicious code.', 'standalone'),
  ('AM-101', 'Identity Alchemy & Field Reconstruction', 'Applied Metaphysics', 'adept', 'Where you stop studying reality and start operating it.', 'standalone')
on conflict (code) do nothing;

insert into course_module (course_id, code, title, body, sort_order, access_level)
select id, 'FM-101-A', 'The axiom', 'Consciousness is not produced by the brain. It is the substrate in which all experience arises.', 1, 'seeker'
from course where code = 'FM-101'
  and not exists (select 1 from course_module where code = 'FM-101-A');

insert into ceremony (slug, title, when_label, line) values
  ('solstice-s', 'Summer Solstice', 'June 21', 'The longest light. Feed the flame until the house is warm.'),
  ('solstice-w', 'Winter Solstice', 'December 21', 'The longest night. Keep the lamp. Do not outsource the heat.'),
  ('equinox-v', 'Vernal Equinox', 'March 20', 'Balance. Neither side of the veil dominates.'),
  ('equinox-a', 'Autumnal Equinox', 'September 22', 'The harvest of what was overwritten. Name it. Release it.')
on conflict (slug) do nothing;

insert into library_work (slug, title, kicker, line, access_level) values
  ('cos', 'The Cosmic Operating System', 'Canon', 'Nine volumes. Source codes. A compiler that turns a true sentence into an executable prayer.', 'public'),
  ('bible', 'DMT Bible', 'Canon', 'The book of the house.', 'initiate'),
  ('codes', 'Divine Codes', 'Canon', 'The operating instructions.', 'initiate')
on conflict (slug) do nothing;

insert into transmission (slug, title, path_label, body) values
  ('welcome-seeker', 'Welcome, Seeker', 'seeker', 'First transmission of the sanctuary.'),
  ('glossary', 'A Seeker''s Glossary', 'seeker', 'Language of the house.'),
  ('grid-primer', 'Beginner''s Primer to the Grid', 'seeker', 'How the field is read.'),
  ('scholarship', 'Scholarship of the Enlightened', 'initiate', 'The academic ministry.')
on conflict (slug) do nothing;

insert into mission_update (title, body)
select 'The house is online', 'Digital sanctuary and modern divinity academy for consciousness studies. Run light. Terminate darkness. Stay online.'
where not exists (select 1 from mission_update);

insert into study_circle (name, description)
select 'The Inner Register', 'Initiates documenting what happened, what it meant, and what changed.'
where not exists (select 1 from study_circle);

insert into integration_config (key, value) values
  ('cash_tag', 'DMTTEMPLE'),
  ('contact_email', 'contact@dmttemple.com'),
  ('calendar', 'daybreak=06:00;nightfall=21:00')
on conflict (key) do nothing;
