export type KanbanNotificationRecipient = {
  id: string
  name: string
  email: string
  /** E.164-style number for WhatsApp routing (update to real numbers for your n8n/Twilio flow). */
  phone: string
}

/** Hardcoded recipients for “Send Email / WhatsApp Notification” (Kanban completion). */
export const KANBAN_NOTIFICATION_RECIPIENTS: KanbanNotificationRecipient[] = [
  { id: "azmat-hosanny", name: "Azmat Hosanny", email: "azmathossany@gmail.com", phone: "+23057001234" },
  { id: "kavish-mojhoa", name: "Kavish Mojhoa", email: "kavish17mojhoa@gmail.com", phone: "+23057002345" },
  /** Gmail plus-address; lands in the same inbox — replace with a third teammate when you have their email. */
  {
    id: "board-alerts",
    name: "Board alerts (test)",
    email: "kavish17mojhoa+board@gmail.com",
    phone: "+23057003456",
  },
]
