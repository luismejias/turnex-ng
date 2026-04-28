import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../../config/prisma';
import { env } from '../../config/env';
import type { RegisterDto, LoginDto } from './auth.schemas';

const SALT_ROUNDS = 10;

/**
 * Crea un error con código de estado HTTP adjunto, compatible con el middleware de errores.
 * @param message - Mensaje descriptivo del error.
 * @param statusCode - Código de estado HTTP a devolver (ej. 404, 409).
 * @returns Error enriquecido con `statusCode`.
 */
function createAppError(message: string, statusCode: number): Error & { statusCode: number } {
  return Object.assign(new Error(message), { statusCode });
}

/**
 * Firma un JWT con el ID y email del usuario.
 * @param userId - ID del usuario.
 * @param email - Email del usuario.
 * @returns JWT firmado con la clave secreta configurada en variables de entorno.
 */
function signToken(userId: number, email: string): string {
  return jwt.sign({ userId, email }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  });
}

/**
 * Elimina la contraseña y campos sensibles del objeto usuario antes de enviarlo al cliente.
 * @param user - Objeto usuario completo desde Prisma.
 * @returns Objeto usuario sin contraseña.
 */
function sanitizeUser(user: { id: number; name: string; lastName: string; email: string; role: string; active: boolean; firstLogin: boolean; termAndConditions: boolean; createdAt: Date; companyId?: number | null }) {
  const { id, name, lastName, email, role, active, firstLogin, termAndConditions, createdAt, companyId } = user;
  return { id, name, lastName, email, role, active, firstLogin, termAndConditions, createdAt, companyId: companyId ?? null };
}

/**
 * Registra un nuevo usuario en el sistema.
 * Lanza un error 409 si el email ya está en uso.
 * @param dto - Datos del nuevo usuario (nombre, apellido, email, contraseña, T&C).
 * @returns Objeto con el usuario sanitizado y el JWT de sesión.
 */
export async function register(dto: RegisterDto) {
  const existing = await prisma.user.findUnique({ where: { email: dto.email } });
  if (existing) {
    throw createAppError('Email already in use', 409);
  }

  const hashedPassword = await bcrypt.hash(dto.password, SALT_ROUNDS);

  const user = await prisma.user.create({
    data: {
      name: dto.name,
      lastName: dto.lastName,
      email: dto.email,
      password: hashedPassword,
      termAndConditions: dto.termAndConditions,
    },
  });

  const token = signToken(user.id, user.email);
  return { user: sanitizeUser(user), token };
}

/**
 * Autentica a un usuario existente con email y contraseña.
 * Lanza un error 401 si las credenciales son incorrectas o 403 si la cuenta está inactiva.
 * @param dto - Credenciales del usuario (email y contraseña).
 * @returns Objeto con el usuario sanitizado y el JWT de sesión.
 */
export async function login(dto: LoginDto) {
  const user = await prisma.user.findUnique({ where: { email: dto.email } });
  if (!user) {
    throw createAppError('Invalid credentials', 401);
  }

  if (!user.active) {
    throw createAppError('Account is disabled', 403);
  }

  const passwordMatch = await bcrypt.compare(dto.password, user.password);
  if (!passwordMatch) {
    throw createAppError('Invalid credentials', 401);
  }

  const token = signToken(user.id, user.email);
  return { user: sanitizeUser(user), token };
}

/**
 * Obtiene los datos del usuario autenticado a partir de su ID.
 * Lanza un error 404 si el usuario no existe en la base de datos.
 * @param userId - ID del usuario extraído del JWT.
 * @returns Datos del usuario sanitizados.
 */
export async function getMe(userId: number) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw createAppError('User not found', 404);
  }
  return sanitizeUser(user);
}
