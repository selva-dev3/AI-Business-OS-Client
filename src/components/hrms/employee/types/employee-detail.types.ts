import { Employee } from "@/hooks/queries/hrms/employees/employees.types";

export interface EditForm {
  // Contact
  email: string;
  phone: string;
  alternatePhone: string;
  personalEmail: string;
  // Personal
  dateOfBirth: string;
  gender: string;
  bloodGroup: string;
  maritalStatus: string;
  // Address
  address: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  // Employment
  managerId: string;
  employmentType: string;
  // Bank Details
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  accountType: string;
  // Emergency Contact
  emergencyName: string;
  emergencyRelation: string;
  emergencyPhone: string;
  // Statutory
  panNumber: string;
  aadharNumber: string;
}

export interface BaseCardProps {
  employee: Employee;
  isEditing: boolean;
  editForm: EditForm;
  setEditForm: React.Dispatch<React.SetStateAction<EditForm>>;
}