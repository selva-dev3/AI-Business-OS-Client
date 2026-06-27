import { PaginationMeta, ListParams } from "../../client";

export type Designation = {
  id: string;
  name: string;
  designationCode?: string;
  description?: string;
  level?: number;
  hierarchyOrder?: number;
  employmentTypes?: string[];
  color?: string;
  isDefault?: boolean;
  companyId?: string;
  departmentId?: { _id?: string; id?: string; name?: string } | string;
  status?: "ACTIVE" | "INACTIVE";
  createdBy?: { _id?: string; firstName?: string; lastName?: string };
  updatedBy?: { _id?: string; firstName?: string; lastName?: string };
  deletedAt?: string;
  isActive?: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CreateDesignationData = {
  name: string;
  designationCode?: string;
  description?: string;
  level?: number;
  hierarchyOrder?: number;
  employmentTypes?: string[];
  color?: string;
  isDefault?: boolean;
  departmentId?: string;
  status?: "ACTIVE" | "INACTIVE";
};

export type UpdateDesignationData = Partial<CreateDesignationData> & {
  isActive?: boolean;
};

export type DesignationListResponse = {
  data: Designation[];
  meta: PaginationMeta;
};

export type DesignationFilters = ListParams & {
  search?: string;
  departmentId?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
};

export type BulkActionData = {
  ids: string[];
  force?: boolean;
};

export type StatusChangeData = {
  status: "ACTIVE" | "INACTIVE";
};

export type BulkActionResult = {
  modifiedCount: number;
};
