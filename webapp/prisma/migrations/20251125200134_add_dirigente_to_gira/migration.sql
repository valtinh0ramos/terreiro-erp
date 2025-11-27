-- AlterTable
ALTER TABLE "Gira" ADD COLUMN     "dirigenteId" INTEGER;

-- AddForeignKey
ALTER TABLE "Gira" ADD CONSTRAINT "Gira_dirigenteId_fkey" FOREIGN KEY ("dirigenteId") REFERENCES "Medium"("id") ON DELETE SET NULL ON UPDATE CASCADE;
