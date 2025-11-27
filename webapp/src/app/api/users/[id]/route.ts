// src/app/api/users/[id]/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

type ParamsType = {
  params: { id: string }
}

/**
 * PATCH /api/users/[id]
 * body: { nivelAcesso: "COMUM" | "AVANCADO" | "SUPERUSER" }
 */
export async function PATCH(
  request: Request,
  { params }: ParamsType,
) {
  const id = Number(params.id)
  if (Number.isNaN(id)) {
    return NextResponse.json(
      { error: 'ID de usuário inválido.' },
      { status: 400 },
    )
  }

  try {
    const body = await request.json()
    const nivelRaw = String(body.nivelAcesso || '').toUpperCase()

    if (!['COMUM', 'AVANCADO', 'SUPERUSER'].includes(nivelRaw)) {
      return NextResponse.json(
        { error: 'Nível de acesso inválido.' },
        { status: 400 },
      )
    }

    const user = await prisma.user.update({
      where: { id },
      data: {
        nivelAcesso: nivelRaw as any,
      },
      select: {
        id: true,
        nome: true,
        email: true,
        role: true,
        nivelAcesso: true,
        createdAt: true,
      },
    })

    return NextResponse.json(user)
  } catch (error) {
    console.error('Erro ao atualizar nível de acesso do usuário:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar nível de acesso.' },
      { status: 500 },
    )
  }
}

