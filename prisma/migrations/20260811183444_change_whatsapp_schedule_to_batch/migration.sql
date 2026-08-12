/*
  Warnings:

  - You are about to drop the column `message` on the `whatsapp_schedules` table. All the data in the column will be lost.
  - You are about to drop the column `patientId` on the `whatsapp_schedules` table. All the data in the column will be lost.
  - Added the required column `userId` to the `whatsapp_schedules` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "whatsapp_schedules" DROP CONSTRAINT "whatsapp_schedules_patientId_fkey";

-- DropIndex
DROP INDEX "whatsapp_schedules_patientId_idx";

-- AlterTable
ALTER TABLE "accounts" ALTER COLUMN "updated_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "whatsapp_schedules" DROP COLUMN "message",
DROP COLUMN "patientId",
ADD COLUMN     "userId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "whatsapp_schedules_userId_idx" ON "whatsapp_schedules"("userId");

-- AddForeignKey
ALTER TABLE "whatsapp_schedules" ADD CONSTRAINT "whatsapp_schedules_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
