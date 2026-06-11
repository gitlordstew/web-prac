import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  ClipboardList,
  HeartPulse,
  Loader2,
  Send,
  ShieldCheck,
  TrendingUp,
  UserRound,
} from "lucide-react";
import {
  fetchPatientBoard,
  Patient,
  PatientNoteFormData,
  PatientStatus,
  submitPatientNote,
} from "./lib/patients";
import { hasSupabaseConfig, supabase } from "./lib/supabase";

const initialForm: PatientNoteFormData = {
  patientId: "",
  author: "",
  note: "",
};

const statusIcon = {
  Stable: ShieldCheck,
  Improving: TrendingUp,
  Watch: Activity,
  Critical: AlertTriangle,
};

const formatTime = (value: string) =>
  new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));

function App() {
  const [form, setForm] = useState<PatientNoteFormData>(initialForm);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoadingBoard, setIsLoadingBoard] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const selectedPatient = patients.find((patient) => patient.id === form.patientId) ?? patients[0];

  const loadPatientBoard = async (showLoading = false) => {
    if (showLoading) {
      setIsLoadingBoard(true);
    }

    try {
      const board = await fetchPatientBoard();
      setPatients(board);
      setNotice((current) =>
        current === "Unable to load live patient data." ? null : current,
      );

      setForm((current) =>
        current.patientId || !board[0] ? current : { ...current, patientId: board[0].id },
      );
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Unable to load live patient data.");
    } finally {
      if (showLoading) {
        setIsLoadingBoard(false);
      }
    }
  };

  useEffect(() => {
    void loadPatientBoard(true);
  }, []);

  useEffect(() => {
    if (!hasSupabaseConfig || !supabase) {
      return undefined;
    }

    const client = supabase;
    const channel = client
      .channel("care-status-live-board")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "patient_notes" },
        () => void loadPatientBoard(),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "patients" },
        () => void loadPatientBoard(),
      )
      .subscribe();

    return () => {
      void client.removeChannel(channel);
    };
  }, []);

  const statusCounts = useMemo(
    () =>
      patients.reduce(
        (totals, patient) => ({
          ...totals,
          [patient.status]: totals[patient.status] + 1,
        }),
        { Stable: 0, Improving: 0, Watch: 0, Critical: 0 } as Record<PatientStatus, number>,
      ),
    [patients],
  );

  const latestNotes = useMemo(
    () =>
      patients
        .flatMap((patient) =>
          patient.notes.map((note) => ({
            ...note,
            patientName: patient.name,
            room: patient.room,
          })),
        )
        .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
        .slice(0, 5),
    [patients],
  );

  const handleChange = (
    field: keyof PatientNoteFormData,
    value: PatientNoteFormData[keyof PatientNoteFormData],
  ) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setNotice(null);

    try {
      if (!selectedPatient) {
        throw new Error("Select a patient before submitting a note.");
      }

      const note = await submitPatientNote(form, selectedPatient);

      setForm((current) => ({ ...current, author: "", note: "" }));
      setNotice(`${selectedPatient.name}'s note was sent to n8n and the live board is refreshing.`);
      await loadPatientBoard();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Unable to submit patient note.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="app-shell">
      <section className="workspace">
        <header className="topbar">
          <div>
            <p className="eyebrow">Elderly monitoring</p>
            <h1>Care Status Desk</h1>
          </div>
          <div className="status-pill">
            <HeartPulse size={18} aria-hidden="true" />
            n8n AI intake
          </div>
        </header>

        <section className="summary-grid" aria-label="Patient summary">
          <article>
            <UserRound size={20} aria-hidden="true" />
            <span>{patients.length}</span>
            <p>Active patients</p>
          </article>
          <article>
            <Activity size={20} aria-hidden="true" />
            <span>{statusCounts.Watch + statusCounts.Critical}</span>
            <p>Needs review</p>
          </article>
          <article>
            <ShieldCheck size={20} aria-hidden="true" />
            <span>{statusCounts.Stable + statusCounts.Improving}</span>
            <p>Stable or improving</p>
          </article>
        </section>

        <section className="content-grid">
          <form className="monitor-form" onSubmit={handleSubmit}>
            <div className="section-heading">
              <div>
                <p className="eyebrow">Daily note</p>
                <h2>Submit patient update</h2>
              </div>
              <ClipboardList size={20} aria-label="Patient note form" />
            </div>

            <label>
              Patient
              <select
                value={form.patientId}
                onChange={(event) => handleChange("patientId", event.target.value)}
                disabled={!patients.length}
              >
                {patients.map((patient) => (
                  <option key={patient.id} value={patient.id}>
                    {patient.name} - Room {patient.room}
                  </option>
                ))}
              </select>
            </label>

            <div className="patient-snapshot">
              <div>
                <span className="snapshot-label">Current status</span>
                {selectedPatient ? (
                  <strong className={`status-badge status-${selectedPatient.status.toLowerCase()}`}>
                    {selectedPatient.status}
                  </strong>
                ) : (
                  <strong>No live patient selected</strong>
                )}
              </div>
              <div>
                <span className="snapshot-label">Primary contact</span>
                <strong>{selectedPatient?.primaryContact ?? "Unavailable"}</strong>
                <span>{selectedPatient?.primaryContactEmail ?? "Waiting for data"}</span>
              </div>
            </div>

            <label>
              Caregiver
              <input
                required
                value={form.author}
                onChange={(event) => handleChange("author", event.target.value)}
                placeholder="Nurse or caregiver name"
              />
            </label>

            <label>
              Today's note
              <textarea
                required
                rows={8}
                value={form.note}
                onChange={(event) => handleChange("note", event.target.value)}
                placeholder="Record appetite, mood, vitals, medication, mobility, incidents, and any change from the last note."
              />
            </label>

            <button
              className="primary-button"
              type="submit"
              disabled={isSubmitting || !selectedPatient}
            >
              {isSubmitting ? (
                <Loader2 className="spin" size={18} aria-hidden="true" />
              ) : (
                <Send size={18} aria-hidden="true" />
              )}
              {isSubmitting ? "Sending to n8n" : "Submit note"}
            </button>

            {notice && <p className="notice">{notice}</p>}
          </form>

          <aside className="note-panel" aria-label="Latest notes">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Live queue</p>
                <h2>Latest notes</h2>
              </div>
              <ArrowUpRight size={20} aria-hidden="true" />
            </div>

            <div className="note-list">
              {isLoadingBoard && <p className="empty-state">Loading live notes...</p>}
              {!isLoadingBoard && !latestNotes.length && (
                <p className="empty-state">No notes found in Supabase yet.</p>
              )}
              {latestNotes.map((note) => (
                <article className="note-card" key={note.id}>
                  <div className="note-card__top">
                    <span>
                      {note.patientName} - {note.room}
                    </span>
                    <span className={`status-badge status-${note.status.toLowerCase()}`}>
                      {note.status}
                    </span>
                  </div>
                  <p>{note.content}</p>
                  <div className="note-meta">
                    <span>{note.author}</span>
                    <span>{formatTime(note.createdAt)}</span>
                  </div>
                </article>
              ))}
            </div>
          </aside>
        </section>

        <section className="patient-table-section" aria-label="Patient status table">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Patient board</p>
              <h2>Status and latest 3 notes</h2>
            </div>
          </div>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Room</th>
                  <th>Status</th>
                  <th>Latest 3 notes</th>
                </tr>
              </thead>
              <tbody>
                {!patients.length && (
                  <tr>
                    <td colSpan={4}>No patients found in Supabase yet.</td>
                  </tr>
                )}
                {patients.map((patient) => {
                  const Icon = statusIcon[patient.status];

                  return (
                    <tr key={patient.id}>
                      <td>
                        <strong>{patient.name}</strong>
                        <span>{patient.age} years old</span>
                      </td>
                      <td>{patient.room}</td>
                      <td>
                        <span className={`status-badge status-${patient.status.toLowerCase()}`}>
                          <Icon size={15} aria-hidden="true" />
                          {patient.status}
                        </span>
                      </td>
                      <td>
                        <ol className="compact-notes">
                          {patient.notes.slice(0, 3).map((note) => (
                            <li key={note.id}>
                              <span>{formatTime(note.createdAt)}</span>
                              {note.content}
                            </li>
                          ))}
                        </ol>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </section>
    </main>
  );
}

export default App;
