import { hasSupabaseConfig, supabase } from "./supabase";

export type TicketPriority = "Low" | "Medium" | "High" | "Urgent";

export type TicketFormData = {
  requesterName: string;
  email: string;
  category: string;
  priority: TicketPriority;
  subject: string;
  description: string;
};

export type Ticket = TicketFormData & {
  id: string;
  status: "Open" | "Triaging" | "Resolved";
  createdAt: string;
};

const n8nWebhookUrl = import.meta.env.VITE_N8N_WEBHOOK_URL as string | undefined;

const toTicket = (data: TicketFormData): Ticket => ({
  ...data,
  id: `TKT-${Math.floor(100000 + Math.random() * 900000)}`,
  status: "Open",
  createdAt: new Date().toISOString(),
});

export async function createTicket(data: TicketFormData): Promise<Ticket> {
  const optimisticTicket = toTicket(data);

  if (hasSupabaseConfig && supabase) {
    const { data: savedTicket, error } = await supabase
      .from("tickets")
      .insert({
        requester_name: data.requesterName,
        email: data.email,
        category: data.category,
        priority: data.priority,
        subject: data.subject,
        description: data.description,
        status: "Open",
      })
      .select("id, requester_name, email, category, priority, subject, description, status, created_at")
      .single();

    if (error) {
      throw new Error(error.message);
    }

    optimisticTicket.id = String(savedTicket.id);
    optimisticTicket.requesterName = savedTicket.requester_name;
    optimisticTicket.email = savedTicket.email;
    optimisticTicket.category = savedTicket.category;
    optimisticTicket.priority = savedTicket.priority;
    optimisticTicket.subject = savedTicket.subject;
    optimisticTicket.description = savedTicket.description;
    optimisticTicket.status = savedTicket.status;
    optimisticTicket.createdAt = savedTicket.created_at;
  }

  if (n8nWebhookUrl) {
    const response = await fetch(n8nWebhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        event: "ticket.created",
        ticket: optimisticTicket,
      }),
    });

    if (!response.ok) {
      throw new Error(`Ticket saved, but n8n returned ${response.status}.`);
    }
  } else {
    throw new Error("Ticket saved, but VITE_N8N_WEBHOOK_URL is not configured.");
  }

  return optimisticTicket;
}
