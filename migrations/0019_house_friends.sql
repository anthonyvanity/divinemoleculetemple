insert into member_profile (user_id, handle, flame_name, bio, sigil, avatar_url)
values
  ('house:high-priest', 'HIGHPRIEST', 'Anthony Vanity', 'High Priest of the Divine Molecule Temple.', 1, '/crest-portrait.jpg'),
  ('house:chancellor', 'CHANCELLORMONDAY', 'Chancellor Monday', 'The desk of the house.', 1, '/monday.jpg')
on conflict (user_id) do update set
  handle = excluded.handle,
  flame_name = excluded.flame_name,
  bio = excluded.bio,
  avatar_url = coalesce(nullif(member_profile.avatar_url, ''), excluded.avatar_url);
