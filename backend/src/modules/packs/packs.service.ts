import { prisma } from '../../config/prisma';

/**
 * Obtiene todos los packs activos disponibles para contratar.
 * @returns Lista de packs activos ordenados por ID ascendente.
 */
export async function getAllPacks() {
  return prisma.pack.findMany({ where: { active: true }, orderBy: { id: 'asc' } });
}
