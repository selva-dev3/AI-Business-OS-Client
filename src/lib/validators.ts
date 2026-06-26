import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Invalid email address").min(1, "Email is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  rememberMe: z.boolean().optional(),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    firstName: z.string().min(2, "Min 2 characters").max(50),
    lastName: z.string().min(2, "Min 2 characters").max(50),
    companyName: z.string().min(2, "Min 2 characters").max(100),
    email: z.string().email("Invalid email"),
    password: z.string().min(8, "Min 8 characters"),
    confirmPassword: z.string().min(8, "Min 8 characters"),
    terms: z.boolean().refine((v) => v, "You must accept the terms"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type RegisterFormValues = z.infer<typeof registerSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email"),
});

export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    otp: z.string().length(6, "OTP must be 6 digits"),
    newPassword: z.string().min(8, "Min 8 characters"),
    confirmPassword: z.string().min(8, "Min 8 characters"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export const employeeSchema = z.object({
  firstName: z.string().min(2, "Min 2 characters").max(50),
  lastName: z.string().min(2, "Min 2 characters").max(50),
  email: z.string().email("Invalid email"),
  phone: z.string().regex(/^\+?[1-9]\d{9,14}$/, "Invalid phone number").optional(),
  departmentId: z.string().uuid("Invalid department"),
  designationId: z.string().uuid("Invalid designation"),
  joiningDate: z.coerce.date(),
  employmentType: z.enum(["full_time", "part_time", "contract", "intern"]),
  salary: z.number().min(0, "Salary must be positive").optional(),
  reportingManagerId: z.string().uuid().optional(),
  address: z
    .object({
      street: z.string().min(1, "Required"),
      city: z.string().min(1, "Required"),
      state: z.string().min(1, "Required"),
      country: z.string().min(1, "Required"),
      zip: z.string().min(1, "Required"),
    })
    .optional(),
  avatar: z.string().url().optional(),
});

export type EmployeeFormValues = z.infer<typeof employeeSchema>;
