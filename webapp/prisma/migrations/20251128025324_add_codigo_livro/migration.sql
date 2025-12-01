/*
  Warnings:

  - A unique constraint covering the columns `[codigo]` on the table `Livro` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `codigo` to the `Livro` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Livro" ADD COLUMN     "codigo" TEXT NOT NULL,
ADD COLUMN     "genero" TEXT,
ADD COLUMN     "sinopse" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Livro_codigo_key" ON "Livro"("codigo");
