-- CreateEnum
CREATE TYPE "Role" AS ENUM ('DIRECAO', 'SECRETARIA', 'FINANCEIRO', 'COORDENACAO_ESTUDOS', 'BIBLIOTECA', 'ESTOQUE_CANTINA', 'MEDIUM_LIMITADO');

-- CreateEnum
CREATE TYPE "MediumNivel" AS ENUM ('NIVEL_1_INICIANTE', 'NIVEL_2_DESENVOLVIMENTO', 'NIVEL_3_TRABALHO_SEM_CONSULTA', 'NIVEL_4_TRABALHO_COMPLETO', 'NIVEL_5_LIDER_SESSAO', 'NIVEL_6_PAI_MAE_PEQUENA', 'NIVEL_7_DIRIGENTE_INTERNO', 'NIVEL_8_DIRIGENTE_GERAL');

-- CreateEnum
CREATE TYPE "MediumStatus" AS ENUM ('ATIVO', 'AFASTADO', 'SUSPENSO', 'DESLIGADO');

-- CreateEnum
CREATE TYPE "MedidaDisciplinaTipo" AS ENUM ('ADVERTENCIA', 'SUSPENSAO', 'EXPULSAO');

-- CreateEnum
CREATE TYPE "MedidaDisciplinaStatus" AS ENUM ('ATIVA', 'ENCERRADA');

-- CreateEnum
CREATE TYPE "DoacaoTipo" AS ENUM ('FINANCEIRA', 'MATERIAL');

-- CreateEnum
CREATE TYPE "FormaPagamento" AS ENUM ('DINHEIRO', 'PIX', 'CARTAO', 'OUTRO');

-- CreateEnum
CREATE TYPE "MovimentacaoTipo" AS ENUM ('ENTRADA', 'SAIDA', 'AJUSTE');

-- CreateEnum
CREATE TYPE "PretendenteStatusCurso" AS ENUM ('EM_CURSO', 'CONCLUIDO', 'TRANCOU', 'DESISTIU', 'REPROVADO');

-- CreateEnum
CREATE TYPE "PretendenteResultado" AS ENUM ('APTO_CORRENTE', 'INAPTO_CORRENTE', 'NAO_QUER_CORRENTE_VOLUNTARIADO', 'ACOMPANHAR_MAIS');

-- CreateEnum
CREATE TYPE "VoluntarioTipo" AS ENUM ('EX_PRETENDENTE', 'MEDIUM', 'EXTERNO');

