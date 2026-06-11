import { hasSupabaseConfig, supabase } from "./supabase";

export type PatientStatus = "Stable" | "Improving" | "Watch" | "Critical";

export type PatientNote = {
  id: string;
  patientId: string;
  content: string;
  status: PatientStatus;
  createdAt: string;
  author: string;
};

export type Patient = {
  id: string;
  name: string;
  age: number;
  room: string;
  primaryContactId: string;
  primaryContact: string;
  primaryContactEmail: string;
  status: PatientStatus;
  notes: PatientNote[];
};

export type PatientNoteFormData = {
  patientId: string;
  author: string;
  note: string;
};

const n8nWebhookUrl = import.meta.env.VITE_N8N_WEBHOOK_URL as string | undefined;
const n8nDataWebhookUrl = import.meta.env.VITE_N8N_DATA_WEBHOOK_URL as string | undefined;

export const patientStatuses: PatientStatus[] = ["Stable", "Improving", "Watch", "Critical"];

const hoursAgo = (hours: number) => new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();

export const seedPatients: Patient[] = [
  {
    id: "PAT-1001",
    name: "Elena Reyes",
    age: 78,
    room: "A-104",
    primaryContactId: "CON-1001",
    primaryContact: "Marco Reyes",
    primaryContactEmail: "transaction.mclovin@gmail.com",
    status: "Stable",
    notes: [
      {
        id: "NOTE-1001-3",
        patientId: "PAT-1001",
        content: "Ate most of breakfast and walked with assistance. Vitals remain within normal range.",
        status: "Stable",
        createdAt: hoursAgo(5),
        author: "Nurse Ava",
      },
      {
        id: "NOTE-1001-2",
        patientId: "PAT-1001",
        content: "Slept through the night with one bathroom assist. No dizziness reported.",
        status: "Stable",
        createdAt: hoursAgo(28),
        author: "Nurse Noel",
      },
      {
        id: "NOTE-1001-1",
        patientId: "PAT-1001",
        content: "Mild fatigue after therapy but recovered after rest and fluids.",
        status: "Stable",
        createdAt: hoursAgo(52),
        author: "Nurse Ava",
      },
    ],
  },
  {
    id: "PAT-1002",
    name: "Benjamin Hart",
    age: 84,
    room: "B-212",
    primaryContactId: "CON-1002",
    primaryContact: "Lena Hart",
    primaryContactEmail: "transaction.mclovin@gmail.com",
    status: "Improving",
    notes: [
      {
        id: "NOTE-1002-3",
        patientId: "PAT-1002",
        content: "Cough is less frequent today. Completed breathing exercises without distress.",
        status: "Improving",
        createdAt: hoursAgo(3),
        author: "Nurse Theo",
      },
      {
        id: "NOTE-1002-2",
        patientId: "PAT-1002",
        content: "Oxygen saturation stayed above care threshold during afternoon checks.",
        status: "Improving",
        createdAt: hoursAgo(27),
        author: "Nurse Ava",
      },
      {
        id: "NOTE-1002-1",
        patientId: "PAT-1002",
        content: "Reported chest tightness in the morning, improved after prescribed treatment.",
        status: "Watch",
        createdAt: hoursAgo(49),
        author: "Nurse Theo",
      },
    ],
  },
  {
    id: "PAT-1003",
    name: "Grace Nakamura",
    age: 81,
    room: "C-018",
    primaryContactId: "CON-1003",
    primaryContact: "Yuki Nakamura",
    primaryContactEmail: "transaction.mclovin@gmail.com",
    status: "Watch",
    notes: [
      {
        id: "NOTE-1003-3",
        patientId: "PAT-1003",
        content: "Skipped lunch and seemed confused about the date. Fluids encouraged.",
        status: "Watch",
        createdAt: hoursAgo(2),
        author: "Nurse Mina",
      },
      {
        id: "NOTE-1003-2",
        patientId: "PAT-1003",
        content: "Restless sleep and asked for family twice overnight.",
        status: "Watch",
        createdAt: hoursAgo(24),
        author: "Nurse Noel",
      },
      {
        id: "NOTE-1003-1",
        patientId: "PAT-1003",
        content: "Mood calm after morning visit. Completed medication routine.",
        status: "Stable",
        createdAt: hoursAgo(48),
        author: "Nurse Mina",
      },
    ],
  },
  {
    id: "PAT-1004",
    name: "Samir Patel",
    age: 88,
    room: "A-019",
    primaryContactId: "CON-1004",
    primaryContact: "Nisha Patel",
    primaryContactEmail: "transaction.mclovin@gmail.com",
    status: "Critical",
    notes: [
      {
        id: "NOTE-1004-3",
        patientId: "PAT-1004",
        content: "Fever increased and breathing became labored. Physician notified for urgent review.",
        status: "Critical",
        createdAt: hoursAgo(1),
        author: "Nurse Theo",
      },
      {
        id: "NOTE-1004-2",
        patientId: "PAT-1004",
        content: "Low appetite and elevated temperature continued through the evening.",
        status: "Watch",
        createdAt: hoursAgo(23),
        author: "Nurse Ava",
      },
      {
        id: "NOTE-1004-1",
        patientId: "PAT-1004",
        content: "Complained of chills and weakness after lunch. Extra monitoring started.",
        status: "Watch",
        createdAt: hoursAgo(47),
        author: "Nurse Theo",
      },
    ],
  },
  {
    id: "PAT-1005",
    name: "Rosa Mitchell",
    age: 76,
    room: "D-305",
    primaryContactId: "CON-1005",
    primaryContact: "Tara Mitchell",
    primaryContactEmail: "transaction.mclovin@gmail.com",
    status: "Stable",
    notes: [
      {
        id: "NOTE-1005-3",
        patientId: "PAT-1005",
        content: "Enjoyed group activity and finished dinner. No pain reported.",
        status: "Stable",
        createdAt: hoursAgo(4),
        author: "Nurse Mina",
      },
      {
        id: "NOTE-1005-2",
        patientId: "PAT-1005",
        content: "Blood pressure normal during morning and evening checks.",
        status: "Stable",
        createdAt: hoursAgo(26),
        author: "Nurse Noel",
      },
      {
        id: "NOTE-1005-1",
        patientId: "PAT-1005",
        content: "Walked independently to the garden with supervision.",
        status: "Improving",
        createdAt: hoursAgo(50),
        author: "Nurse Mina",
      },
    ],
  },
];

