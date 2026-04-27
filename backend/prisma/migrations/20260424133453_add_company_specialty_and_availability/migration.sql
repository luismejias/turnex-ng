-- AlterTable
ALTER TABLE "shifts" ADD COLUMN     "companySpecialtyId" INTEGER;

-- CreateTable
CREATE TABLE "company_specialties" (
    "id" SERIAL NOT NULL,
    "companyId" INTEGER NOT NULL,
    "scheduleId" INTEGER,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "capacity" INTEGER NOT NULL DEFAULT 10,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "company_specialties_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "shifts" ADD CONSTRAINT "shifts_companySpecialtyId_fkey" FOREIGN KEY ("companySpecialtyId") REFERENCES "company_specialties"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_specialties" ADD CONSTRAINT "company_specialties_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_specialties" ADD CONSTRAINT "company_specialties_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES "company_schedules"("id") ON DELETE SET NULL ON UPDATE CASCADE;
