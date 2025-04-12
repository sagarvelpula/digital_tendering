
import * as z from 'zod';

// User authentication schemas
export const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

export const registerSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  role: z.enum(["admin", "vendor"]),
});

export const resetPasswordSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
});

export const updatePasswordSchema = z.object({
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  confirmPassword: z.string().min(6, { message: "Password must be at least 6 characters" }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

// Tender schemas
export const tenderSchema = z.object({
  title: z.string().min(5, { message: "Title must be at least 5 characters" }),
  description: z.string().min(20, { message: "Description must be at least 20 characters" }),
  category: z.string().min(1, { message: "Category is required" }),
  value: z.coerce.number().positive({ message: "Value must be a positive number" }),
  deadline: z.string().min(1, { message: "Deadline is required" }),
  requirements: z.array(z.string()).min(1, { message: "At least one requirement is needed" }),
});

// Bid schemas
export const bidSchema = z.object({
  amount: z.coerce.number().positive({ message: "Bid amount must be a positive number" }),
  proposal: z.string().min(20, { message: "Proposal must be at least 20 characters" }),
});
