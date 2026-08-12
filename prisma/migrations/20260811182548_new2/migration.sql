-- CreateEnum
CREATE TYPE "WhatsAppScheduleStatus" AS ENUM ('PENDING', 'PROCESSING', 'SENT', 'FAILED', 'CANCELLED');

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "updated_at" DROP DEFAULT;

-- CreateTable
CREATE TABLE "whatsapp_schedules" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "message" TEXT NOT NULL,
    "status" "WhatsAppScheduleStatus" NOT NULL DEFAULT 'PENDING',
    "sentAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "whatsapp_schedules_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "whatsapp_schedules_patientId_idx" ON "whatsapp_schedules"("patientId");

-- CreateIndex
CREATE INDEX "whatsapp_schedules_scheduledAt_idx" ON "whatsapp_schedules"("scheduledAt");

-- CreateIndex
CREATE INDEX "whatsapp_schedules_status_idx" ON "whatsapp_schedules"("status");

-- AddForeignKey
ALTER TABLE "whatsapp_schedules" ADD CONSTRAINT "whatsapp_schedules_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;
