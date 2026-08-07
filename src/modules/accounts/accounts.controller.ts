import { Response } from "express";
import { AuthRequest } from "../../middlewares/auth.middleware";
import { createAccountSchema } from "./accounts.schemas";
import * as accountsService from "./accounts.service";

// POST /api/accounts — crea una cuenta para el usuario logueado
export const createAccountHandler = async (req: AuthRequest, res: Response) => {
  const parsed = createAccountSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  // req.user viene del middleware requireAuth; userId llega como string
  // en el payload del JWT, así que se convierte antes de usarlo con Prisma.
  const userId = Number(req.user!.userId);
  const account = await accountsService.createAccount(userId, parsed.data);
  return res.status(201).json(account);
};

// GET /api/accounts — lista las cuentas del usuario logueado
export const listAccountsHandler = async (req: AuthRequest, res: Response) => {
  const userId = Number(req.user!.userId);
  const accounts = await accountsService.getUserAccounts(userId);
  return res.status(200).json(accounts);
};

// GET /api/accounts/:id — trae una cuenta puntual, si es del usuario
export const getAccountHandler = async (req: AuthRequest, res: Response) => {
  const userId = Number(req.user!.userId);
  const accountId = Number(req.params.id);

  try {
    const account = await accountsService.getAccountById(userId, accountId);
    return res.status(200).json(account);
  } catch (err) {
    if (err instanceof Error && err.message === "ACCOUNT_NOT_FOUND") {
      return res.status(404).json({ error: "Cuenta no encontrada" });
    }
    return res.status(500).json({ error: "Error interno" });
  }
};
