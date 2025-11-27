// src/app/api/curso/pretendentes/[id]/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function getPretendenteIdFromUrl(request: Request): number | null {
  try {
    const url = new URL(request.url)
    const match = url.pathname.match(
      /\/api\/curso\/pretendentes\/(\d+)(\/)?$/,
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

// GET /api/curso/pretendentes/[id]
export async function GET(request: Request) {
  const id = getPretendenteIdFromUrl(request)
  if (!id) {
    return NextResponse.json(
      { error: 'ID de aluno inválido.' },
      { status: 400 },
    )
  }

  try {
    const pretendente = await prisma.pretendente.findUnique({
      where: { id },
      include: {
        matriculas: true,
        voluntarios: true,
      },
    })

    if (!pretendente) {
      return NextResponse.json(
        { error: 'Aluno (pretendente) não encontrado.' },
        { status: 404 },
      )
    }

    return NextResponse.json(pretendente)
  } catch (error) {
    console.error('Erro ao buscar aluno (pretendente):', error)
    return NextResponse.json(
      { error: 'Erro ao buscar aluno.' },
      { status: 500 },
    )
  }
}

