// src/app/api/voluntarios/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { gerarCodigoVoluntario } from '@/lib/codigos'

/**
 * GET /api/voluntarios
 * Lista voluntários ordenados por nome
 */
export async function GET() {
  try {
    const voluntarios = await prisma.voluntario.findMany({
      orderBy: { nome: 'asc' },
      take: 200,
    })

    return NextResponse.json(voluntarios)
  } catch (error) {
    console.error('Erro ao listar voluntários:', error)
    return NextResponse.json(
      { error: 'Erro ao listar voluntários.' },
      { status: 500 },
    )
  }
}

/**
 * POST /api/voluntarios
 * body:
 * {
 *   nome: string
 *   email?: string
 *   telefone?: string
 *   areasAtuacao?: string
 *   observacoes?: string
 * }
 *
 * Cria um voluntário "EXTERNO" com código V001, V002...
 * (se for vir de aluno, usamos a rota de promoção que já criamos)
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()

    const nome = String(body.nome || '').trim()
    if (!nome) {
      return NextResponse.json(
        { error: 'Nome do voluntário é obrigatório.' },
        { status: 400 },
      )
    }

    const codigo = await gerarCodigoVoluntario()

    const voluntario = await prisma.voluntario.create({
      data: {
        codigo,
        tipo: 'EXTERNO', // vindo direto do formulário
        nome,
        email: body.email || null,
        telefone: body.telefone || null,
        ativo: true,
        areasAtuacao: body.areasAtuacao || null,
        observacoes: body.observacoes || null,
      },
    })

    return NextResponse.json(voluntario, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar voluntário:', error)
    return NextResponse.json(
      { error: 'Erro ao criar voluntário.' },
      { status: 500 },
    )
  }
}

