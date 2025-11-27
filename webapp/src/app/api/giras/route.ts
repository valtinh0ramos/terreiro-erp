// src/app/api/giras/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/giras
 * Lista últimas sessões ATIVAS com info de dirigente e guia chefe
 */
export async function GET() {
  try {
    const giras = await prisma.gira.findMany({
      where: { ativa: true },
      orderBy: { data: 'desc' },
      take: 50,
      include: {
        dirigente: {
          select: { id: true, nome: true, codigo: true, nivel: true },
        },
        guiaChefe: {
          select: { id: true, nome: true, linha: true },
        },
      },
    })

    return NextResponse.json(giras)
  } catch (error) {
    console.error('Erro ao listar sessões:', error)
    return NextResponse.json(
      { error: 'Erro ao listar sessões.' },
      { status: 500 },
    )
  }
}

/**
 * POST /api/giras
 * body: {
 *   data: string (yyyy-mm-dd)
 *   tipo: string
 *   observacoes?: string
 *   dirigenteId?: number
 *   guiaChefeId?: number
 * }
 */
export async function POST(request: Request) {
  try {
    const { data, tipo, observacoes, dirigenteId, guiaChefeId } =
      await request.json()

    if (!data || !tipo) {
      return NextResponse.json(
        { error: 'Data e tipo da sessão são obrigatórios.' },
        { status: 400 },
      )
    }

    const dataSessao = new Date(data)

    const gira = await prisma.gira.create({
      data: {
        data: dataSessao,
        tipo,
        observacoes,
        dirigenteId: dirigenteId ? Number(dirigenteId) : null,
        guiaChefeId: guiaChefeId ? Number(guiaChefeId) : null,
        ativa: true,
      },
    })

    return NextResponse.json(gira, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar sessão (gira):', error)
    return NextResponse.json(
      { error: 'Erro ao criar sessão.' },
      { status: 500 },
    )
  }
}

