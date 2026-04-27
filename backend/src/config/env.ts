import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Esquema de validación de variables de entorno requeridas.
 * La aplicación falla inmediatamente al arrancar si alguna variable falta o es inválida.
 */
const envSchema = z.object({
  /** URL de conexión a la base de datos PostgreSQL. */
  DATABASE_URL: z.string().min(1),
  /** Clave secreta para firmar y verificar tokens JWT (mínimo 16 caracteres). */
  JWT_SECRET: z.string().min(16),
  /** Tiempo de expiración del JWT (ej. "7d", "24h"). Por defecto: "7d". */
  JWT_EXPIRES_IN: z.string().default('7d'),
  /** Puerto en el que escucha el servidor HTTP. Por defecto: 3000. */
  PORT: z.coerce.number().default(3000),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment variables:', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

/** Variables de entorno validadas y tipadas. */
export const env = parsed.data;
