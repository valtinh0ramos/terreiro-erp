// src/app/api/giras/[id]/presencas/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * Extrai o ID da gira a partir da URL, ex: /api/giras/2/presencas
 */
function getGiraIdFromUrl(request: Request): number | null {
  try {
    const url = new URL(request.url)
    const match = url.pathname.match(/\/api\/giras\/(\d+)\/presencas/)
    if (match && match[1]) {
      const n = Number(match[1])
      if (!Number.isNaN(n)) return n
    }
  } catch {
    // ignora
  }
  return null
}

// GET: lista presenças dessa gira (com dados do médium)
export async function GET(request: Request) {
  const giraId = getGiraIdFromUrl(request)

  if (!giraId) {
    return NextResponse.json(
      { error: 'Não foi possível identificar a gira.' },
      { status: 400 },
    )
  }

  try {
    const presencas = await prisma.presenca.findMany({
      where: { giraId },
      include: {
        medium: true,
      },
      orderBy: {
        medium: {
          nome: 'asc',
        },
      },
    })

    return NextResponse.json(presencas)
  } catch (error) {
    console.error('Erro ao listar presenças da gira:', error)
    return NextResponse.json(
      { error: 'Erro ao listar presenças.' },
      { status: 500 },
    )
  }
}

/**
 * POST: recebe um array de presenças e salva tudo de uma vez
 * payload: { presencas: { mediumId: number; status: string; observacao?: string }[] }
 */
export async function POST(request: Request) {
  const giraId = getGiraIdFromUrl(request)

  if (!giraId) {
    return NextResponse.json(
      { error: 'Não foi possível identificar a gira.' },
      { status: 400 },
    )
  }

  try {
    const { presencas } = await request.json()

    if (!Array.isArray(presencas)) {
      return NextResponse.json(
        { error: 'Formato inválido de presenças.' },
        { status: 400 },
      )
    }

    const ops = presencas.map(
      (p: { mediumId: number; status: string; observacao?: string }) =>
        prisma.presenca.upsert({
          where: {
            mediumId_giraId: {
              mediumId: p.mediumId,
              giraId,
            },
          },
          update: {
            status: p.status,
            observacao: p.observacao,
          },
          create: {
            mediumId: p.mediumId,
            giraId,
            status: p.status,
            observacao: p.observacao,
          },
        }),
    )

    await prisma.$transaction(ops)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao registrar presenças:', error)
    return NextResponse.json(
      { error: 'Erro ao registrar presenças.' },
      { status: 500 },
    )
  }
}
