import z from "zod";

export const createAccountSchema = z.object({
  balance: z.number().min(0).optional(),
});

export type createAccountInput = z.infer<typeof createAccountSchema>;
