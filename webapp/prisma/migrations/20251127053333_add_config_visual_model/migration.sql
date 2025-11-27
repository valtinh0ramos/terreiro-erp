-- CreateTable
CREATE TABLE "ConfigVisual" (
    "id" SERIAL NOT NULL,
    "tema" "TemaVisual" NOT NULL DEFAULT 'VERDE',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConfigVisual_pkey" PRIMARY KEY ("id")
);
