import { prisma } from '../../config/prisma';

export async function getAllPacks() {
  return prisma.pack.findMany({ where: { active: true }, orderBy: { id: 'asc' } });
}
