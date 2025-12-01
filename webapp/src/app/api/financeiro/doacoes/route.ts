import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Listar doações
export async function GET() {
  try {
    const doacoes = await prisma.doacao.findMany({
      where: { tipo: "FINANCEIRA" },
      orderBy: { data: "desc" },
    });
    return NextResponse.json(doacoes);
  } catch (error: any) {
    console.error("Erro ao listar doações:", error);
    return NextResponse.json(
      { error: "Erro ao listar doações financeiras." },
      { status: 500 }
    );
  }
}

// Cadastrar nova doação
export async function POST(request: Request) {
  try {
    const data = await request.json();

    if (!data.valor || Number(data.valor) <= 0) {
      return NextResponse.json(
        { error: "Valor da doação é obrigatório." },
        { status: 400 }
      );
    }

    const doacao = await prisma.doacao.create({
      data: {
        tipo: "FINANCEIRA",
        valor: new Prisma.Decimal(data.valor),
        formaPagamento: data.formaPagamento || "DINHEIRO",
        doadorExterno: data.doadorExterno || null,
        observacoes: data.observacoes || null,
      },
    });

    return NextResponse.json(doacao);
  } catch (error: any) {
    console.error("Erro ao cadastrar doação:", error);
    return NextResponse.json(
      { error: "Erro ao cadastrar doação financeira." },
      { status: 500 }
    );
  }
}

