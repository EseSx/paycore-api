// Importa el módulo zod para la validación de esquemas
import { z } from "zod";

// Define el esquema de validación para el registro de usuarios
export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
});

// Define el esquema de validación para el inicio de sesión de usuarios
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
