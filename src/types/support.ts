export type SupportTicket = {
  id: string;
  ticketNumber: string;
  subject: string;
  description: string;
  categoryId?: string;
  categoryName?: string;
  requesterId: string;
  requesterName: string;
  requesterEmail: string;
  assigneeId?: string;
  assigneeName?: string;
  priority: "critical" | "high" | "medium" | "low";
  status: "open" | "assigned" | "in_progress" | "pending" | "resolved" | "closed";
  source: "email" | "web" | "chat" | "phone";
  slaDueDate?: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
};

export type TicketReply = {
  id: string;
  ticketId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  isInternalNote: boolean;
  message: string;
  attachments?: string[];
  createdAt: string;
};

export type TicketCategory = {
  id: string;
  name: string;
  description?: string;
  defaultAssigneeId?: string;
};
