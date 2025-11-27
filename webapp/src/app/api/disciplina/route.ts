// src/app/api/disciplina/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  MedidaDisciplinaTipo,
  MedidaDisciplinaStatus,
  MediumStatus,
} from '@prisma/client'

/**
 * GET /api/disciplina?mediumId=123
 * - se mediumId vier, lista só daquele médium
 * - senão, lista últimas 100 medidas
 */
export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const mediumIdParam = url.searchParams.get('mediumId')

    const where = mediumIdParam
      ? { mediumId: Number(mediumIdParam) || 0 }
      : {}

    const medidas = await prisma.medidaDisciplina.findMany({
      where,
      orderBy: { dataCriacao: 'desc' },
      take: 100,
    })

    return NextResponse.json(medidas)
  } catch (error) {
    console.error('Erro ao listar medidas disciplinares:', error)
    return NextResponse.json(
      { error: 'Erro ao listar medidas disciplinares.' },
      { status: 500 },
    )
  }
}

/**
 * POST /api/disciplina
 * body: { mediumId, tipo, motivo, diasSuspensao? }
 *
 * - Cria medida manual
 * - Regras:
 *   - Ao criar ADVERTENCIA:
 *       se total de advertências >= 3 -> cria SUSPENSAO automática de 30 dias
 *   - Ao criar SUSPENSAO:
 *       se total de suspensões >= 2 -> cria EXPULSAO automática e marca médium DESLIGADO
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()

    const mediumId = Number(body.mediumId)
    const tipo = String(body.tipo || '').toUpperCase()
    const motivo = String(body.motivo || '').trim()
    const diasSuspensao = Number(body.diasSuspensao || 30)

    if (!mediumId || !motivo || !tipo) {
      return NextResponse.json(
        { error: 'Médium, tipo e motivo são obrigatórios.' },
        { status: 400 },
      )
    }

    if (
      !['ADVERTENCIA', 'SUSPENSAO', 'EXPULSAO'].includes(tipo)
    ) {
      return NextResponse.json(
        { error: 'Tipo inválido. Use ADVERTENCIA, SUSPENSAO ou EXPULSAO.' },
        { status: 400 },
      )
    }

    const tipoEnum = tipo as MedidaDisciplinaTipo

    // datas padrão para suspensão (se aplicável)
    let dataInicio: Date | null = null
    let dataFim: Date | null = null

    if (tipoEnum === 'SUSPENSAO') {
      dataInicio = new Date()
      dataFim = new Date()
      dataFim.setDate(dataFim.getDate() + diasSuspensao)
    }

    // 1) Cria a medida manual
    const medida = await prisma.medidaDisciplina.create({
      data: {
        mediumId,
        tipo: tipoEnum,
        motivo,
        dataInicio,
        dataFim,
        status: MedidaDisciplinaStatus.ATIVA,
        geradaAutomaticamente: false,
      },
    })

    // 2) Regra: 3 advertências -> cria suspensão automática de 30 dias
    if (tipoEnum === 'ADVERTENCIA') {
      const totalAdvertencias = await prisma.medidaDisciplina.count({
        where: {
          mediumId,
          tipo: 'ADVERTENCIA',
        },
      })

      if (totalAdvertencias >= 3) {
        const inicio = new Date()
        const fim = new Date()
        fim.setDate(fim.getDate() + 30)

        await prisma.medidaDisciplina.create({
          data: {
            mediumId,
            tipo: 'SUSPENSAO',
            motivo:
              'Suspensão automática por acúmulo de 3 advertências.',
            dataInicio: inicio,
            dataFim: fim,
            status: MedidaDisciplinaStatus.ATIVA,
            geradaAutomaticamente: true,
          },
        })
      }
    }

    // 3) Regra: 2 suspensões -> cria expulsão automática e desliga o médium
    if (tipoEnum === 'SUSPENSAO') {
      const totalSuspensoes = await prisma.medidaDisciplina.count({
        where: {
          mediumId,
          tipo: 'SUSPENSAO',
        },
      })

      if (totalSuspensoes >= 2) {
        await prisma.medidaDisciplina.create({
          data: {
            mediumId,
            tipo: 'EXPULSAO',
            motivo:
              'Expulsão automática por acúmulo de 2 suspensões.',
            dataInicio: new Date(),
            dataFim: null,
            status: MedidaDisciplinaStatus.ATIVA,
            geradaAutomaticamente: true,
          },
        })

        // Marca médium como DESLIGADO
        await prisma.medium.update({
          where: { id: mediumId },
          data: {
            status: MediumStatus.DESLIGADO,
            dataDesligamento: new Date(),
          },
        })
      }
    }

    return NextResponse.json(medida, { status: 201 })
  } catch (error) {
    console.error('Erro ao registrar medida disciplinar:', error)
    return NextResponse.json(
      { error: 'Erro ao registrar medida disciplinar.' },
      { status: 500 },
    )
  }
}