type PatientRow = {
  id: string;
  name?: string | null;
  age?: number | null;
  room?: string | null;
  status?: string | null;
  primary_contact_id?: string | null;
  primary_contact_name?: string | null;
  primary_contact_email?: string | null;
  primary_contact?: {
    id?: string;
    name?: string;
    email?: string;
  } | null;
};

type PatientNoteRow = {
  id: string;
  patient_id?: string | null;
  content?: string | null;
  ai_status?: string | null;
  status?: string | null;
  created_at?: string | null;
  author?: string | null;
};

const isPatientStatus = (value: unknown): value is PatientStatus =>
  typeof value === "string" && patientStatuses.includes(value as PatientStatus);

const normalizeStatus = (value: unknown): PatientStatus =>
  isPatientStatus(value) ? value : "Watch";

const normalizeNote = (row: PatientNoteRow): PatientNote => ({
  id: String(row.id),
  patientId: String(row.patient_id ?? ""),
  content: row.content ?? "No note content.",
  status: normalizeStatus(row.ai_status ?? row.status),
  createdAt: row.created_at ?? new Date().toISOString(),
  author: row.author ?? "Unknown caregiver",
});

const normalizePatient = (row: PatientRow, notes: PatientNote[]): Patient => {
  const contact = row.primary_contact;
  const patientNotes = notes
    .filter((note) => note.patientId === row.id)
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));

  return {
    id: String(row.id),
    name: row.name ?? "Unnamed patient",
    age: Number(row.age ?? 0),
    room: row.room ?? "Unassigned",
    primaryContactId: row.primary_contact_id ?? contact?.id ?? "",
    primaryContact: row.primary_contact_name ?? contact?.name ?? "Primary contact",
    primaryContactEmail: row.primary_contact_email ?? contact?.email ?? "",
    status: normalizeStatus(row.status ?? patientNotes[0]?.status),
    notes: patientNotes,
  };
};

