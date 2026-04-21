import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.pack.createMany({
    skipDuplicates: true,
    data: [
      { id: 1, description: '4 clases al mes', price: 0, duration: 'mensual' },
      { id: 2, description: '8 clases al mes', price: 0, duration: 'mensual' },
      { id: 3, description: '12 clases al mes', price: 0, duration: 'mensual' },
      { id: 4, description: 'Clase suelta', price: 0, duration: 'única' },
    ],
  });

  await prisma.specialty.createMany({
    skipDuplicates: true,
    data: [
      { id: 1, description: 'Pilates' },
      { id: 2, description: 'Osteopatía' },
    ],
  });

  console.log('Seed completed');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
