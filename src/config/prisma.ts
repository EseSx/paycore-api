import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

// Prisma 7 eliminó el motor de conexión interno: ahora es obligatorio
// pasarle un "driver adapter" explícito para poder conectarse a la base.
const adapter = new PrismaMariaDb(process.env.DATABASE_URL!);

// Cliente único (singleton) compartido por toda la app.
// Evita abrir múltiples conexiones a MySQL en desarrollo con hot-reload.
export const prisma = new PrismaClient({ adapter });
