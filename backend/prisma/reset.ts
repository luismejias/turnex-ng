import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Resetting database...');

  // Delete in FK-safe order
  await prisma.shift.deleteMany();
  console.log('✓ Shifts deleted');

  await prisma.companySpecialty.deleteMany();
  console.log('✓ CompanySpecialties deleted');

  await prisma.companyProfile.deleteMany();
  console.log('✓ CompanyProfiles deleted');

  await prisma.companySchedule.deleteMany();
  console.log('✓ CompanySchedules deleted');

  // Detach super_admin from company before deleting companies
  await prisma.user.updateMany({
    where: { role: 'SUPER_ADMIN' },
    data: { companyId: null },
  });

  // Delete all non-super_admin users
  await prisma.user.deleteMany({ where: { role: { not: 'SUPER_ADMIN' } } });
  console.log('✓ Non-admin users deleted');

  await prisma.company.deleteMany();
  console.log('✓ Companies deleted');

  await prisma.specialty.deleteMany();
  console.log('✓ Specialties deleted');

  const superAdmin = await prisma.user.findFirst({ where: { role: 'SUPER_ADMIN' } });
  console.log(`\nRemaining super_admin: ${superAdmin?.name} ${superAdmin?.lastName} (${superAdmin?.email})`);
  console.log('\nReset complete.');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
