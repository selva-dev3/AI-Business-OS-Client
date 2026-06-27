export type AssetStatus = "available" | "assigned" | "maintenance" | "disposed";
export type AssetCategory = "electronics" | "software" | "furniture" | "infrastructure" | "other";

export type Asset = {
  id: string;
  name: string;
  category: AssetCategory;
  serialNumber: string;
  status: AssetStatus;
  cost: number;
  purchaseDate: string;
  assignedToId?: string;
  assignedTo?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

export type AssetHistory = {
  id: string;
  assetId: string;
  assetName: string;
  action: "checkout" | "checkin" | "maintenance_start" | "maintenance_end" | "dispose";
  employeeId?: string;
  employeeName?: string;
  actionDate: string;
  notes?: string;
};

export type CreateAssetData = {
  name: string;
  category: AssetCategory;
  serialNumber: string;
  status?: AssetStatus;
  cost: number;
  purchaseDate: string;
  assignedToId?: string;
  notes?: string;
};

export type UpdateAssetData = Partial<CreateAssetData>;
