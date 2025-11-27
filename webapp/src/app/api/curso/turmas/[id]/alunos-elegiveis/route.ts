// src/app/api/curso/turmas/[id]/alunos-elegiveis/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function getTurmaIdFromUrl(request: Request): number | null {
  try {
    const url = new URL(request.url)
    const match = url.pathname.match(
      /\/api\/curso\/turmas\/(\d+)\/alunos-elegiveis(\/)?$/,
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
 * GET /api/curso/turmas/[id]/alunos-elegiveis
 *
 * Lista alunos que:
 * - NÃO tenham matrícula com status EM_CURSO ou CONCLUIDO em nenhuma turma.
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
    const pretendentes = await prisma.pretendente.findMany({
      where: {
        matriculas: {
          none: {
            OR: [
              { statusCurso: 'EM_CURSO' },
              { statusCurso: 'CONCLUIDO' },
            ],
          },
        },
      },
      orderBy: { nome: 'asc' },
    })

    return NextResponse.json(pretendentes)
  } catch (error) {
    console.error(
      'Erro ao listar alunos elegíveis para turma:',
      error,
    )
    return NextResponse.json(
      { error: 'Erro ao listar alunos elegíveis.' },
      { status: 500 },
    )
  }
}

