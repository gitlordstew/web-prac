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
  primaryContact: string;
  status: PatientStatus;
  notes: PatientNote[];
};

export type PatientNoteFormData = {
  patientId: string;
  author: string;
  note: string;
};

const n8nWebhookUrl = import.meta.env.VITE_N8N_WEBHOOK_URL as string | undefined;

export const patientStatuses: PatientStatus[] = ["Stable", "Improving", "Watch", "Critical"];

const hoursAgo = (hours: number) => new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();

export const seedPatients: Patient[] = [
  {
    id: "PAT-1001",
    name: "Elena Reyes",
    age: 78,
    room: "A-104",
    primaryContact: "Marco Reyes",
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
    primaryContact: "Lena Hart",
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
    primaryContact: "Yuki Nakamura",
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
    primaryContact: "Nisha Patel",
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
    primaryContact: "Tara Mitchell",
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
