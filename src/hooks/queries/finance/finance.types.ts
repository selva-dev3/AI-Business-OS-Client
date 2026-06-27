export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  clientName: string;
  amount: number;
  status: "PAID" | "PENDING" | "OVERDUE" | "DRAFT" | "VOID";
  dueDate: string;
  issueDate: string;
  description?: string;
  items?: InvoiceItem[];
  taxRate?: number;
  discountRate?: number;
  subtotal?: number;
  taxAmount?: number;
  discountAmount?: number;
  total?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateInvoiceData {
  invoiceNumber: string;
  clientName: string;
  amount: number;
  dueDate: string;
  issueDate: string;
  description?: string;
  items?: InvoiceItem[];
  taxRate?: number;
  discountRate?: number;
}

export interface UpdateInvoiceData extends Partial<CreateInvoiceData> {
  status?: Invoice["status"];
}

export interface Expense {
  id: string;
  merchant: string;
  amount: number;
  category: string;
  status: "APPROVED" | "PENDING" | "REJECTED";
  date: string;
  description?: string;
  receiptUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateExpenseData {
  merchant: string;
  amount: number;
  category: string;
  status?: Expense["status"];
  date: string;
  description?: string;
  receiptUrl?: string;
}

export interface UpdateExpenseData extends Partial<CreateExpenseData> {}

export interface Payment {
  id: string;
  paymentNumber: string;
  invoiceId?: string;
  invoiceNumber?: string;
  amount: number;
  method: "CREDIT_CARD" | "BANK_TRANSFER" | "PAYPAL" | "STRIPE" | "CASH";
  type: "INBOUND" | "OUTBOUND";
  referenceNumber?: string;
  date: string;
  notes?: string;
  createdAt?: string;
}

export interface CreatePaymentData {
  invoiceId?: string;
  invoiceNumber?: string;
  amount: number;
  method: Payment["method"];
  type: Payment["type"];
  referenceNumber?: string;
  date: string;
  notes?: string;
}

export interface Budget {
  id: string;
  category: string;
  limit: number;
  spent: number;
  department: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateBudgetData {
  category: string;
  limit: number;
  department: string;
  spent?: number;
}

export interface UpdateBudgetData extends Partial<CreateBudgetData> {}

export interface Account {
  id: string;
  accountName: string;
  accountType: "BANK" | "CREDIT_CARD" | "CASH" | "RECEIVABLE" | "PAYABLE";
  accountNumber: string;
  balance: number;
  currency: string;
  bankName?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateAccountData {
  accountName: string;
  accountType: Account["accountType"];
  accountNumber: string;
  balance: number;
  currency: string;
  bankName?: string;
}

export interface UpdateAccountData extends Partial<CreateAccountData> {}

export interface FundTransferData {
  fromAccountId: string;
  toAccountId: string;
  amount: number;
  description?: string;
  date: string;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}
