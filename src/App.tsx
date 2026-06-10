import { FormEvent, useMemo, useState } from "react";
import {
  ArrowUpRight,
  CheckCircle2,
  CircleHelp,
  Clock3,
  Inbox,
  Loader2,
  Send,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { createTicket, Ticket, TicketFormData, TicketPriority } from "./lib/tickets";

const categories = ["Technical Support", "Billing", "Account Access", "Feature Request"];
const priorities: TicketPriority[] = ["Low", "Medium", "High", "Urgent"];

const initialForm: TicketFormData = {
  requesterName: "",
  email: "",
  category: categories[0],
  priority: "Medium",
  subject: "",
  description: "",
};

const seedTickets: Ticket[] = [
  {
    id: "TKT-104921",
    requesterName: "Mina Tan",
    email: "mina@example.com",
    category: "Account Access",
    priority: "High",
    subject: "Unable to access dashboard",
    description: "Login succeeds but the workspace dashboard stays blank.",
    status: "Triaging",
    createdAt: new Date(Date.now() - 1000 * 60 * 46).toISOString(),
  },
  {
    id: "TKT-104881",
    requesterName: "Rafael Lim",
    email: "rafael@example.com",
    category: "Billing",
    priority: "Medium",
    subject: "Receipt needed for last invoice",
    description: "Please send a tax receipt for the most recent invoice.",
    status: "Open",
    createdAt: new Date(Date.now() - 1000 * 60 * 130).toISOString(),
  },
];

function App() {
  const [form, setForm] = useState<TicketFormData>(initialForm);
  const [tickets, setTickets] = useState<Ticket[]>(seedTickets);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const openCount = useMemo(
    () => tickets.filter((ticket) => ticket.status !== "Resolved").length,
    [tickets],
  );

  const handleChange = (
    field: keyof TicketFormData,
    value: TicketFormData[keyof TicketFormData],
  ) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setNotice(null);

    try {
      const ticket = await createTicket(form);
      setTickets((current) => [ticket, ...current]);
      setForm(initialForm);
      setNotice(`Ticket ${ticket.id} was created.`);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Unable to create ticket.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="app-shell">
      <section className="workspace">
        <header className="topbar">
          <div>
            <p className="eyebrow">Support desk</p>
            <h1>Ticket Desk</h1>
          </div>
          <div className="status-pill">
            <ShieldCheck size={18} aria-hidden="true" />
            Frontend ready
          </div>
        </header>

        <section className="summary-grid" aria-label="Ticket summary">
          <article>
            <Inbox size={20} aria-hidden="true" />
            <span>{tickets.length}</span>
            <p>Total tickets</p>
          </article>
          <article>
            <Clock3 size={20} aria-hidden="true" />
            <span>{openCount}</span>
            <p>Needs attention</p>
          </article>
          <article>
            <Sparkles size={20} aria-hidden="true" />
            <span>n8n</span>
            <p>Automation ready</p>
          </article>
        </section>

        <section className="content-grid">
          <form className="ticket-form" onSubmit={handleSubmit}>
            <div className="section-heading">
              <div>
                <p className="eyebrow">New request</p>
                <h2>Create a ticket</h2>
              </div>
              <CircleHelp size={20} aria-label="Ticket form" />
            </div>

            <label>
              Name
              <input
                required
                value={form.requesterName}
                onChange={(event) => handleChange("requesterName", event.target.value)}
                placeholder="Your name"
              />
            </label>

            <label>
              Email
              <input
                required
                type="email"
                value={form.email}
                onChange={(event) => handleChange("email", event.target.value)}
                placeholder="you@example.com"
              />
            </label>

            <div className="field-row">
              <label>
                Category
                <select
                  value={form.category}
                  onChange={(event) => handleChange("category", event.target.value)}
                >
                  {categories.map((category) => (
                    <option key={category}>{category}</option>
                  ))}
                </select>
              </label>

              <label>
                Priority
                <select
                  value={form.priority}
                  onChange={(event) =>
                    handleChange("priority", event.target.value as TicketPriority)
                  }
                >
                  {priorities.map((priority) => (
                    <option key={priority}>{priority}</option>
                  ))}
                </select>
              </label>
            </div>

            <label>
              Subject
              <input
                required
                value={form.subject}
                onChange={(event) => handleChange("subject", event.target.value)}
                placeholder="What should we help with?"
              />
            </label>

            <label>
              Details
              <textarea
                required
                rows={6}
                value={form.description}
                onChange={(event) => handleChange("description", event.target.value)}
                placeholder="Share the important details, errors, or expected outcome."
              />
            </label>

            <button className="primary-button" type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader2 className="spin" size={18} aria-hidden="true" />
              ) : (
                <Send size={18} aria-hidden="true" />
              )}
              {isSubmitting ? "Submitting" : "Submit ticket"}
            </button>

            {notice && <p className="notice">{notice}</p>}
          </form>

          <aside className="ticket-panel" aria-label="Recent tickets">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Queue</p>
                <h2>Recent tickets</h2>
              </div>
              <ArrowUpRight size={20} aria-hidden="true" />
            </div>

            <div className="ticket-list">
              {tickets.map((ticket) => (
                <article className="ticket-card" key={ticket.id}>
                  <div className="ticket-card__top">
                    <span className="ticket-id">{ticket.id}</span>
                    <span className={`priority priority-${ticket.priority.toLowerCase()}`}>
                      {ticket.priority}
                    </span>
                  </div>
                  <h3>{ticket.subject}</h3>
                  <p>{ticket.description}</p>
                  <div className="ticket-meta">
                    <span>{ticket.category}</span>
                    <span>{ticket.status}</span>
                  </div>
                </article>
              ))}
            </div>
          </aside>
        </section>
      </section>
    </main>
  );
}

export default App;
