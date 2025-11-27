// src/app/api/voluntarios/[id]/promover-medium/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { gerarCodigoMedium } from '@/lib/codigos'

function getVoluntarioIdFromUrl(request: Request): number | null {
  try {
    const url = new URL(request.url)
    const match = url.pathname.match(
      /\/api\/voluntarios\/(\d+)\/promover-medium(\/)?$/,
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

export async function POST(request: Request) {
  const voluntarioId = getVoluntarioIdFromUrl(request)
  if (!voluntarioId) {
    return NextResponse.json(
      { error: 'ID de voluntário inválido.' },
      { status: 400 },
    )
  }

  try {
    const voluntario = await prisma.voluntario.findUnique({
      where: { id: voluntarioId },
    })

    if (!voluntario) {
      return NextResponse.json(
        { error: 'Voluntário não encontrado.' },
        { status: 404 },
      )
    }

    const codigoMedium = await gerarCodigoMedium()

    const medium = await prisma.medium.create({
      data: {
        codigo: codigoMedium,
        nome: voluntario.nome,
        email: voluntario.email,
        telefone: voluntario.telefone,
        nivel: 'NIVEL_1_INICIANTE',
        status: 'ATIVO',
        dataEntrada: new Date(),
      },
    })

    // Opcional: marcar voluntário como "ligado a médium"
    await prisma.voluntario.update({
      where: { id: voluntarioId },
      data: {
        mediumId: medium.id,
      },
    })

    return NextResponse.json(
      {
        message: 'Voluntário promovido a médium com sucesso.',
        mediumId: medium.id,
        mediumCodigo: medium.codigo,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error('Erro ao promover voluntário a médium:', error)
    return NextResponse.json(
      { error: 'Erro ao promover voluntário a médium.' },
      { status: 500 },
    )
  }
}

