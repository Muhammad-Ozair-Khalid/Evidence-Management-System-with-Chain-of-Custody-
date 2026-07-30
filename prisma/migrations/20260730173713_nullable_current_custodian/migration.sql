-- DropForeignKey
ALTER TABLE "EvidenceItem" DROP CONSTRAINT "EvidenceItem_currentCustodianId_fkey";

-- AlterTable
ALTER TABLE "EvidenceItem" ALTER COLUMN "currentCustodianId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "EvidenceItem" ADD CONSTRAINT "EvidenceItem_currentCustodianId_fkey" FOREIGN KEY ("currentCustodianId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
