-- CreateEnum
CREATE TYPE "PracticaVeranoEstado" AS ENUM ('PENDIENTE', 'APROBADO', 'RECHAZADO', 'EN_PROCESO');

-- CreateTable
CREATE TABLE "PracticaVerano" (
    "id" SERIAL NOT NULL,
    "rut" TEXT NOT NULL,
    "nombreEstudiante" TEXT NOT NULL,
    "carrera" TEXT NOT NULL,
    "empresa" TEXT NOT NULL,
    "areaPractica" TEXT NOT NULL,
    "email" TEXT,
    "telefono" TEXT,
    "estado" "PracticaVeranoEstado" NOT NULL DEFAULT 'PENDIENTE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PracticaVerano_pkey" PRIMARY KEY ("id")
);
