import { prisma } from "../../config/prisma";
import { hashPassword, comparePassword } from "../../utils/password";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../../utils/jwt";
import { RegisterInput, LoginInput } from "./auth.schemas";

// Registra un usuario nuevo: valida que el email no exista, hashea la
// contraseña (nunca se guarda en texto plano) y emite el par de tokens.
export const register = async (data: RegisterInput) => {
  const existing = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (existing) throw new Error("EMAIL_ALREADY_EXISTS");

  const passwordHash = await hashPassword(data.password);
  const user = await prisma.user.create({
    data: { email: data.email, passwordHash },
  });

  return issueTokens(user.id, user.email);
};

// Autentica un usuario existente comparando la contraseña contra el hash
// guardado. No distingue entre "email no existe" y "contraseña incorrecta"
// en el mensaje de error, para no filtrar qué emails están registrados.
export const login = async (data: LoginInput) => {
  const user = await prisma.user.findUnique({ where: { email: data.email } });
  if (!user) throw new Error("INVALID_CREDENTIALS");

  const valid = await comparePassword(data.password, user.passwordHash);
  if (!valid) throw new Error("INVALID_CREDENTIALS");

  return issueTokens(user.id, user.email);
};

// Genera el access token y el refresh token para un usuario, y persiste
// el refresh token en base de datos (necesario para poder revocarlo
// más adelante desde /logout, algo que un JWT stateless no permite solo).
const issueTokens = async (userId: number, email: string) => {
  const accessToken = signAccessToken({ userId: String(userId), email });
  const refreshToken = signRefreshToken({ userId: String(userId), email });

  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  return { accessToken, refreshToken };
};

// Emite un nuevo access token a partir de un refresh token válido y no
// revocado. No genera un refresh token nuevo (rotación simple, no rotativa).
export const refresh = async (token: string) => {
  const payload = verifyRefreshToken(token);

  const stored = await prisma.refreshToken.findUnique({ where: { token } });
  if (!stored || stored.revoked) throw new Error("INVALID_REFRESH_TOKEN");

  const newAccessToken = signAccessToken({
    userId: payload.userId,
    email: payload.email,
  });
  return { accessToken: newAccessToken };
};

// Revoca un refresh token en base de datos: a partir de este momento,
// aunque el JWT siga siendo válido por firma, /refresh lo va a rechazar.
export const logout = async (token: string) => {
  await prisma.refreshToken.updateMany({
    where: { token },
    data: { revoked: true },
  });
};
