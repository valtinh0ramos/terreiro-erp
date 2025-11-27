// src/app/api/curso/pretendentes/[id]/promover-medium/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { gerarCodigoMedium } from '@/lib/codigos'

function getPretendenteIdFromUrl(request: Request): number | null {
  try {
    const url = new URL(request.url)
    const match = url.pathname.match(
      /\/api\/curso\/pretendentes\/(\d+)\/promover-medium(\/)?$/,
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
      include: {
        matriculas: true,
      },
    })

    if (!pretendente) {
      return NextResponse.json(
        { error: 'Aluno (pretendente) não encontrado.' },
        { status: 404 },
      )
    }

    // Regra: precisa ter ao menos uma matrícula CONCLUIDO
    const concluidas = pretendente.matriculas.filter(
      (m) => m.statusCurso === 'CONCLUIDO',
    )

    if (concluidas.length === 0) {
      return NextResponse.json(
        {
          error:
            'Este aluno não concluiu o Curso de Umbanda. Ele só pode ser promovido a voluntário, não a médium.',
        },
        { status: 400 },
      )
    }

    // (Opcional) se quiser exigir APTO_CORRENTE:
    const apto = concluidas.some(
      (m) => m.resultadoFinal === 'APTO_CORRENTE',
    )

    if (!apto) {
      return NextResponse.json(
        {
          error:
            'Este aluno não foi marcado como APTO À CORRENTE. Ajuste o resultado na matrícula antes de promovê-lo a médium.',
        },
        { status: 400 },
      )
    }

    // Gera código para o novo médium
    const codigoMedium = await gerarCodigoMedium()

    const medium = await prisma.medium.create({
      data: {
        codigo: codigoMedium,
        nome: pretendente.nome,
        dataNascimento: pretendente.dataNascimento,
        email: pretendente.email,
        telefone: pretendente.telefone,
        nivel: 'NIVEL_1_INICIANTE',
        status: 'ATIVO',
        dataEntrada: new Date(),
      },
    })

    // Aqui você pode marcar resultadoFinal no pretendente se quiser
    // e/ou vincular mediumId ao Pretendente/Voluntario (se tiver esses campos)
    await prisma.pretendente.update({
      where: { id: pretendenteId },
      data: {
        // resultadoFinal: 'APTO_CORRENTE', // se fizer sentido
      },
    })

    return NextResponse.json(
      {
        message: 'Aluno promovido a médium com sucesso.',
        mediumId: medium.id,
        mediumCodigo: medium.codigo,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error('Erro ao promover aluno a médium:', error)
    return NextResponse.json(
      { error: 'Erro ao promover aluno a médium.' },
      { status: 500 },
    )
  }
}

