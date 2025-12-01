"use server";
import prisma from "@/lib/prisma";

/** LIVROS */
export async function listarLivros() {
  return prisma.livro.findMany({
    include: { exemplares: true },
    orderBy: { titulo: "asc" },
  });
}

export async function criarLivro(data: {
  titulo: string;
  autor?: string;
  tema?: string;
}) {
  return prisma.livro.create({ data });
}

export async function atualizarLivro(
  id: number,
  data: { titulo?: string; autor?: string; tema?: string }
) {
  return prisma.livro.update({ where: { id }, data });
}

export async function deletarLivro(id: number) {
  return prisma.livro.delete({ where: { id } });
}

/** EXEMPLARES */
export async function listarExemplares(livroId?: number) {
  return prisma.exemplarLivro.findMany({
    where: livroId ? { livroId } : {},
    include: { livro: true, emprestimos: true },
  });
}

export async function criarExemplar(data: {
  livroId: number;
  codigoTombo: string;
  estado?: string;
}) {
  return prisma.exemplarLivro.create({ data });
}

/** EMPRESTIMOS */
export async function listarEmprestimos() {
  return prisma.emprestimoLivro.findMany({
    include: {
      exemplar: { include: { livro: true } },
      medium: true,
    },
    orderBy: { dataSaida: "desc" },
  });
}

export async function registrarEmprestimo(data: {
  exemplarId: number;
  mediumId: number;
  dataSaida: Date;
  dataPrevista: Date;
  observacoes?: string;
}) {
  return prisma.emprestimoLivro.create({ data });
}

export async function registrarDevolucao(id: number) {
  return prisma.emprestimoLivro.update({
    where: { id },
    data: { dataDevolucao: new Date() },
  });
}

