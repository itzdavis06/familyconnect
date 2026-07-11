-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'ANCESTOR';

-- AlterTable
ALTER TABLE "FamilyMember" ADD COLUMN     "dateOfDeath" TIMESTAMP(3);
