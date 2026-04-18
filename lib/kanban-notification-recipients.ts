export type KanbanNotificationRecipient = {
  id: string
  name: string
  email: string
}

/** Hardcoded recipients for “Send Email Notification” (Kanban completion). */
export const KANBAN_NOTIFICATION_RECIPIENTS: KanbanNotificationRecipient[] = [
  { id: "azmat-hosanny", name: "Azmat Hosanny", email: "azmathossany@gmail.com" },
  { id: "kavish-mojhoa", name: "Kavish Mojhoa", email: "kavish17mojhoa@gmail.com" },
  /** Gmail plus-address; lands in the same inbox — replace with a third teammate when you have their email. */
  { id: "board-alerts", name: "Board alerts (test)", email: "kavish17mojhoa+board@gmail.com" },
]
