// src/app/api/guias/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { LinhaTrabalhoGuia } from '@prisma/client'

/**
 * GET /api/guias
 * Lista todos os guias espirituais
 */
export async function GET() {
  try {
    const guias = await prisma.guiaEspiritual.findAll?.()
    // caso seu client não tenha findAll, use findMany:
    const lista = await prisma.guiaEspiritual.findMany({
      orderBy: [{ ativo: 'desc' }, { nome: 'asc' }],
      include: {
        medium: {
          select: {
            id: true,
            nome: true,
            codigo: true,
          },
        },
      },
    })
    return NextResponse.json(lista)
  } catch (error) {
    console.error('Erro ao listar guias:', error)
    return NextResponse.json(
      { error: 'Erro ao listar guias.' },
      { status: 500 },
    )
  }
}

/**
 * POST /api/guias
 * body:
 * {
 *   nome: string
 *   linha: "CABOCLO" | "PRETO_VELHO" | ... (enum)
 *   mediumId?: number
 *   observacoes?: string
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()

    const nome = String(body.nome || '').trim()
    const linhaRaw = String(body.linha || '').toUpperCase()

    if (!nome) {
      return NextResponse.json(
        { error: 'Nome do guia é obrigatório.' },
        { status: 400 },
      )
    }

    if (!(linhaRaw in LinhaTrabalhoGuia)) {
      return NextResponse.json(
        { error: 'Linha de trabalho inválida.' },
        { status: 400 },
      )
    }

    const guia = await prisma.guiaEspiritual.create({
      data: {
        nome,
        linha: linhaRaw as LinhaTrabalhoGuia,
        mediumId: body.mediumId ? Number(body.mediumId) : null,
        observacoes: body.observacoes || null,
      },
    })

    return NextResponse.json(guia, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar guia espiritual:', error)
    return NextResponse.json(
      { error: 'Erro ao criar guia espiritual.' },
      { status: 500 },
    )
  }
}

