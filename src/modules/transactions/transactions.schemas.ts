import { z } from "zod";

export const createTransactionSchema = z.object({
  accountId: z.number().int().positive(),
  amount: z.number().positive(),
  type: z.enum(["deposit", "withdrawal"]),
});

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
