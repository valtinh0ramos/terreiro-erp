// src/app/api/curso/pretendentes/[id]/promover-voluntario/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { gerarCodigoVoluntario } from '@/lib/codigos'

function getPretendenteIdFromUrl(request: Request): number | null {
  try {
    const url = new URL(request.url)
    const match = url.pathname.match(
      /\/api\/curso\/pretendentes\/(\d+)\/promover-voluntario(\/)?$/,
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
  const pretendenteId = getPretendenteIdFromUrl(request)
  if (!pretendenteId) {
    return NextResponse.json(
      { error: 'ID de aluno inválido.' },
      { status: 400 },
    )
  }

  try {
    const pretendente = await prisma.pretendente.findUnique({
      where: { id: pretendenteId },
    })

    if (!pretendente) {
      return NextResponse.json(
        { error: 'Aluno (pretendente) não encontrado.' },
        { status: 404 },
      )
    }

    const codigoVol = await gerarCodigoVoluntario()

    const voluntario = await prisma.voluntario.create({
      data: {
        codigo: codigoVol,
        pretendenteId,
        tipo: 'EX_PRETENDENTE', // assumindo que esse enum existe
        nome: pretendente.nome,
        email: pretendente.email,
        telefone: pretendente.telefone,
        ativo: true,
        // outras áreas de atuação podem ser preenchidas depois
      },
    })

    // Opcional: marcar no aluno que virou voluntário
    await prisma.pretendente.update({
      where: { id: pretendenteId },
      data: {
        // resultadoFinal: 'VOLUNTARIADO',
      },
    })

    return NextResponse.json(
      {
        message: 'Aluno promovido a voluntário com sucesso.',
        voluntarioId: voluntario.id,
        voluntarioCodigo: voluntario.codigo,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error('Erro ao promover aluno a voluntário:', error)
    return NextResponse.json(
      { error: 'Erro ao promover aluno a voluntário.' },
      { status: 500 },
    )
  }
}

