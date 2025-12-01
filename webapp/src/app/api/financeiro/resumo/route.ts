import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/**
 * GET /api/financeiro/resumo
 * Retorna o resumo financeiro geral do terreiro:
 * Receitas (mensalidades + doações) - Despesas = Saldo
 */
export async function GET() {
  try {
    // 🧾 Mensalidades pagas
    const mensalidades = await prisma.mensalidade.aggregate({
      _sum: { valor: true },
      where: { status: "Pago" },
    });

    // 💰 Doações financeiras
    const doacoes = await prisma.doacao.aggregate({
      _sum: { valor: true },
      where: { tipo: "FINANCEIRA" },
    });

    // 💸 Despesas (tabela Despesa)
    const despesas = await prisma.despesa.aggregate({
      _sum: { valor: true },
    });

    // 🧮 Cálculos
    const totalMensalidades = Number(mensalidades._sum.valor || 0);
    const totalDoacoes = Number(doacoes._sum.valor || 0);
    const totalDespesas = Number(despesas._sum.valor || 0);
    const totalReceitas = totalMensalidades + totalDoacoes;
    const saldo = totalReceitas - totalDespesas;

    // ✅ Retorno JSON
    return NextResponse.json({
      receitas: {
        mensalidades: totalMensalidades,
        doacoes: totalDoacoes,
      },
      despesas: totalDespesas,
      saldo,
    });
  } catch (error: any) {
    console.error("Erro ao gerar resumo financeiro:", error);
    return NextResponse.json(
      { error: "Erro interno ao gerar resumo financeiro" },
      { status: 500 }
    );
  }
}

