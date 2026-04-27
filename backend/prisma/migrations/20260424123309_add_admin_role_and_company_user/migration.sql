-- AlterEnum
ALTER TYPE "UserRole" ADD VALUE 'ADMIN';

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "companyId" INTEGER;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE SET NULL ON UPDATE CASCADE;
