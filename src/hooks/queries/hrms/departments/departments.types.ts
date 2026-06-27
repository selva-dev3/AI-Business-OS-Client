export type Department = {
  id: string;
  name: string;
  code?: string;
  description?: string;
  parentId?: string;
  parent?: { id: string; name: string };
  headId?: string;
  head?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatar?: string;
  };
  employeeCount: number;
  children?: Department[];
  createdAt: string;
  updatedAt: string;
};

export type CreateDepartmentData = {
  name: string;
  code?: string;
  description?: string;
  parentId?: string;
  headId?: string;
};

export type UpdateDepartmentData = Partial<CreateDepartmentData>;
