import { prisma } from '../../config/prisma';

export async function getAllSpecialties() {
  return prisma.specialty.findMany({ where: { active: true }, orderBy: { id: 'asc' } });
}
