// src/app/api/curso/turmas/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { gerarCodigoTurma } from '@/lib/codigos'

/**
 * GET /api/curso/turmas
 * Lista turmas de Curso de Umbanda
 */
export async function GET() {
  try {
    const turmas = await prisma.turmaCursoUmbanda.findMany({
      orderBy: { dataInicio: 'desc' },
      take: 100,
    })
    return NextResponse.json(turmas)
  } catch (error) {
    console.error('Erro ao listar turmas de Curso de Umbanda:', error)
    return NextResponse.json(
      { error: 'Erro ao listar turmas.' },
      { status: 500 },
    )
  }
}

/**
 * POST /api/curso/turmas
 * body:
 * {
 *   nome: string           // ex: "Curso 2025.1"
 *   cursoNome: string      // ex: "Curso Básico de Umbanda"
 *   dataInicio?: string    // date yyyy-mm-dd
 *   dataPrevistaFim?: string
 *   diaDaSemana?: string   // ex: "Sábado"
 *   observacoes?: string
 * }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()

    const nome = String(body.nome || '').trim()
    const cursoNome = String(body.cursoNome || '').trim()

    if (!nome || !cursoNome) {
      return NextResponse.json(
        { error: 'Nome da turma e nome do curso são obrigatórios.' },
        { status: 400 },
      )
    }

    const dataInicio = body.dataInicio ? new Date(body.dataInicio) : null
    const dataPrevistaFim = body.dataPrevistaFim
      ? new Date(body.dataPrevistaFim)
      : null

    const codigo = await gerarCodigoTurma()

    const turma = await prisma.turmaCursoUmbanda.create({
      data: {
        codigo,
        nome,
        cursoNome,
        dataInicio,
        dataPrevistaFim,
        diaDaSemana: body.diaDaSemana || null,
        observacoes: body.observacoes || null,
      },
    })

    return NextResponse.json(turma, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar turma de Curso de Umbanda:', error)
    return NextResponse.json(
      { error: 'Erro ao criar turma.' },
      { status: 500 },
    )
  }
}

