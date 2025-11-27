// src/app/api/financeiro/mensalidades/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { FormaPagamento } from '@prisma/client'

/**
 * GET /api/financeiro/mensalidades?competencia=2025-11
 * - Se competência vier, filtra por ela.
 * - Senão, traz as últimas 200 mensalidades.
 */
export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const competencia = url.searchParams.get('competencia')

    const where = competencia ? { competencia } : {}

    const mensalidades = await prisma.mensalidade.findMany({
      where,
      orderBy: [{ competencia: 'desc' }, { mediumId: 'asc' }],
      take: 200,
      include: {
        medium: {
          select: {
            id: true,
            nome: true,
            nivel: true,
            status: true,
          },
        },
      },
    })

    return NextResponse.json(mensalidades)
  } catch (error) {
    console.error('Erro ao listar mensalidades:', error)
    return NextResponse.json(
      { error: 'Erro ao listar mensalidades.' },
      { status: 500 },
    )
  }
}

/**
 * POST /api/financeiro/mensalidades
 * body: {
 *   mediumId: number
 *   competencia: string (ex: "2025-11")
 *   valor: number
 *   status: "Pendente" | "Pago" | "Atrasado" | "Isento"
 *   dataPagamento?: string (yyyy-mm-dd)
 *   formaPagamento?: "DINHEIRO" | "PIX" | "CARTAO" | "OUTRO"
 * }
 *
 * - Faz upsert da mensalidade (cria se não existe, atualiza se já existe).
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()

    const mediumId = Number(body.mediumId)
    const competencia = String(body.competencia || '').trim()
    const valor = Number(body.valor || 0)
    const status = String(body.status || '').trim()
    const dataPagamento = body.dataPagamento
      ? new Date(body.dataPagamento)
      : null
    const formaPagamentoRaw = body.formaPagamento as keyof typeof FormaPagamento | undefined

    if (!mediumId || !competencia || !status) {
      return NextResponse.json(
        { error: 'Médium, competência e status são obrigatórios.' },
        { status: 400 },
      )
    }

    let formaPagamento: FormaPagamento | null = null
    if (formaPagamentoRaw && FormaPagamento[formaPagamentoRaw]) {
      formaPagamento = FormaPagamento[formaPagamentoRaw]
    }

    const mensalidade = await prisma.mensalidade.upsert({
      where: {
        mediumId_competencia: {
          mediumId,
          competencia,
        },
      },
      update: {
        valor,
        status,
        dataPagamento,
        formaPagamento: formaPagamento || undefined,
      },
      create: {
        mediumId,
        competencia,
        valor,
        status,
        dataPagamento,
        formaPagamento: formaPagamento || undefined,
      },
    })

    return NextResponse.json(mensalidade, { status: 201 })
  } catch (error) {
    console.error('Erro ao registrar mensalidade:', error)
    return NextResponse.json(
      { error: 'Erro ao registrar mensalidade.' },
      { status: 500 },
    )
  }
}

