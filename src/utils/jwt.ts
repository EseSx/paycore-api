// Importa jsonwebtoken para la creación y verificación de tokens JWT
import jwt, { SignOptions } from "jsonwebtoken";

// Define la estructura de los datos que se incluirán en el token JWT
interface TokenPayload {
  userId: string;
  email: string;
}

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET!; // Define la clave secreta para firmar los tokens de acceso (debe ser una cadena segura y única)
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!; // Define la clave secreta para firmar los tokens de actualización (debe ser una cadena segura y única)

// Función para firmar un token de acceso JWT con un payload específico
export const signAccessToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, ACCESS_SECRET, {
    expiresIn: (process.env.JWT_ACCESS_EXPIRES ||
      "15m") as SignOptions["expiresIn"],
  });
};

// Función para firmar un token de actualización JWT con un payload específico
export const signRefreshToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, REFRESH_SECRET, {
    expiresIn: (process.env.JWT_REFRESH_EXPIRES ||
      "7d") as SignOptions["expiresIn"],
  });
};

export const verifyAccessToken = (token: string): TokenPayload => {
  return jwt.verify(token, ACCESS_SECRET) as TokenPayload;
};

export const verifyRefreshToken = (token: string): TokenPayload => {
  return jwt.verify(token, REFRESH_SECRET) as TokenPayload;
};
