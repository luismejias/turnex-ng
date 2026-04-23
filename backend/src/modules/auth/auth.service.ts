import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../../config/prisma';
import { env } from '../../config/env';
import type { RegisterDto, LoginDto } from './auth.schemas';

const SALT_ROUNDS = 10;

function createAppError(message: string, statusCode: number): Error & { statusCode: number } {
  return Object.assign(new Error(message), { statusCode });
}

function signToken(userId: number, email: string): string {
  return jwt.sign({ userId, email }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  });
}

function sanitizeUser(user: { id: number; name: string; lastName: string; email: string; role: string; active: boolean; termAndConditions: boolean; createdAt: Date }) {
  const { id, name, lastName, email, role, active, termAndConditions, createdAt } = user;
  return { id, name, lastName, email, role, active, termAndConditions, createdAt };
}

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

export async function getMe(userId: number) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw createAppError('User not found', 404);
  }
  return sanitizeUser(user);
}
