/*
  Warnings:

  - A unique constraint covering the columns `[codigo]` on the table `Medium` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[codigo]` on the table `Pretendente` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[codigo]` on the table `Voluntario` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Medium" ADD COLUMN     "codigo" TEXT;

-- AlterTable
ALTER TABLE "Pretendente" ADD COLUMN     "codigo" TEXT;

-- AlterTable
ALTER TABLE "Voluntario" ADD COLUMN     "codigo" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Medium_codigo_key" ON "Medium"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "Pretendente_codigo_key" ON "Pretendente"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "Voluntario_codigo_key" ON "Voluntario"("codigo");
