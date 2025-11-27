-- CreateTable
CREATE TABLE "MaterialDidatico" (
    "id" SERIAL NOT NULL,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT,
    "url" TEXT NOT NULL,
    "turmaId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MaterialDidatico_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "MaterialDidatico" ADD CONSTRAINT "MaterialDidatico_turmaId_fkey" FOREIGN KEY ("turmaId") REFERENCES "TurmaCursoUmbanda"("id") ON DELETE SET NULL ON UPDATE CASCADE;
