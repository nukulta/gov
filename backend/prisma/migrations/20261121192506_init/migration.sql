-- CreateEnum
CREATE TYPE "Role" AS ENUM ('SUPER_ADMIN', 'ADMIN', 'DATA_ENTRY', 'VIEWER');

-- CreateEnum
CREATE TYPE "RecordStatus" AS ENUM ('ACTIVE', 'ARCHIVED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'VIEWER',
    "failedAttempts" INTEGER NOT NULL DEFAULT 0,
    "lockedUntil" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Faculty" (
    "id" TEXT NOT NULL,
    "serialNo" SERIAL NOT NULL,
    "honorific" TEXT,
    "name" TEXT,
    "topic" TEXT,
    "post" TEXT,
    "service" TEXT,
    "officeAddress" TEXT,
    "email" TEXT,
    "mobile" TEXT,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT,

    CONSTRAINT "Faculty_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Training" (
    "id" TEXT NOT NULL,
    "serialNo" SERIAL NOT NULL,
    "name" TEXT,
    "type" TEXT,
    "conductedMonth" TEXT,
    "conductedYear" INTEGER,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "numberOfDays" INTEGER,
    "employeeId" INTEGER,
    "participantName" TEXT,
    "gender" TEXT,
    "designation" TEXT,
    "employeeType" TEXT,
    "service" TEXT,
    "officeName" TEXT,
    "email" TEXT,
    "mobile" TEXT,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT,

    CONSTRAINT "Training_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Participation" (
    "id" TEXT NOT NULL,
    "serialNo" SERIAL NOT NULL,
    "training" TEXT,
    "duration" INTEGER,
    "mode" TEXT,
    "month" TEXT,
    "year" INTEGER,
    "dateFrom" TIMESTAMP(3),
    "dateTo" TIMESTAMP(3),
    "batchSize" INTEGER,
    "male" INTEGER,
    "female" INTEGER,
    "categories" JSONB,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT,

    CONSTRAINT "Participation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrainingDatabaseRecord" (
    "id" TEXT NOT NULL,
    "serialNo" SERIAL NOT NULL,
    "trainingName" TEXT,
    "duration" TEXT,
    "facultyName" TEXT,
    "officeName" TEXT,
    "email" TEXT,
    "mobile" TEXT,
    "topic" TEXT,
    "lectures" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TrainingDatabaseRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RestrictedFinancialDetails" (
    "id" TEXT NOT NULL,
    "recordId" TEXT NOT NULL,
    "encryptedAccount" TEXT,
    "encryptedPan" TEXT,

    CONSTRAINT "RestrictedFinancialDetails_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DropdownValue" (
    "id" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DropdownValue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT,
    "metadata" JSONB,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DatabaseInitialization" (
    "id" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "fileName" TEXT,
    "initializedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "initializedBy" TEXT,

    CONSTRAINT "DatabaseInitialization_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Session_expiresAt_idx" ON "Session"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "Faculty_serialNo_key" ON "Faculty"("serialNo");

-- CreateIndex
CREATE INDEX "Faculty_name_idx" ON "Faculty"("name");

-- CreateIndex
CREATE INDEX "Faculty_service_idx" ON "Faculty"("service");

-- CreateIndex
CREATE UNIQUE INDEX "Training_serialNo_key" ON "Training"("serialNo");

-- CreateIndex
CREATE INDEX "Training_name_idx" ON "Training"("name");

-- CreateIndex
CREATE INDEX "Training_conductedYear_idx" ON "Training"("conductedYear");

-- CreateIndex
CREATE UNIQUE INDEX "Participation_serialNo_key" ON "Participation"("serialNo");

-- CreateIndex
CREATE INDEX "Participation_year_idx" ON "Participation"("year");

-- CreateIndex
CREATE UNIQUE INDEX "TrainingDatabaseRecord_serialNo_key" ON "TrainingDatabaseRecord"("serialNo");

-- CreateIndex
CREATE UNIQUE INDEX "RestrictedFinancialDetails_recordId_key" ON "RestrictedFinancialDetails"("recordId");

-- CreateIndex
CREATE UNIQUE INDEX "DropdownValue_category_value_key" ON "DropdownValue"("category", "value");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Faculty" ADD CONSTRAINT "Faculty_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Training" ADD CONSTRAINT "Training_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Participation" ADD CONSTRAINT "Participation_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RestrictedFinancialDetails" ADD CONSTRAINT "RestrictedFinancialDetails_recordId_fkey" FOREIGN KEY ("recordId") REFERENCES "TrainingDatabaseRecord"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
