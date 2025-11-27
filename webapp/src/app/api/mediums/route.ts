// src/app/api/mediums/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { gerarCodigoMedium } from '@/lib/codigos'

export async function GET() {
  try {
    const mediums = await prisma.medium.findMany({
      orderBy: { nome: 'asc' },
      take: 200,
    })
    return NextResponse.json(mediums)
  } catch (error) {
    console.error('Erro ao listar médiuns:', error)
    return NextResponse.json(
      { error: 'Erro ao listar médiuns.' },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  try {
    const {
      nome,
      dataNascimento,
      email,
      telefone,
      nivel,
      status,
      dataEntrada,
      casaAnterior,
      orixasCabeca,
      nomeGuiaChefe,
    } = await request.json()

    if (!nome) {
      return NextResponse.json(
        { error: 'Nome do médium é obrigatório.' },
        { status: 400 },
      )
    }

    const nivelPrisma =
      nivel || 'NIVEL_1_INICIANTE'
    const statusPrisma = status || 'ATIVO'

    // Gera código do médium (M001, M002...)
    const codigo = await gerarCodigoMedium()

    const medium = await prisma.medium.create({
      data: {
        codigo,
        nome,
        email,
        telefone,
        nivel: nivelPrisma,
        status: statusPrisma,
        dataNascimento: dataNascimento ? new Date(dataNascimento) : null,
        dataEntrada: dataEntrada ? new Date(dataEntrada) : null,
        casaAnterior,
        orixasCabeca,
        nomeGuiaChefe,
      },
    })

    return NextResponse.json(medium, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar médium:', error)
    return NextResponse.json(
      { error: 'Erro ao criar médium.' },
      { status: 500 },
    )
  }
}

