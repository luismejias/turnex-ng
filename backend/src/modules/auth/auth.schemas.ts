import { z } from 'zod';

/** Esquema de validación Zod para el registro de un nuevo usuario. */
export const registerSchema = z.object({
  /** Nombre de pila del usuario (1-100 caracteres). */
  name: z.string().min(1, 'Name is required').max(100),
  /** Apellido del usuario (1-100 caracteres). */
  lastName: z.string().min(1, 'Last name is required').max(100),
  /** Dirección de email válida. */
  email: z.string().email('Invalid email format'),
  /** Contraseña en texto plano (mínimo 6 caracteres). */
  password: z.string().min(6, 'Password must be at least 6 characters'),
  /** Debe ser `true`; el usuario debe aceptar los términos y condiciones. */
  termAndConditions: z.boolean().refine((val) => val === true, {
    message: 'Terms and conditions must be accepted',
  }),
});

/** Esquema de validación Zod para el login. */
export const loginSchema = z.object({
  /** Dirección de email del usuario. */
  email: z.string().email('Invalid email format'),
  /** Contraseña del usuario (no puede estar vacía). */
  password: z.string().min(1, 'Password is required'),
});

/** DTO tipado para el registro, inferido desde `registerSchema`. */
export type RegisterDto = z.infer<typeof registerSchema>;
/** DTO tipado para el login, inferido desde `loginSchema`. */
export type LoginDto = z.infer<typeof loginSchema>;
