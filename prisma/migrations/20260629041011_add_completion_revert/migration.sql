-- AlterTable
ALTER TABLE "ShiftCompletion" ADD COLUMN     "revertedAt" TIMESTAMP(3),
ADD COLUMN     "revertedById" TEXT;

-- AddForeignKey
ALTER TABLE "ShiftCompletion" ADD CONSTRAINT "ShiftCompletion_revertedById_fkey" FOREIGN KEY ("revertedById") REFERENCES "OrgMember"("id") ON DELETE SET NULL ON UPDATE CASCADE;
