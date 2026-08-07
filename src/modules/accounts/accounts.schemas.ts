import z from "zod";

// Validación del body al crear una cuenta.
// El balance inicial es opcional: si no se manda, arranca en 0.
export const createAccountSchema = z.object({
  balance: z.number().min(0).optional(),
});

export type createAccountInput = z.infer<typeof createAccountSchema>;