-- CreateEnum
CREATE TYPE "PalestraTipo" AS ENUM ('INTERNA', 'EXTERNA');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senhaHash" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Medium" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "dataNascimento" TIMESTAMP(3),
    "signo" TEXT,
    "nacionalidade" TEXT,
    "naturalidade" TEXT,
    "escolaridade" TEXT,
    "profissao" TEXT,
    "estadoCivil" TEXT,
    "conjuge" TEXT,
    "filhos" TEXT,
    "filiacao" TEXT,
    "telefone" TEXT,
    "email" TEXT,
    "dataEntrada" TIMESTAMP(3),
    "casaAnterior" TEXT,
    "orixasCabeca" TEXT,
    "nomeGuiaChefe" TEXT,
    "guiasPrincipais" JSONB,
    "padrinhoMadrinha" TEXT,
    "nivel" "MediumNivel" NOT NULL DEFAULT 'NIVEL_1_INICIANTE',
    "status" "MediumStatus" NOT NULL DEFAULT 'ATIVO',
    "doencas" TEXT,
    "medicacoes" TEXT,
    "alergias" TEXT,
    "observacoesSaude" TEXT,
    "orientacaoSexual" TEXT,
    "fotoUrl" TEXT,
    "observacoesDirecao" TEXT,
    "dataDesligamento" TIMESTAMP(3),
    "userId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Medium_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Gira" (
    "id" SERIAL NOT NULL,
    "data" TIMESTAMP(3) NOT NULL,
    "tipo" TEXT NOT NULL,
    "observacoes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Gira_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Presenca" (
    "id" SERIAL NOT NULL,
    "mediumId" INTEGER NOT NULL,
    "giraId" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "observacao" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Presenca_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Iniciacao" (
    "id" SERIAL NOT NULL,
    "mediumId" INTEGER NOT NULL,
    "tipo" TEXT NOT NULL,
    "data" TIMESTAMP(3) NOT NULL,
    "observacoes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Iniciacao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MedidaDisciplina" (
    "id" SERIAL NOT NULL,
    "mediumId" INTEGER NOT NULL,
    "tipo" "MedidaDisciplinaTipo" NOT NULL,
    "motivo" TEXT NOT NULL,
    "dataCriacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dataInicio" TIMESTAMP(3),
    "dataFim" TIMESTAMP(3),
    "status" "MedidaDisciplinaStatus" NOT NULL DEFAULT 'ATIVA',
    "geradaAutomaticamente" BOOLEAN NOT NULL DEFAULT false,
    "pdfPath" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MedidaDisciplina_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Mensalidade" (
    "id" SERIAL NOT NULL,
    "mediumId" INTEGER NOT NULL,
    "competencia" TEXT NOT NULL,
    "valor" DECIMAL(10,2) NOT NULL,
    "status" TEXT NOT NULL,
    "dataPagamento" TIMESTAMP(3),
    "formaPagamento" "FormaPagamento",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Mensalidade_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Doacao" (
    "id" SERIAL NOT NULL,
    "tipo" "DoacaoTipo" NOT NULL,
    "mediumId" INTEGER,
    "doadorExterno" TEXT,
    "valor" DECIMAL(10,2),
    "data" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "formaPagamento" "FormaPagamento",
    "observacoes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Doacao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DoacaoItem" (
    "id" SERIAL NOT NULL,
    "doacaoId" INTEGER NOT NULL,
    "produtoEstoqueId" INTEGER NOT NULL,
    "quantidade" DECIMAL(10,3) NOT NULL,

    CONSTRAINT "DoacaoItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProdutoEstoque" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "categoria" TEXT NOT NULL,
    "unidade" TEXT NOT NULL,
    "estoqueMinimo" DECIMAL(10,3),
    "quantidadeAtual" DECIMAL(10,3) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProdutoEstoque_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MovimentacaoEstoque" (
    "id" SERIAL NOT NULL,
    "produtoEstoqueId" INTEGER NOT NULL,
    "tipo" "MovimentacaoTipo" NOT NULL,
    "quantidade" DECIMAL(10,3) NOT NULL,
    "data" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "origem" TEXT,
    "observacao" TEXT,

    CONSTRAINT "MovimentacaoEstoque_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProdutoCantina" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "preco" DECIMAL(10,2) NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "produtoEstoqueId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProdutoCantina_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VendaCantina" (
    "id" SERIAL NOT NULL,
    "data" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "mediumId" INTEGER,
    "compradorExterno" TEXT,
    "formaPagamento" "FormaPagamento" NOT NULL,
    "total" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VendaCantina_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VendaCantinaItem" (
    "id" SERIAL NOT NULL,
    "vendaCantinaId" INTEGER NOT NULL,
    "produtoId" INTEGER NOT NULL,
    "quantidade" INTEGER NOT NULL,
    "precoUnitario" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "VendaCantinaItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Livro" (
    "id" SERIAL NOT NULL,
    "titulo" TEXT NOT NULL,
    "autor" TEXT,
    "editora" TEXT,
    "ano" INTEGER,
    "tema" TEXT,
    "localizacao" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Livro_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExemplarLivro" (
    "id" SERIAL NOT NULL,
    "livroId" INTEGER NOT NULL,
    "codigoTombo" TEXT NOT NULL,
    "estado" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExemplarLivro_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmprestimoLivro" (
    "id" SERIAL NOT NULL,
    "exemplarId" INTEGER NOT NULL,
    "mediumId" INTEGER NOT NULL,
    "dataSaida" TIMESTAMP(3) NOT NULL,
    "dataPrevista" TIMESTAMP(3) NOT NULL,
    "dataDevolucao" TIMESTAMP(3),
    "observacoes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmprestimoLivro_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pretendente" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "dataNascimento" TIMESTAMP(3),
    "email" TEXT,
    "telefone" TEXT,
    "escolaridade" TEXT,
    "profissao" TEXT,
    "endereco" TEXT,
    "indicacao" TEXT,
    "observacoes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Pretendente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TurmaCursoUmbanda" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "cursoNome" TEXT NOT NULL,
    "dataInicio" TIMESTAMP(3),
    "dataPrevistaFim" TIMESTAMP(3),
    "dataRealFim" TIMESTAMP(3),
    "diaDaSemana" TEXT,
    "observacoes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TurmaCursoUmbanda_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MatriculaCursoUmbanda" (
    "id" SERIAL NOT NULL,
    "pretendenteId" INTEGER NOT NULL,
    "turmaId" INTEGER NOT NULL,
    "dataInicio" TIMESTAMP(3),
    "statusCurso" "PretendenteStatusCurso" NOT NULL,
    "etapaParou" TEXT,
    "observacoes" TEXT,
    "resultadoFinal" "PretendenteResultado",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MatriculaCursoUmbanda_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Voluntario" (
    "id" SERIAL NOT NULL,
    "pretendenteId" INTEGER,
    "mediumId" INTEGER,
    "tipo" "VoluntarioTipo" NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT,
    "telefone" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "areasAtuacao" TEXT,
    "observacoes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Voluntario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PalestranteEspecialidade" (
    "id" SERIAL NOT NULL,
    "mediumId" INTEGER NOT NULL,
    "tema" TEXT NOT NULL,
    "nivel" INTEGER NOT NULL,
    "observacoes" TEXT,
    "dataAutorizacao" TIMESTAMP(3),
    "autorizadoPor" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PalestranteEspecialidade_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Palestra" (
    "id" SERIAL NOT NULL,
    "mediumId" INTEGER NOT NULL,
    "tema" TEXT NOT NULL,
    "tipo" "PalestraTipo" NOT NULL,
    "local" TEXT,
    "data" TIMESTAMP(3) NOT NULL,
    "observacoes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Palestra_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MoncaoAplausos" (
    "id" SERIAL NOT NULL,
    "mediumId" INTEGER,
    "nomeHomenageado" TEXT NOT NULL,
    "tipoHomenageado" TEXT NOT NULL,
    "motivo" TEXT NOT NULL,
    "data" TIMESTAMP(3) NOT NULL,
    "dirigenteAssinatura" TEXT,
    "pdfPath" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MoncaoAplausos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Medium_userId_key" ON "Medium"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Presenca_mediumId_giraId_key" ON "Presenca"("mediumId", "giraId");

-- CreateIndex
CREATE UNIQUE INDEX "Mensalidade_mediumId_competencia_key" ON "Mensalidade"("mediumId", "competencia");

-- CreateIndex
CREATE UNIQUE INDEX "ExemplarLivro_codigoTombo_key" ON "ExemplarLivro"("codigoTombo");

-- AddForeignKey
ALTER TABLE "Medium" ADD CONSTRAINT "Medium_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Presenca" ADD CONSTRAINT "Presenca_mediumId_fkey" FOREIGN KEY ("mediumId") REFERENCES "Medium"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Presenca" ADD CONSTRAINT "Presenca_giraId_fkey" FOREIGN KEY ("giraId") REFERENCES "Gira"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Iniciacao" ADD CONSTRAINT "Iniciacao_mediumId_fkey" FOREIGN KEY ("mediumId") REFERENCES "Medium"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MedidaDisciplina" ADD CONSTRAINT "MedidaDisciplina_mediumId_fkey" FOREIGN KEY ("mediumId") REFERENCES "Medium"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mensalidade" ADD CONSTRAINT "Mensalidade_mediumId_fkey" FOREIGN KEY ("mediumId") REFERENCES "Medium"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Doacao" ADD CONSTRAINT "Doacao_mediumId_fkey" FOREIGN KEY ("mediumId") REFERENCES "Medium"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DoacaoItem" ADD CONSTRAINT "DoacaoItem_doacaoId_fkey" FOREIGN KEY ("doacaoId") REFERENCES "Doacao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DoacaoItem" ADD CONSTRAINT "DoacaoItem_produtoEstoqueId_fkey" FOREIGN KEY ("produtoEstoqueId") REFERENCES "ProdutoEstoque"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovimentacaoEstoque" ADD CONSTRAINT "MovimentacaoEstoque_produtoEstoqueId_fkey" FOREIGN KEY ("produtoEstoqueId") REFERENCES "ProdutoEstoque"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProdutoCantina" ADD CONSTRAINT "ProdutoCantina_produtoEstoqueId_fkey" FOREIGN KEY ("produtoEstoqueId") REFERENCES "ProdutoEstoque"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VendaCantina" ADD CONSTRAINT "VendaCantina_mediumId_fkey" FOREIGN KEY ("mediumId") REFERENCES "Medium"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VendaCantinaItem" ADD CONSTRAINT "VendaCantinaItem_vendaCantinaId_fkey" FOREIGN KEY ("vendaCantinaId") REFERENCES "VendaCantina"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VendaCantinaItem" ADD CONSTRAINT "VendaCantinaItem_produtoId_fkey" FOREIGN KEY ("produtoId") REFERENCES "ProdutoCantina"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExemplarLivro" ADD CONSTRAINT "ExemplarLivro_livroId_fkey" FOREIGN KEY ("livroId") REFERENCES "Livro"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmprestimoLivro" ADD CONSTRAINT "EmprestimoLivro_exemplarId_fkey" FOREIGN KEY ("exemplarId") REFERENCES "ExemplarLivro"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmprestimoLivro" ADD CONSTRAINT "EmprestimoLivro_mediumId_fkey" FOREIGN KEY ("mediumId") REFERENCES "Medium"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatriculaCursoUmbanda" ADD CONSTRAINT "MatriculaCursoUmbanda_pretendenteId_fkey" FOREIGN KEY ("pretendenteId") REFERENCES "Pretendente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatriculaCursoUmbanda" ADD CONSTRAINT "MatriculaCursoUmbanda_turmaId_fkey" FOREIGN KEY ("turmaId") REFERENCES "TurmaCursoUmbanda"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Voluntario" ADD CONSTRAINT "Voluntario_pretendenteId_fkey" FOREIGN KEY ("pretendenteId") REFERENCES "Pretendente"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Voluntario" ADD CONSTRAINT "Voluntario_mediumId_fkey" FOREIGN KEY ("mediumId") REFERENCES "Medium"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PalestranteEspecialidade" ADD CONSTRAINT "PalestranteEspecialidade_mediumId_fkey" FOREIGN KEY ("mediumId") REFERENCES "Medium"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Palestra" ADD CONSTRAINT "Palestra_mediumId_fkey" FOREIGN KEY ("mediumId") REFERENCES "Medium"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MoncaoAplausos" ADD CONSTRAINT "MoncaoAplausos_mediumId_fkey" FOREIGN KEY ("mediumId") REFERENCES "Medium"("id") ON DELETE SET NULL ON UPDATE CASCADE;
