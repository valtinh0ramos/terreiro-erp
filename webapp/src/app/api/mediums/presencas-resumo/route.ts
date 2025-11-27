// src/app/api/mediums/presencas-resumo/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/mediums/presencas-resumo
 *
 * Retorna, para cada médium:
 * - totalSessoesConsideradas (ignora AFASTADO)
 * - totalPresencas
 * - totalFaltas (FALTA + FALTA_JUSTIFICADA)
 */
export async function GET() {
  try {
    const presencas = await prisma.presenca.findMany({
      include: {
        medium: {
          select: { id: true, nome: true, codigo: true },
        },
      },
    })

    const mapa = new Map<
      number,
      {
        mediumId: number
        nome: string
        codigo: string | null
        totalSessoes: number
        totalPresencas: number
        totalFaltas: number
      }
    >()

    for (const p of presencas) {
      if (!p.medium) continue
      const id = p.medium.id

      if (!mapa.has(id)) {
        mapa.set(id, {
          mediumId: id,
          nome: p.medium.nome,
          codigo: p.medium.codigo || null,
          totalSessoes: 0,
          totalPresencas: 0,
          totalFaltas: 0,
        })
      }

      const item = mapa.get(id)!

      // AFASTADO não entra na contagem
      if (p.status === 'AFASTADO') continue

      item.totalSessoes++

      if (p.status === 'PRESENTE') {
        item.totalPresencas++
      } else if (
        p.status === 'FALTA' ||
        p.status === 'FALTA_JUSTIFICADA'
      ) {
        item.totalFaltas++
      }
    }

    const lista = Array.from(mapa.values()).sort((a, b) =>
      a.nome.localeCompare(b.nome),
    )

    return NextResponse.json(lista)
  } catch (error) {
    console.error('Erro ao calcular resumo de presenças:', error)
    return NextResponse.json(
      { error: 'Erro ao calcular resumo de presenças.' },
      { status: 500 },
    )
  }
}