const normalizeBoardPayload = (payload: unknown): Patient[] => {
  const data = payload as {
    patients?: Patient[];
    data?: { patients?: Patient[] };
  };

  const patients = data.patients ?? data.data?.patients ?? [];

  return patients.map((patient) => ({
    ...patient,
    status: normalizeStatus(patient.status),
    notes: (patient.notes ?? []).map((note) => ({
      ...note,
      status: normalizeStatus(note.status),
    })),
  }));
};

async function fetchPatientBoardFromN8n(): Promise<Patient[]> {
  if (!n8nDataWebhookUrl) {
    throw new Error("VITE_N8N_DATA_WEBHOOK_URL is not configured.");
  }

  const response = await fetch(n8nDataWebhookUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      event: "patient_board.list",
      limit: 50,
    }),
  });

  if (!response.ok) {
    throw new Error(`n8n data fetch returned ${response.status}.`);
  }

  return normalizeBoardPayload(await response.json());
}

async function fetchPatientBoardFromSupabase(): Promise<Patient[]> {
  if (!hasSupabaseConfig || !supabase) {
    throw new Error("Supabase is not configured.");
  }

  const [{ data: patientRows, error: patientError }, { data: noteRows, error: noteError }] =
    await Promise.all([
      supabase.from("patients").select("*").order("name", { ascending: true }),
      supabase
        .from("patient_notes")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100),
    ]);

  if (patientError) {
    throw new Error(patientError.message);
  }

  if (noteError) {
    throw new Error(noteError.message);
  }

  const notes = ((noteRows ?? []) as PatientNoteRow[]).map(normalizeNote);

  return ((patientRows ?? []) as PatientRow[]).map((patient) => normalizePatient(patient, notes));
}

export async function fetchPatientBoard(): Promise<Patient[]> {
  if (n8nDataWebhookUrl) {
    return fetchPatientBoardFromN8n();
  }

  return fetchPatientBoardFromSupabase();
}

const fallbackStatusFromNote = (note: string): PatientStatus => {
  const text = note.toLowerCase();

  if (/(urgent|labored|chest pain|fall|fever|unresponsive|critical|severe)/.test(text)) {
    return "Critical";
  }

  if (/(confused|dizzy|weak|skipped|restless|low appetite|monitor|watch)/.test(text)) {
    return "Watch";
  }

  if (/(better|improved|improving|less|completed|progress)/.test(text)) {
    return "Improving";
  }

  return "Stable";
};

export async function submitPatientNote(
  data: PatientNoteFormData,
  patient: Patient,
): Promise<PatientNote> {
  const note: PatientNote = {
    id: `NOTE-${Math.floor(100000 + Math.random() * 900000)}`,
    patientId: data.patientId,
    content: data.note,
    status: fallbackStatusFromNote(data.note),
    createdAt: new Date().toISOString(),
    author: data.author,
  };

  if (!n8nWebhookUrl) {
    throw new Error("VITE_N8N_WEBHOOK_URL is not configured.");
  }

  const response = await fetch(n8nWebhookUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      event: "patient_note.submitted",
      patient: {
        id: patient.id,
        name: patient.name,
        age: patient.age,
        room: patient.room,
        currentStatus: patient.status,
        primaryContact: {
          id: patient.primaryContactId,
          name: patient.primaryContact,
          email: patient.primaryContactEmail,
        },
        latestNotes: patient.notes.slice(0, 3),
      },
      note: {
        author: data.author,
        content: data.note,
        submittedAt: note.createdAt,
      },
      allowedStatuses: patientStatuses,
      automationInstructions:
        "Analyze the new note with the patient's recent notes. Pick exactly one status: Stable, Improving, Watch, or Critical. Save the patient, note, and analyzed status to Supabase.",
    }),
  });

  if (!response.ok) {
    throw new Error(`n8n returned ${response.status}.`);
  }

  return note;
}
