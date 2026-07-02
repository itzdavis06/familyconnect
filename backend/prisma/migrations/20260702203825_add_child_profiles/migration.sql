-- DropForeignKey
ALTER TABLE "FamilyMember" DROP CONSTRAINT "FamilyMember_userId_fkey";

-- AlterTable
ALTER TABLE "FamilyMember" ADD COLUMN     "childDateOfBirth" TIMESTAMP(3),
ADD COLUMN     "childFullName" TEXT,
ADD COLUMN     "createdByUserId" TEXT,
ALTER COLUMN "userId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "FamilyMember" ADD CONSTRAINT "FamilyMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
