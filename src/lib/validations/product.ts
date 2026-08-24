import { z } from "zod";

export const productSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Product name must be at least 2 characters.")
    .max(150),

  description: z
    .string()
    .trim()
    .max(1000)
    .optional()
    .or(z.literal("")),

  sku: z
    .string()
    .trim()
    .max(50)
    .optional()
    .or(z.literal("")),

  price: z.coerce
    .number()
    .min(0, "Price cannot be negative."),

  cost: z.coerce
    .number()
    .min(0, "Cost cannot be negative.")
    .optional(),

  stock: z.coerce
    .number()
    .int()
    .min(0, "Stock cannot be negative."),

  status: z.enum([
    "ACTIVE",
    "INACTIVE",
    "OUT_OF_STOCK",
  ]),
});

export type ProductInput =
  z.infer<typeof productSchema>;
