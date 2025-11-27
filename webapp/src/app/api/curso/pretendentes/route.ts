// src/app/api/curso/pretendentes/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { gerarCodigoAluno } from '@/lib/codigos'

/**
 * GET /api/curso/pretendentes
 * Lista alunos (pretendentes) ordenados por nome
 */
export async function GET() {
  try {
    const pretendentes = await prisma.pretendente.findMany({
      orderBy: { nome: 'asc' },
      take: 200,
    })

    return NextResponse.json(pretendentes)
  } catch (error) {
    console.error('Erro ao listar alunos (pretendentes):', error)
    return NextResponse.json(
      { error: 'Erro ao listar alunos.' },
      { status: 500 },
    )
  }
}

/**
 * POST /api/curso/pretendentes
 * body:
 * {
 *   nome: string
 *   dataNascimento?: string (yyyy-mm-dd)
 *   email?: string
 *   telefone?: string
 *   escolaridade?: string
 *   profissao?: string
 *   endereco?: string
 *   indicacao?: string
 *   observacoes?: string
 * }
 *
 * Cria um aluno com código A001, A002...
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()

    const nome = String(body.nome || '').trim()
    if (!nome) {
      return NextResponse.json(
        { error: 'Nome do aluno é obrigatório.' },
        { status: 400 },
      )
    }

    const dataNascimento = body.dataNascimento
      ? new Date(body.dataNascimento)
      : null

    const codigo = await gerarCodigoAluno()

    const pretendente = await prisma.pretendente.create({
      data: {
        codigo,
        nome,
        dataNascimento,
        email: body.email || null,
        telefone: body.telefone || null,
        escolaridade: body.escolaridade || null,
        profissao: body.profissao || null,
        endereco: body.endereco || null,
        indicacao: body.indicacao || null,
        observacoes: body.observacoes || null,
      },
    })

    return NextResponse.json(pretendente, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar aluno (pretendente):', error)
    return NextResponse.json(
      { error: 'Erro ao criar aluno.' },
      { status: 500 },
    )
  }
}

