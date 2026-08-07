import { Response } from "express";
import { AuthRequest } from "../../middlewares/auth.middleware";
import { createTransactionSchema } from "./transactions.schemas";
import * as txService from "./transactions.service";

export const createTransactionHandler = async (
  req: AuthRequest,
  res: Response,
) => {
  const parsed = createTransactionSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const userId = Number(req.user!.userId);

  try {
    const transaction = await txService.createTransaction(userId, parsed.data);
    return res.status(201).json(transaction);
  } catch (err) {
    if (err instanceof Error && err.message === "ACCOUNT_NOT_FOUND") {
      return res.status(404).json({ error: "Cuenta no encontrada" });
    }
    if (err instanceof Error && err.message === "INSUFFICIENT_FUNDS") {
      return res.status(422).json({ error: "Fondos insuficientes" });
    }
    if (err instanceof Error && err.message === "PAYMENT_GATEWAY_DECLINED") {
      return res
        .status(502)
        .json({ error: "Pasarela de pago no disponible, intenta más tarde" });
    }
    return res.status(500).json({ error: "Error interno" });
  }
};

export const getHistoryHandler = async (req: AuthRequest, res: Response) => {
  const userId = Number(req.user!.userId);
  const accountId = Number(req.params.accountId);

  try {
    const history = await txService.getAccountHistory(userId, accountId);
    return res.status(200).json(history);
  } catch (err) {
    if (err instanceof Error && err.message === "ACCOUNT_NOT_FOUND") {
      return res.status(404).json({ error: "Cuenta no encontrada" });
    }
    return res.status(500).json({ error: "Error interno" });
  }
};
