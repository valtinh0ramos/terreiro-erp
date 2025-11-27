-- CreateEnum
CREATE TYPE "LinhaTrabalhoGuia" AS ENUM ('CABOCLO', 'PRETO_VELHO', 'BAIANO', 'BOIADEIRO', 'MARINHEIRO', 'IBEJI', 'CIGANO', 'EXU', 'POMBAGIRA', 'MALANDRO', 'EXU_MIRIM', 'MEDICO', 'MESTRE_ORIENTE');

-- AlterTable
ALTER TABLE "Gira" ADD COLUMN     "ata" TEXT,
ADD COLUMN     "dirigenteId" INTEGER,
ADD COLUMN     "guiaChefeId" INTEGER,
ADD COLUMN     "horarioFim" TIMESTAMP(3),
ADD COLUMN     "horarioInicio" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "GuiaEspiritual" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "linha" "LinhaTrabalhoGuia" NOT NULL,
    "mediumId" INTEGER,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "observacoes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GuiaEspiritual_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "GuiaEspiritual" ADD CONSTRAINT "GuiaEspiritual_mediumId_fkey" FOREIGN KEY ("mediumId") REFERENCES "Medium"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Gira" ADD CONSTRAINT "Gira_dirigenteId_fkey" FOREIGN KEY ("dirigenteId") REFERENCES "Medium"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Gira" ADD CONSTRAINT "Gira_guiaChefeId_fkey" FOREIGN KEY ("guiaChefeId") REFERENCES "GuiaEspiritual"("id") ON DELETE SET NULL ON UPDATE CASCADE;
