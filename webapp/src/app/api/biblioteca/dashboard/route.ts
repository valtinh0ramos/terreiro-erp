import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    // Livros emprestados (ativos)
    const emprestados = await prisma.emprestimoLivro.count({
      where: { dataDevolucao: null },
    });

    // Livros devolvidos
    const devolvidos = await prisma.emprestimoLivro.count({
      where: { dataDevolucao: { not: null } },
    });

    // Livros atrasados
    const atrasados = await prisma.emprestimoLivro.count({
      where: {
        dataDevolucao: null,
        dataPrevista: { lt: new Date() },
      },
    });

    // Livros mais emprestados (top 5)
    const populares = await prisma.livro.findMany({
      take: 5,
      orderBy: { emprestimos: { _count: "desc" } },
      select: {
        id: true,
        titulo: true,
        _count: { select: { emprestimos: true } },
      },
    });

    return NextResponse.json({
      emprestados,
      devolvidos,
      atrasados,
      populares,
    });
  } catch (error: any) {
    console.error("Erro ao buscar dados da biblioteca:", error);
    return NextResponse.json(
      { error: "Erro ao buscar dados da biblioteca." },
      { status: 500 }
    );
  }
}

