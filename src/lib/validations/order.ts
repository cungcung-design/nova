import { z } from "zod";

export const orderItemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.coerce
    .number()
    .int()
    .min(1),
});

export const orderSchema = z.object({
  customerId: z.string().min(1),

  items: z
    .array(orderItemSchema)
    .min(1, "Order must contain at least one product."),

  tax: z.coerce.number().min(0).default(0),

  discount: z.coerce.number().min(0).default(0),

  notes: z
    .string()
    .max(1000)
    .optional()
    .or(z.literal("")),
});

export type OrderInput = z.infer<typeof orderSchema>;
