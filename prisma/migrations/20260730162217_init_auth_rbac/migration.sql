-- CreateEnum
CREATE TYPE "Role" AS ENUM ('CUSTODIAN', 'EXAMINER', 'SUPERVISOR', 'ADMIN');

-- CreateEnum
CREATE TYPE "EvidenceType" AS ENUM ('DIGITAL_MEDIA', 'DOCUMENT', 'DEVICE', 'IMAGE_FORENSIC', 'OTHER');

-- CreateEnum
CREATE TYPE "EvidenceStatus" AS ENUM ('REGISTERED', 'IN_CUSTODY', 'UNDER_EXAMINATION', 'RETURNED', 'ARCHIVED', 'INTEGRITY_FLAGGED');

-- CreateEnum
CREATE TYPE "CustodyEventType" AS ENUM ('SEIZURE', 'TRANSFER', 'EXAMINATION', 'RETURN', 'RE_HASH_CHECK');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "badgeNumber" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EvidenceItem" (
    "id" TEXT NOT NULL,
    "caseNumber" TEXT NOT NULL,
    "evidenceId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "evidenceType" "EvidenceType" NOT NULL,
    "intakeDate" TIMESTAMP(3) NOT NULL,
    "intakeLocation" TEXT NOT NULL,
    "submittedById" TEXT NOT NULL,
    "currentCustodianId" TEXT NOT NULL,
    "currentHash" TEXT NOT NULL,
    "originalHash" TEXT NOT NULL,
    "status" "EvidenceStatus" NOT NULL DEFAULT 'REGISTERED',
    "returnedTo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EvidenceItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustodyEvent" (
    "id" TEXT NOT NULL,
    "evidenceItemId" TEXT NOT NULL,
    "eventType" "CustodyEventType" NOT NULL,
    "handlerFromId" TEXT,
    "handlerToId" TEXT,
    "returnDestination" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "location" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "hashAtEvent" TEXT NOT NULL,
    "hashMatch" BOOLEAN,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CustodyEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLogEntry" (
    "id" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "metadata" JSONB NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ipAddress" TEXT,

    CONSTRAINT "AuditLogEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EvidenceIdSequence" (
    "year" INTEGER NOT NULL,
    "lastN" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "EvidenceIdSequence_pkey" PRIMARY KEY ("year")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "EvidenceItem_evidenceId_key" ON "EvidenceItem"("evidenceId");

-- CreateIndex
CREATE INDEX "EvidenceItem_caseNumber_idx" ON "EvidenceItem"("caseNumber");

-- CreateIndex
CREATE INDEX "EvidenceItem_status_idx" ON "EvidenceItem"("status");

-- CreateIndex
CREATE INDEX "EvidenceItem_currentCustodianId_idx" ON "EvidenceItem"("currentCustodianId");

-- CreateIndex
CREATE INDEX "CustodyEvent_evidenceItemId_idx" ON "CustodyEvent"("evidenceItemId");

-- CreateIndex
CREATE INDEX "CustodyEvent_eventType_idx" ON "CustodyEvent"("eventType");

-- CreateIndex
CREATE INDEX "CustodyEvent_timestamp_idx" ON "CustodyEvent"("timestamp");

-- CreateIndex
CREATE INDEX "AuditLogEntry_actorId_idx" ON "AuditLogEntry"("actorId");

-- CreateIndex
CREATE INDEX "AuditLogEntry_action_idx" ON "AuditLogEntry"("action");

-- CreateIndex
CREATE INDEX "AuditLogEntry_entityType_entityId_idx" ON "AuditLogEntry"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "AuditLogEntry_timestamp_idx" ON "AuditLogEntry"("timestamp");

-- AddForeignKey
ALTER TABLE "EvidenceItem" ADD CONSTRAINT "EvidenceItem_submittedById_fkey" FOREIGN KEY ("submittedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvidenceItem" ADD CONSTRAINT "EvidenceItem_currentCustodianId_fkey" FOREIGN KEY ("currentCustodianId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustodyEvent" ADD CONSTRAINT "CustodyEvent_evidenceItemId_fkey" FOREIGN KEY ("evidenceItemId") REFERENCES "EvidenceItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustodyEvent" ADD CONSTRAINT "CustodyEvent_handlerFromId_fkey" FOREIGN KEY ("handlerFromId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustodyEvent" ADD CONSTRAINT "CustodyEvent_handlerToId_fkey" FOREIGN KEY ("handlerToId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLogEntry" ADD CONSTRAINT "AuditLogEntry_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
