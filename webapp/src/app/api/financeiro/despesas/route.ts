import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// ✅ Listar todas as despesas
export async function GET() {
  try {
    const despesas = await prisma.despesa.findMany({
      orderBy: { data: "desc" },
    });
    return NextResponse.json(despesas);
  } catch (error) {
    console.error("Erro ao listar despesas:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

// ✅ Cadastrar uma nova despesa
export async function POST(request: Request) {
  try {
    const data = await request.json();

    if (!data.descricao || !data.valor) {
      return NextResponse.json(
        { error: "Descrição e valor são obrigatórios." },
        { status: 400 }
      );
    }

    const despesa = await prisma.despesa.create({
      data: {
        descricao: data.descricao,
        categoria: data.categoria || null,
        valor: data.valor,
        formaPagamento: data.formaPagamento || "DINHEIRO",
        observacoes: data.observacoes || null,
      },
    });

    return NextResponse.json(despesa);
  } catch (error) {
    console.error("Erro ao cadastrar despesa:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

// ✅ Remover uma despesa
export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();
    await prisma.despesa.delete({ where: { id: Number(id) } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao remover despesa:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
