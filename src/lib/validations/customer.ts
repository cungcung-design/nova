import { z } from "zod";

export const customerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters.")
    .max(100),

  email: z
    .string()
    .trim()
    .email("Enter a valid email address.")
    .optional()
    .or(z.literal("")),

  phone: z
    .string()
    .trim()
    .max(30)
    .optional()
    .or(z.literal("")),

  company: z
    .string()
    .trim()
    .max(100)
    .optional()
    .or(z.literal("")),

  status: z.enum([
    "ACTIVE",
    "INACTIVE",
    "LEAD",
  ]),
});

export type CustomerInput =
  z.infer<typeof customerSchema>;
