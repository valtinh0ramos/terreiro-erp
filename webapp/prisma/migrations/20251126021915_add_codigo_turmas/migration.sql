/*
  Warnings:

  - You are about to drop the column `dirigenteId` on the `Gira` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[codigo]` on the table `TurmaCursoUmbanda` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `codigo` to the `TurmaCursoUmbanda` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Gira" DROP COLUMN "dirigenteId";

-- AlterTable
ALTER TABLE "TurmaCursoUmbanda" ADD COLUMN     "codigo" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "TurmaCursoUmbanda_codigo_key" ON "TurmaCursoUmbanda"("codigo");
