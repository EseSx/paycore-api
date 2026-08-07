import { Request, Response } from "express";
import { registerSchema, loginSchema } from "./auth.schemas";
import * as authService from "./auth.service";
import { error } from "node:console";

export const registerHandler = async (req: Request, res: Response) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success)
    return res.status(400).json({ error: parsed.error.flatten() });

  try {
    const tokens = await authService.register(parsed.data);
    res.status(201).json(tokens);
  } catch (err) {
    if (err instanceof Error && err.message === "EMAIL_ALREADY_EXISTS")
      return res.status(409).json({ error: "El email ya esta registrado" });
  }
  res.status(500).json({ error: "Error interno" });
};

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

export const refreshHandler = async (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  if (!refreshToken)
    return res.status(400).json({ error: "Falta refreshToken" });

  try {
    const result = await authService.refresh(refreshToken);
    res.status(200).json(result);
  } catch {
    res.status(401).json({ error: "Refresh token inválido" });
  }
};

export const logoutHandler = async (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  if (refreshToken) await authService.logout(refreshToken);
  res.status(204).send();
};
