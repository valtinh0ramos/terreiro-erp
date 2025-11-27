// src/app/api/guias/[id]/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function getGuiaIdFromUrl(request: Request): number | null {
  try {
    const url = new URL(request.url)
    const match = url.pathname.match(/\/api\/guias\/(\d+)(\/)?$/)
    if (match && match[1]) {
      const n = Number(match[1])
      if (!Number.isNaN(n)) return n
    }
  } catch {
    // ignore
  }
  return null
}

// GET /api/guias/[id]
export async function GET(request: Request) {
  const id = getGuiaIdFromUrl(request)
  if (!id) {
    return NextResponse.json(
      { error: 'ID de guia inválido.' },
      { status: 400 },
    )
  }

  try {
    const guia = await prisma.guiaEspiritual.findUnique({
      where: { id },
      include: {
        medium: true,
        girasChefiadas: true,
      },
    })

    if (!guia) {
      return NextResponse.json(
        { error: 'Guia não encontrado.' },
        { status: 404 },
      )
    }

    return NextResponse.json(guia)
  } catch (error) {
    console.error('Erro ao buscar guia:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar guia.' },
      { status: 500 },
    )
  }
}

// DELETE /api/guias/[id]
export async function DELETE(request: Request) {
  const id = getGuiaIdFromUrl(request)
  if (!id) {
    return NextResponse.json(
      { error: 'ID de guia inválido.' },
      { status: 400 },
    )
  }

  try {
    await prisma.guiaEspiritual.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Erro ao deletar guia:', error)
    return NextResponse.json(
      {
        error:
          'Não foi possível deletar o guia. Verifique se ele não está associado a sessões.',
      },
      { status: 500 },
    )
  }
}

