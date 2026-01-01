/*
  Warnings:

  - The values [SUPERVISOR,EVALUATOR] on the enum `Role` will be removed. If these variants are still used in the database, this will fail.
  - The `status` column on the `Application` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `active` on the `Offer` table. All the data in the column will be lost.
  - You are about to drop the column `supervisorId` on the `Practice` table. All the data in the column will be lost.
  - The `status` column on the `Practice` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `company` on the `PracticeRequest` table. All the data in the column will be lost.
  - The `status` column on the `PracticeRequest` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `enabled` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `rut` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `Document` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Evaluation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PracticaVerano` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[rut]` on the table `Student` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updatedAt` to the `Application` table without a default value. This is not possible if the table is not empty.
  - Added the required column `hours` to the `Offer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `modality` to the `Offer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `company` to the `Practice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `endDate` to the `Practice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startDate` to the `Practice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `Practice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `companyName` to the `PracticeRequest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `PracticeRequest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `rut` to the `Student` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('PEND_EVAL', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "PracticeType" AS ENUM ('INTERNAL', 'EXTERNAL');

-- AlterEnum
BEGIN;
CREATE TYPE "Role_new" AS ENUM ('STUDENT', 'COORDINATION');
ALTER TABLE "User" ALTER COLUMN "role" TYPE "Role_new" USING ("role"::text::"Role_new");
ALTER TYPE "Role" RENAME TO "Role_old";
ALTER TYPE "Role_new" RENAME TO "Role";
DROP TYPE "Role_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "Document" DROP CONSTRAINT "Document_practiceId_fkey";

-- DropForeignKey
ALTER TABLE "Evaluation" DROP CONSTRAINT "Evaluation_evaluatorId_fkey";

-- DropForeignKey
ALTER TABLE "Evaluation" DROP CONSTRAINT "Evaluation_practiceId_fkey";

-- DropForeignKey
ALTER TABLE "Practice" DROP CONSTRAINT "Practice_evaluatorId_fkey";

-- DropForeignKey
ALTER TABLE "Practice" DROP CONSTRAINT "Practice_supervisorId_fkey";

-- DropIndex
DROP INDEX "User_rut_key";

-- AlterTable
ALTER TABLE "Application" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" "ApplicationStatus" NOT NULL DEFAULT 'PEND_EVAL';

-- AlterTable
ALTER TABLE "Offer" DROP COLUMN "active",
ADD COLUMN     "deadline" TIMESTAMP(3),
ADD COLUMN     "hours" INTEGER NOT NULL,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "modality" TEXT NOT NULL,
ADD COLUMN     "startDate" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Practice" DROP COLUMN "supervisorId",
ADD COLUMN     "company" TEXT NOT NULL,
ADD COLUMN     "endDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "startDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "type" "PracticeType" NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'OPEN';

-- AlterTable
ALTER TABLE "PracticeRequest" DROP COLUMN "company",
ADD COLUMN     "companyName" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" "ApplicationStatus" NOT NULL DEFAULT 'PEND_EVAL';

-- AlterTable
ALTER TABLE "Student" ADD COLUMN     "rut" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "enabled",
DROP COLUMN "rut";

-- DropTable
DROP TABLE "Document";

-- DropTable
DROP TABLE "Evaluation";

-- DropTable
DROP TABLE "PracticaVerano";

-- DropEnum
DROP TYPE "DocumentType";

-- DropEnum
DROP TYPE "PracticaVeranoEstado";

-- DropEnum
DROP TYPE "PracticeStatus";

-- DropEnum
DROP TYPE "Status";

-- CreateTable
CREATE TABLE "Evaluator" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,

    CONSTRAINT "Evaluator_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Evaluator_email_key" ON "Evaluator"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Student_rut_key" ON "Student"("rut");

-- AddForeignKey
ALTER TABLE "Practice" ADD CONSTRAINT "Practice_evaluatorId_fkey" FOREIGN KEY ("evaluatorId") REFERENCES "Evaluator"("id") ON DELETE SET NULL ON UPDATE CASCADE;
