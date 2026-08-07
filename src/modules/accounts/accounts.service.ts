import { prisma } from "../../config/prisma";
import { createAccountInput } from "./accounts.schemas";

// Crea una cuenta asociada al usuario autenticado.
export const createAccount = async (
  userId: number,
  data: createAccountInput,
) => {
  return prisma.account.create({
    data: { userId, balance: data.balance ?? 0 },
  });
};

// Lista todas las cuentas del usuario autenticado.
export const getUserAccounts = async (userId: number) => {
  return prisma.account.findMany({
    where: { userId },
    orderBy: { id: "asc" },
  });
};

// Busca una cuenta puntual, filtrando SIEMPRE por userId además del id.
// Esto previene que un usuario autenticado acceda a la cuenta de otro
// con solo adivinar/incrementar el ID (vulnerabilidad tipo IDOR).
export const getAccountById = async (userId: number, accountId: number) => {
  const account = await prisma.account.findFirst({
    where: { id: accountId, userId },
  });

  if (!account) throw new Error("ACCOUNT_NOT_FOUND");
  return account;
};
