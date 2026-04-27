import { prisma } from '../../config/prisma';

/**
 * Obtiene todas las especialidades activas del catálogo global.
 * @returns Lista de especialidades activas ordenadas por ID ascendente.
 */
export async function getAllSpecialties() {
  return prisma.specialty.findMany({ where: { active: true }, orderBy: { id: 'asc' } });
}
