// src/app/api/curso/material/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const materiais = await prisma.materialDidatico.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        turma: {
          select: { id: true, codigo: true, nome: true },
        },
      },
    })
    return NextResponse.json(materiais)
  } catch (error) {
    console.error('Erro ao listar material didático:', error)
    return NextResponse.json(
      { error: 'Erro ao listar material didático.' },
      { status: 500 },
    )
  }
}

// Para uploads/registro, podemos fazer um POST simples que recebe titulo + url
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const titulo = String(body.titulo || '').trim()
    const url = String(body.url || '').trim()

    if (!titulo || !url) {
      return NextResponse.json(
        { error: 'Título e URL são obrigatórios.' },
        { status: 400 },
      )
    }

    const material = await prisma.materialDidatico.create({
      data: {
        titulo,
        url,
        descricao: body.descricao || null,
        turmaId: body.turmaId ? Number(body.turmaId) : null,
      },
    })

    return NextResponse.json(material, { status: 201 })
  } catch (error) {
    console.error('Erro ao cadastrar material didático:', error)
    return NextResponse.json(
      { error: 'Erro ao cadastrar material didático.' },
      { status: 500 },
    )
  }
}

