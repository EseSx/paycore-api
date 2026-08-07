import { z } from "zod";

// Validación del body al registrar un movimiento.
// "type" está restringido a los dos valores soportados por el negocio.
export const createTransactionSchema = z.object({
  accountId: z.number().int().positive(),
  amount: z.number().positive(),
  type: z.enum(["deposit", "withdrawal"]),
});

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
