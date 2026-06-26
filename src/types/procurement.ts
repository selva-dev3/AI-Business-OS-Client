export type Vendor = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  category: string;
  rating: number;
  status: "active" | "inactive";
  paymentTerms?: string;
  taxId?: string;
  createdAt: string;
};

export type RFQItem = {
  id: string;
  description: string;
  quantity: number;
  unitPrice?: number;
};

export type RFQ = {
  id: string;
  rfqNumber: string;
  title: string;
  status: "draft" | "sent" | "closed";
  items: RFQItem[];
  vendorIds: string[];
  createdAt: string;
  dueDate?: string;
};

export type Quote = {
  id: string;
  rfqId: string;
  vendorId: string;
  vendorName: string;
  items: Array<{
    rfqItemId: string;
    unitPrice: number;
    total: number;
  }>;
  total: number;
  deliveryDays: number;
  submittedAt: string;
};

export type PurchaseOrderItem = {
  id: string;
  productId?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxPercent: number;
  total: number;
};

export type PurchaseOrder = {
  id: string;
  poNumber: string;
  vendorId: string;
  vendorName: string;
  status: "draft" | "sent" | "partially_received" | "received" | "cancelled";
  items: PurchaseOrderItem[];
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  createdAt: string;
  expectedDelivery?: string;
};

export type GoodsReceipt = {
  id: string;
  poId: string;
  receivedAt: string;
  items: Array<{
    poItemId: string;
    quantityReceived: number;
    notes?: string;
  }>;
};
