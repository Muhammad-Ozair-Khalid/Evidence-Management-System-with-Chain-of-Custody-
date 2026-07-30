-- AlterTable
ALTER TABLE "EvidenceItem" ADD COLUMN     "fileName" TEXT,
ADD COLUMN     "filePath" TEXT,
ADD COLUMN     "fileSize" INTEGER,
ADD COLUMN     "hashSource" TEXT NOT NULL DEFAULT 'UPLOAD',
ADD COLUMN     "mimeType" TEXT;
