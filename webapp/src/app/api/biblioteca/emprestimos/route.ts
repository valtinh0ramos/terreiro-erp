import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Listar empréstimos
export async function GET() {
  try {
    const emprestimos = await prisma.emprestimoLivro.findMany({
      include: {
        exemplar: { include: { livro: true } },
        medium: true,
      },
      orderBy: { dataSaida: "desc" },
    });

    const formatado = emprestimos.map((e) => ({
      id: e.id,
      usuarioNome: e.medium?.nome ?? "—",
      livroTitulo: e.exemplar?.livro?.titulo ?? "—",
      dataSaida: e.dataSaida,
      dataPrevista: e.dataPrevista,
      dataDevolucao: e.dataDevolucao,
      devolvido: !!e.dataDevolucao,
    }));

    return NextResponse.json(formatado);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Registrar novo empréstimo
export async function POST(request: Request) {
  try {
    const data = await request.json();
    if (!data.exemplarId || !data.mediumId) {
      return NextResponse.json(
        { error: "Exemplar e médium são obrigatórios." },
        { status: 400 }
      );
    }

    const emprestimo = await prisma.emprestimoLivro.create({
      data: {
        exemplarId: Number(data.exemplarId),
        mediumId: Number(data.mediumId),
        dataSaida: new Date(),
        dataPrevista: data.dataPrevista ? new Date(data.dataPrevista) : null,
        observacoes: data.observacoes || null,
      },
    });

    return NextResponse.json(emprestimo);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Registrar devolução
export async function PATCH(request: Request) {
  try {
    const { id } = await request.json();
    const updated = await prisma.emprestimoLivro.update({
      where: { id: Number(id) },
      data: { dataDevolucao: new Date() },
    });
    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

