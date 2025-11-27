// src/app/api/voluntarios/[id]/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function getVoluntarioIdFromUrl(request: Request): number | null {
  try {
    const url = new URL(request.url)
    const match = url.pathname.match(
      /\/api\/voluntarios\/(\d+)(\/)?$/,
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

// GET /api/voluntarios/[id]
export async function GET(request: Request) {
  const id = getVoluntarioIdFromUrl(request)
  if (!id) {
    return NextResponse.json(
      { error: 'ID de voluntário inválido.' },
      { status: 400 },
    )
  }

  try {
    const voluntario = await prisma.voluntario.findUnique({
      where: { id },
      include: {
        pretendente: true,
        medium: true,
      },
    })

    if (!voluntario) {
      return NextResponse.json(
        { error: 'Voluntário não encontrado.' },
        { status: 404 },
      )
    }

    return NextResponse.json(voluntario)
  } catch (error) {
    console.error('Erro ao buscar voluntário:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar voluntário.' },
      { status: 500 },
    )
  }
}

