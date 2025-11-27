// src/app/api/giras/[id]/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function getGiraIdFromUrl(request: Request): number | null {
  try {
    const url = new URL(request.url)
    const match = url.pathname.match(/\/api\/giras\/(\d+)(\/)?$/)
    if (match && match[1]) {
      const n = Number(match[1])
      if (!Number.isNaN(n)) return n
    }
  } catch {
    // ignore
  }
  return null
}

// GET /api/giras/[id]
export async function GET(request: Request) {
  const id = getGiraIdFromUrl(request)
  if (!id) {
    return NextResponse.json(
      { error: 'ID de sessão inválido.' },
      { status: 400 },
    )
  }

  try {
    const gira = await prisma.gira.findUnique({
      where: { id },
      include: {
        dirigente: { select: { id: true, nome: true, codigo: true, nivel: true } },
        guiaChefe: { select: { id: true, nome: true, linha: true } },
        presencas: {
          include: {
            medium: { select: { id: true, nome: true, codigo: true, nivel: true } },
          },
        },
      },
    })

    if (!gira) {
      return NextResponse.json(
        { error: 'Sessão não encontrada.' },
        { status: 404 },
      )
    }

    return NextResponse.json(gira)
  } catch (error) {
    console.error('Erro ao buscar sessão:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar sessão.' },
      { status: 500 },
    )
  }
}

/**
 * PATCH /api/giras/[id]
 * body: { data?, tipo?, observacoes?, dirigenteId?, guiaChefeId?, horarioInicio?, horarioFim?, ata? }
 */
export async function PATCH(request: Request) {
  const id = getGiraIdFromUrl(request)
  if (!id) {
    return NextResponse.json(
      { error: 'ID de sessão inválido.' },
      { status: 400 },
    )
  }

  try {
    const body = await request.json()
    const data: any = {}

    if ('data' in body && body.data) {
      data.data = new Date(body.data)
    }
    if ('tipo' in body) data.tipo = body.tipo
    if ('observacoes' in body) data.observacoes = body.observacoes
    if ('dirigenteId' in body) {
      data.dirigenteId = body.dirigenteId
        ? Number(body.dirigenteId)
        : null
    }
    if ('guiaChefeId' in body) {
      data.guiaChefeId = body.guiaChefeId
        ? Number(body.guiaChefeId)
        : null
    }
    if ('horarioInicio' in body) {
      data.horarioInicio = body.horarioInicio
        ? new Date(body.horarioInicio)
        : null
    }
    if ('horarioFim' in body) {
      data.horarioFim = body.horarioFim
        ? new Date(body.horarioFim)
        : null
    }
    if ('ata' in body) {
      data.ata = body.ata || null
    }

    const gira = await prisma.gira.update({
      where: { id },
      data,
    })

    return NextResponse.json(gira)
  } catch (error) {
    console.error('Erro ao atualizar sessão:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar sessão.' },
      { status: 500 },
    )
  }
}

// DELETE /api/giras/[id]
// "Deleta" sessão marcando ativa = false, mas mantém presenças e dados no banco
export async function DELETE(request: Request) {
  const id = getGiraIdFromUrl(request)
  if (!id) {
    return NextResponse.json(
      { error: 'ID de sessão inválido.' },
      { status: 400 },
    )
  }

  try {
    await prisma.gira.update({
      where: { id },
      data: {
        ativa: false,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao deletar sessão:', error)
    return NextResponse.json(
      { error: 'Erro ao deletar sessão.' },
      { status: 500 },
    )
  }
}

