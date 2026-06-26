export type Invoice = {
  id: string;
  invoiceNumber: string;
  type: "sales" | "purchase" | "credit_note";
  clientId?: string;
  clientName?: string;
  issueDate: string;
  dueDate: string;
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  amountPaid: number;
  balanceDue: number;
  status: "draft" | "sent" | "partially_paid" | "paid" | "overdue" | "cancelled";
  notes?: string;
  lineItems: InvoiceLineItem[];
};

export type InvoiceLineItem = {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxPercent: number;
  total: number;
};

export type Expense = {
  id: string;
  category: string;
  amount: number;
  date: string;
  description: string;
  receiptUrl?: string;
  status: "pending" | "approved" | "rejected";
  submittedById: string;
  submittedByName: string;
  approvedById?: string;
  approvedAt?: string;
};

export type Payment = {
  id: string;
  invoiceId?: string;
  invoiceNumber?: string;
  amount: number;
  paymentDate: string;
  method: "cash" | "bank_transfer" | "card" | "cheque" | "online";
  reference?: string;
  notes?: string;
};

export type FinancialAccount = {
  id: string;
  name: string;
  type: "bank" | "cash" | "credit_card" | "investment";
  currency: string;
  currentBalance: number;
  accountNumber?: string;
  bankName?: string;
};

export type Budget = {
  id: string;
  name: string;
  category: string;
  period: string;
  allocatedAmount: number;
  spentAmount: number;
  remainingAmount: number;
};
