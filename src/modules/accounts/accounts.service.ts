import { prisma } from "../../config/prisma";
import { createAccountInput } from "./accounts.schemas";

export const createAccount = async (
  userId: number,
  data: createAccountInput,
) => {
  return prisma.account.create({
    data: { userId, balance: data.balance ?? 0 },
  });
};

export const getUserAccounts = async (userId: number) => {
  return prisma.account.findMany({
    where: { userId },
    orderBy: { id: "asc" },
  });
};

export const getAccountById = async (userId: number, accountId: number) => {
  const account = await prisma.account.findFirst({
    where: { id: accountId, userId },
  });

  if (!account) throw new Error("ACCOUNT_NOT_FOUND");
  return account;
};
