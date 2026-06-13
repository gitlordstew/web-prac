create table if not exists primary_contacts (
  id text primary key,
  full_name text not null,
  email text not null,
  phone text,
  relationship text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists patients (
  id text primary key,
  name text not null,
  age integer not null,
  room text not null,
  primary_contact_id text references primary_contacts(id),
  status text not null check (status in ('Stable', 'Improving', 'Watch', 'Critical')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists patient_cases (
  id text primary key,
  patient_id text not null references patients(id) on delete cascade,
  name text not null,
  monitoring_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (patient_id, name)
);

create table if not exists patient_notes (
  id text primary key,
  patient_id text not null references patients(id) on delete cascade,
  author text not null,
  content text not null,
  ai_status text not null check (ai_status in ('Stable', 'Improving', 'Watch', 'Critical')),
  ai_summary text,
  ai_reason text,
  created_at timestamptz not null default now()
);

alter table patients add column if not exists primary_contact_id text references primary_contacts(id);
alter table patient_notes add column if not exists ai_summary text;
alter table patient_notes add column if not exists ai_reason text;

create index if not exists patient_cases_patient_id_idx on patient_cases(patient_id);

alter table primary_contacts enable row level security;
alter table patients enable row level security;
alter table patient_cases enable row level security;
alter table patient_notes enable row level security;

drop policy if exists "Allow public read primary contacts" on primary_contacts;
drop policy if exists "Allow public read patients" on patients;
drop policy if exists "Allow public read patient cases" on patient_cases;
drop policy if exists "Allow public read patient notes" on patient_notes;
drop policy if exists "Allow public insert patient notes" on patient_notes;
drop policy if exists "Allow public update patient status" on patients;

create policy "Allow public read primary contacts"
  on primary_contacts for select
  using (true);

create policy "Allow public read patients"
  on patients for select
  using (true);

create policy "Allow public read patient cases"
  on patient_cases for select
  using (true);

create policy "Allow public read patient notes"
  on patient_notes for select
  using (true);

create policy "Allow public insert patient notes"
  on patient_notes for insert
  with check (true);

create policy "Allow public update patient status"
  on patients for update
  using (true)
  with check (true);

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_name = 'patients'
      and column_name = 'primary_contact'
  ) then
    alter table patients alter column primary_contact drop not null;
  end if;
end $$;

insert into primary_contacts (id, full_name, email, phone, relationship) values
  ('CON-1001', 'Marco Reyes', 'transaction.mclovin@gmail.com', '+1 555 0101', 'Son'),
  ('CON-1002', 'Lena Hart', 'transaction.mclovin@gmail.com', '+1 555 0102', 'Daughter'),
  ('CON-1003', 'Yuki Nakamura', 'transaction.mclovin@gmail.com', '+1 555 0103', 'Grandchild'),
  ('CON-1004', 'Nisha Patel', 'transaction.mclovin@gmail.com', '+1 555 0104', 'Daughter'),
  ('CON-1005', 'Tara Mitchell', 'transaction.mclovin@gmail.com', '+1 555 0105', 'Sister')
on conflict (id) do update set
  full_name = excluded.full_name,
  email = excluded.email,
  phone = excluded.phone,
  relationship = excluded.relationship,
  updated_at = now();

insert into patients (id, name, age, room, primary_contact_id, status) values
  ('PAT-1001', 'Elena Reyes', 78, 'A-104', 'CON-1001', 'Stable'),
  ('PAT-1002', 'Benjamin Hart', 84, 'B-212', 'CON-1002', 'Improving'),
  ('PAT-1003', 'Grace Nakamura', 81, 'C-018', 'CON-1003', 'Watch'),
  ('PAT-1004', 'Samir Patel', 88, 'A-019', 'CON-1004', 'Critical'),
  ('PAT-1005', 'Rosa Mitchell', 76, 'D-305', 'CON-1005', 'Stable')
on conflict (id) do update set
  name = excluded.name,
  age = excluded.age,
  room = excluded.room,
  primary_contact_id = excluded.primary_contact_id,
  status = excluded.status,
  updated_at = now();

insert into patient_cases (id, patient_id, name, monitoring_notes) values
  ('CASE-1001-1', 'PAT-1001', 'Type 2 diabetes', 'Watch appetite, blood sugar symptoms, hydration, dizziness, and wounds.'),
  ('CASE-1001-2', 'PAT-1001', 'Hypertension', 'Track blood pressure, dizziness, headache, fatigue, and medication tolerance.'),
  ('CASE-1002-1', 'PAT-1002', 'Pneumonia', 'Watch cough, fever, breathing effort, oxygen saturation, and chest discomfort.'),
  ('CASE-1002-2', 'PAT-1002', 'COPD', 'Track shortness of breath, wheezing, fatigue, and response to breathing exercises.'),
  ('CASE-1003-1', 'PAT-1003', 'Dementia', 'Watch confusion, agitation, sleep changes, appetite, hydration, and safety risks.'),
  ('CASE-1003-2', 'PAT-1003', 'Dehydration risk', 'Track fluid intake, dizziness, weakness, urine output, and skipped meals.'),
  ('CASE-1004-1', 'PAT-1004', 'Pneumonia', 'Watch fever, labored breathing, oxygen saturation, cough, and chest pain.'),
  ('CASE-1004-2', 'PAT-1004', 'Influenza', 'Track temperature, chills, weakness, hydration, appetite, and respiratory symptoms.'),
  ('CASE-1005-1', 'PAT-1005', 'Osteoarthritis', 'Watch joint pain, mobility, fall risk, medication response, and activity tolerance.')
on conflict (id) do update set
  patient_id = excluded.patient_id,
  name = excluded.name,
  monitoring_notes = excluded.monitoring_notes,
  updated_at = now();

insert into patient_notes (id, patient_id, author, content, ai_status, ai_summary, ai_reason, created_at) values
  ('NOTE-1001-1', 'PAT-1001', 'Nurse Ava', 'Mild fatigue after therapy but recovered after rest and fluids.', 'Stable', 'Fatigue resolved with rest and hydration.', 'No diabetes or blood pressure warning signs were described.', now() - interval '52 hours'),
  ('NOTE-1001-2', 'PAT-1001', 'Nurse Noel', 'Slept through the night with one bathroom assist. No dizziness reported.', 'Stable', 'Sleep was steady and dizziness was denied.', 'The note does not show concerning hypertension or diabetes symptoms.', now() - interval '28 hours'),
  ('NOTE-1001-3', 'PAT-1001', 'Nurse Ava', 'Ate most of breakfast and walked with assistance. Vitals remain within normal range.', 'Stable', 'Appetite, mobility, and vitals are acceptable.', 'Current diabetes and hypertension monitoring points appear controlled.', now() - interval '5 hours'),
  ('NOTE-1002-1', 'PAT-1002', 'Nurse Theo', 'Reported chest tightness in the morning, improved after prescribed treatment.', 'Watch', 'Chest tightness was present but improved after treatment.', 'Pneumonia and COPD make chest symptoms important to monitor closely.', now() - interval '49 hours'),
  ('NOTE-1002-2', 'PAT-1002', 'Nurse Ava', 'Oxygen saturation stayed above care threshold during afternoon checks.', 'Improving', 'Oxygen saturation remained above threshold.', 'Respiratory case indicators are moving in the right direction.', now() - interval '27 hours'),
  ('NOTE-1002-3', 'PAT-1002', 'Nurse Theo', 'Cough is less frequent today. Completed breathing exercises without distress.', 'Improving', 'Cough frequency and breathing exercise tolerance improved.', 'Pneumonia and COPD symptoms are reducing compared with prior notes.', now() - interval '3 hours'),
  ('NOTE-1003-1', 'PAT-1003', 'Nurse Mina', 'Mood calm after morning visit. Completed medication routine.', 'Stable', 'Mood and medication routine were steady.', 'No dementia or dehydration risk escalation was noted.', now() - interval '48 hours'),
  ('NOTE-1003-2', 'PAT-1003', 'Nurse Noel', 'Restless sleep and asked for family twice overnight.', 'Watch', 'Restless sleep and repeated family requests may reflect distress or confusion.', 'Dementia monitoring requires closer attention to sleep and confusion changes.', now() - interval '24 hours'),
  ('NOTE-1003-3', 'PAT-1003', 'Nurse Mina', 'Skipped lunch and seemed confused about the date. Fluids encouraged.', 'Watch', 'Skipped meal, confusion, and hydration support were noted.', 'Dementia and dehydration risk both make this a closer monitoring situation.', now() - interval '2 hours'),
  ('NOTE-1004-1', 'PAT-1004', 'Nurse Theo', 'Complained of chills and weakness after lunch. Extra monitoring started.', 'Watch', 'Chills and weakness required extra monitoring.', 'Influenza and pneumonia symptoms may be worsening and need close review.', now() - interval '47 hours'),
  ('NOTE-1004-2', 'PAT-1004', 'Nurse Ava', 'Low appetite and elevated temperature continued through the evening.', 'Watch', 'Fever and low appetite continued.', 'Ongoing fever in pneumonia and influenza warrants watch status.', now() - interval '23 hours'),
  ('NOTE-1004-3', 'PAT-1004', 'Nurse Theo', 'Fever increased and breathing became labored. Physician notified for urgent review.', 'Critical', 'Fever increased and breathing became labored.', 'Labored breathing with pneumonia and urgent physician notification is critical.', now() - interval '1 hour'),
  ('NOTE-1005-1', 'PAT-1005', 'Nurse Mina', 'Walked independently to the garden with supervision.', 'Improving', 'Mobility was strong with supervision.', 'Osteoarthritis mobility tolerance appears improved.', now() - interval '50 hours'),
  ('NOTE-1005-2', 'PAT-1005', 'Nurse Noel', 'Blood pressure normal during morning and evening checks.', 'Stable', 'Blood pressure checks were normal.', 'No case-related concerns were noted.', now() - interval '26 hours'),
  ('NOTE-1005-3', 'PAT-1005', 'Nurse Mina', 'Enjoyed group activity and finished dinner. No pain reported.', 'Stable', 'Activity, appetite, and pain report were reassuring.', 'Osteoarthritis monitoring is stable with no pain reported.', now() - interval '4 hours')
on conflict (id) do update set
  author = excluded.author,
  content = excluded.content,
  ai_status = excluded.ai_status,
  ai_summary = excluded.ai_summary,
  ai_reason = excluded.ai_reason,
  created_at = excluded.created_at;
