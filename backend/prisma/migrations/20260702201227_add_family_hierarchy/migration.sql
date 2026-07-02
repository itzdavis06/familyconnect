-- AlterTable
ALTER TABLE "FamilyMember" ADD COLUMN     "parentMemberId" TEXT;

-- AddForeignKey
ALTER TABLE "FamilyMember" ADD CONSTRAINT "FamilyMember_parentMemberId_fkey" FOREIGN KEY ("parentMemberId") REFERENCES "FamilyMember"("id") ON DELETE SET NULL ON UPDATE CASCADE;
