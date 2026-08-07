import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/jwt";

// Extiende el Request de Express para poder colgar los datos del usuario
// autenticado (extraídos del JWT) y que estén tipados en los controllers.
export interface AuthRequest extends Request {
  user?: { userId: string; email: string };
}

// Middleware que protege rutas: exige un access token válido en el header
// Authorization ("Bearer <token>"). Si es válido, cuelga el payload
// decodificado en req.user y deja pasar la request con next().
export const requireAuth = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer "))
    return res.status(401).json({ error: "Token no provisto" });

  const token = authHeader.split(" ")[1];

  // Header mal formado (ej. "Bearer" sin nada después): TypeScript detecta
  // que split()[1] puede ser undefined, y es un caso real a manejar.
  if (!token) return res.status(401).json({ error: "Token no provisto" });

  try {
    req.user = verifyAccessToken(token);
    next();
  } catch {
    // Token vencido o firmado con otro secret: no diferenciamos el motivo
    // exacto en la respuesta, para no dar pistas a un posible atacante.
    return res.status(401).json({ error: "Token invalido o expirado" });
  }
};
