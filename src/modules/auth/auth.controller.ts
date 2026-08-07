import { Request, Response } from "express";
import { registerSchema, loginSchema } from "./auth.schemas";
import * as authService from "./auth.service";

// POST /api/auth/register
export const registerHandler = async (req: Request, res: Response) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success)
    return res.status(400).json({ error: parsed.error.flatten() });

  try {
    const tokens = await authService.register(parsed.data);
    return res.status(201).json(tokens);
  } catch (err) {
    if (err instanceof Error && err.message === "EMAIL_ALREADY_EXISTS")
      return res.status(409).json({ error: "El email ya está registrado" });
    // Cualquier otro error inesperado (ej. falla de conexión a la DB).
    return res.status(500).json({ error: "Error interno" });
  }
};

// POST /api/auth/login
export const loginHandler = async (req: Request, res: Response) => {
  const parsed = loginSchema.safeParse(req.body);

  if (!parsed.success)
    return res.status(400).json({ error: parsed.error.flatten() });

  try {
    const tokens = await authService.login(parsed.data);
    res.status(200).json(tokens);
  } catch (err) {
    if (err instanceof Error && err.message === "INVALID_CREDENTIALS") {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }
    res.status(500).json({ error: "Error interno" });
  }
};

// POST /api/auth/refresh — canjea un refresh token por un access token nuevo
export const refreshHandler = async (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  if (!refreshToken)
    return res.status(400).json({ error: "Falta refreshToken" });

  try {
    const result = await authService.refresh(refreshToken);
    res.status(200).json(result);
  } catch {
    return res.status(401).json({ error: "Refresh token inválido" });
  }
};

// POST /api/auth/logout — revoca el refresh token recibido
export const logoutHandler = async (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  if (refreshToken) await authService.logout(refreshToken);
  res.status(204).send();
};
