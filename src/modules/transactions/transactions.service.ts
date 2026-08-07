import { prisma } from "../../config/prisma";
import { CreateTransactionInput } from "./transactions.schemas";
import { processPayment } from "../payments/paymentBreaker";

export const createTransaction = async (
  userId: number,
  data: CreateTransactionInput,
) => {
  // Verificar que la cuenta sea del usuario (mismo patrón anti-IDOR de accounts)
  const account = await prisma.account.findFirst({
    where: { id: data.accountId, userId },
  });
  if (!account) throw new Error("ACCOUNT_NOT_FOUND");

  const currentBalance = Number(account.balance);
  const delta = data.type === "deposit" ? data.amount : -data.amount;
  const newBalance = currentBalance + delta;

  if (newBalance < 0) throw new Error("INSUFFICIENT_FUNDS");

  if (data.type === "deposit") {
    const paymentResult = await processPayment(data.amount);
    if (!paymentResult.approved) {
      throw new Error("PAYMENT_GATEWAY_DECLINED");
    }
  }

  // $transaction: si falla el update, tampoco se crea la transacción — atomicidad real
  const [, transaction] = await prisma.$transaction([
    prisma.account.update({
      where: { id: data.accountId },
      data: { balance: newBalance },
    }),
    prisma.transaction.create({
      data: {
        accountId: data.accountId,
        amount: data.amount,
        type: data.type,
      },
    }),
  ]);

  return transaction;
};

export const getAccountHistory = async (
  userId: number,
  accountId: number,
  limit = 20,
) => {
  const account = await prisma.account.findFirst({
    where: { id: accountId, userId },
  });
  if (!account) throw new Error("ACCOUNT_NOT_FOUND");

  // Esta query es la que aprovecha directamente @@index([accountId, createdAt])
  return prisma.transaction.findMany({
    where: { accountId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
};
