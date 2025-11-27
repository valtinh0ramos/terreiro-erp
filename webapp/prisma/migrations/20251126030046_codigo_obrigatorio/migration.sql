/*
  Warnings:

  - Made the column `codigo` on table `Medium` required. This step will fail if there are existing NULL values in that column.
  - Made the column `codigo` on table `Pretendente` required. This step will fail if there are existing NULL values in that column.
  - Made the column `codigo` on table `Voluntario` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Medium" ALTER COLUMN "codigo" SET NOT NULL;

-- AlterTable
ALTER TABLE "Pretendente" ALTER COLUMN "codigo" SET NOT NULL;

-- AlterTable
ALTER TABLE "Voluntario" ALTER COLUMN "codigo" SET NOT NULL;
