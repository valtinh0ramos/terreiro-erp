-- CreateEnum
CREATE TYPE "NivelAcesso" AS ENUM ('COMUM', 'AVANCADO', 'SUPERUSER');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "nivelAcesso" "NivelAcesso" NOT NULL DEFAULT 'SUPERUSER';
