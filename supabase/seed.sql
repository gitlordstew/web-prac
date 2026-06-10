create table if not exists patients (
  id text primary key,
  name text not null,
  age integer not null,
  room text not null,
  primary_contact text not null,
  status text not null check (status in ('Stable', 'Improving', 'Watch', 'Critical')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists patient_notes (
  id text primary key,
  patient_id text not null references patients(id) on delete cascade,
  author text not null,
  content text not null,
  ai_status text not null check (ai_status in ('Stable', 'Improving', 'Watch', 'Critical')),
  created_at timestamptz not null default now()
);

insert into patients (id, name, age, room, primary_contact, status) values
  ('PAT-1001', 'Elena Reyes', 78, 'A-104', 'Marco Reyes', 'Stable'),
  ('PAT-1002', 'Benjamin Hart', 84, 'B-212', 'Lena Hart', 'Improving'),
  ('PAT-1003', 'Grace Nakamura', 81, 'C-018', 'Yuki Nakamura', 'Watch'),
  ('PAT-1004', 'Samir Patel', 88, 'A-019', 'Nisha Patel', 'Critical'),
  ('PAT-1005', 'Rosa Mitchell', 76, 'D-305', 'Tara Mitchell', 'Stable')
on conflict (id) do update set
  name = excluded.name,
  age = excluded.age,
  room = excluded.room,
  primary_contact = excluded.primary_contact,
  status = excluded.status,
  updated_at = now();

insert into patient_notes (id, patient_id, author, content, ai_status, created_at) values
  ('NOTE-1001-1', 'PAT-1001', 'Nurse Ava', 'Mild fatigue after therapy but recovered after rest and fluids.', 'Stable', now() - interval '52 hours'),
  ('NOTE-1001-2', 'PAT-1001', 'Nurse Noel', 'Slept through the night with one bathroom assist. No dizziness reported.', 'Stable', now() - interval '28 hours'),
  ('NOTE-1001-3', 'PAT-1001', 'Nurse Ava', 'Ate most of breakfast and walked with assistance. Vitals remain within normal range.', 'Stable', now() - interval '5 hours'),
  ('NOTE-1002-1', 'PAT-1002', 'Nurse Theo', 'Reported chest tightness in the morning, improved after prescribed treatment.', 'Watch', now() - interval '49 hours'),
  ('NOTE-1002-2', 'PAT-1002', 'Nurse Ava', 'Oxygen saturation stayed above care threshold during afternoon checks.', 'Improving', now() - interval '27 hours'),
  ('NOTE-1002-3', 'PAT-1002', 'Nurse Theo', 'Cough is less frequent today. Completed breathing exercises without distress.', 'Improving', now() - interval '3 hours'),
  ('NOTE-1003-1', 'PAT-1003', 'Nurse Mina', 'Mood calm after morning visit. Completed medication routine.', 'Stable', now() - interval '48 hours'),
  ('NOTE-1003-2', 'PAT-1003', 'Nurse Noel', 'Restless sleep and asked for family twice overnight.', 'Watch', now() - interval '24 hours'),
  ('NOTE-1003-3', 'PAT-1003', 'Nurse Mina', 'Skipped lunch and seemed confused about the date. Fluids encouraged.', 'Watch', now() - interval '2 hours'),
  ('NOTE-1004-1', 'PAT-1004', 'Nurse Theo', 'Complained of chills and weakness after lunch. Extra monitoring started.', 'Watch', now() - interval '47 hours'),
  ('NOTE-1004-2', 'PAT-1004', 'Nurse Ava', 'Low appetite and elevated temperature continued through the evening.', 'Watch', now() - interval '23 hours'),
  ('NOTE-1004-3', 'PAT-1004', 'Nurse Theo', 'Fever increased and breathing became labored. Physician notified for urgent review.', 'Critical', now() - interval '1 hour'),
  ('NOTE-1005-1', 'PAT-1005', 'Nurse Mina', 'Walked independently to the garden with supervision.', 'Improving', now() - interval '50 hours'),
  ('NOTE-1005-2', 'PAT-1005', 'Nurse Noel', 'Blood pressure normal during morning and evening checks.', 'Stable', now() - interval '26 hours'),
  ('NOTE-1005-3', 'PAT-1005', 'Nurse Mina', 'Enjoyed group activity and finished dinner. No pain reported.', 'Stable', now() - interval '4 hours')
on conflict (id) do update set
  author = excluded.author,
  content = excluded.content,
  ai_status = excluded.ai_status,
  created_at = excluded.created_at;
