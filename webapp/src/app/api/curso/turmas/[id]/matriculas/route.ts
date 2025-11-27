// src/app/api/curso/turmas/[id]/matriculas/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { PretendenteStatusCurso } from '@prisma/client'

function getTurmaIdFromUrl(request: Request): number | null {
  try {
    const url = new URL(request.url)
    const match = url.pathname.match(
      /\/api\/curso\/turmas\/(\d+)\/matriculas(\/)?$/,
    )
    if (match && match[1]) {
      const n = Number(match[1])
      if (!Number.isNaN(n)) return n
    }
  } catch {
    // ignora
  }
  return null
}

/**
 * GET /api/curso/turmas/[id]/matriculas
 * Lista as matrículas da turma
 */
export async function GET(request: Request) {
  const turmaId = getTurmaIdFromUrl(request)
  if (!turmaId) {
    return NextResponse.json(
      { error: 'ID de turma inválido.' },
      { status: 400 },
    )
  }

  try {
    const matriculas = await prisma.matriculaCursoUmbanda.findMany({
      where: { turmaId },
      orderBy: { dataInicio: 'asc' },
      include: {
        pretendente: true,
      },
    })

    return NextResponse.json(matriculas)
  } catch (error) {
    console.error('Erro ao listar matrículas da turma:', error)
    return NextResponse.json(
      { error: 'Erro ao listar matrículas.' },
      { status: 500 },
    )
  }
}

/**
 * POST /api/curso/turmas/[id]/matriculas
 * body: { pretendenteId: number }
 *
 * Cria matrícula com status EM_CURSO e dataInicio = agora.
 */
export async function POST(request: Request) {
  const turmaId = getTurmaIdFromUrl(request)
  if (!turmaId) {
    return NextResponse.json(
      { error: 'ID de turma inválido.' },
      { status: 400 },
    )
  }

  try {
    const body = await request.json()
    const pretendenteId = Number(body.pretendenteId)

    if (!pretendenteId || Number.isNaN(pretendenteId)) {
      return NextResponse.json(
        { error: 'ID de aluno (pretendente) inválido.' },
        { status: 400 },
      )
    }

    // Regra extra de segurança: não matricular se já tem curso em andamento ou concluído
    const jaTemCurso = await prisma.matriculaCursoUmbanda.findFirst({
      where: {
        pretendenteId,
        OR: [
          { statusCurso: 'EM_CURSO' },
          { statusCurso: 'CONCLUIDO' },
        ],
      },
    })

    if (jaTemCurso) {
      return NextResponse.json(
        {
          error:
            'Este aluno já está em curso ou já concluiu uma turma. Não pode ser matriculado novamente.',
        },
        { status: 400 },
      )
    }

    const agora = new Date()

    const matricula = await prisma.matriculaCursoUmbanda.create({
      data: {
        pretendenteId,
        turmaId,
        dataInicio: agora,
        statusCurso: PretendenteStatusCurso.EM_CURSO,
      },
    })

    return NextResponse.json(matricula, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar matrícula:', error)
    return NextResponse.json(
      { error: 'Erro ao criar matrícula.' },
      { status: 500 },
    )
  }
}

