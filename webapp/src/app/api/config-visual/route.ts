// src/app/api/config-visual/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/config-visual
 * Retorna a configuração visual atual (tema).
 */
export async function GET() {
  try {
    let config = await prisma.configVisual.findFirst()

    // Se não existir, cria com tema padrão VERDE
    if (!config) {
      config = await prisma.configVisual.create({
        data: {
          tema: 'VERDE',
        },
      })
    }

    return NextResponse.json(config)
  } catch (error) {
    console.error('Erro ao carregar configuração visual:', error)
    return NextResponse.json(
      { error: 'Erro ao carregar configuração visual.' },
      { status: 500 },
    )
  }
}

/**
 * PATCH /api/config-visual
 * body: { tema: "VERDE" | "AZUL" | "ROXO" | "CLARO" }
 */
export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const temaRaw = String(body.tema || '').toUpperCase()

    if (!['VERDE', 'AZUL', 'ROXO', 'CLARO'].includes(temaRaw)) {
      return NextResponse.json(
        { error: 'Tema visual inválido.' },
        { status: 400 },
      )
    }

    let config = await prisma.configVisual.findFirst()

    if (!config) {
      config = await prisma.configVisual.create({
        data: {
          tema: temaRaw as any,
        },
      })
    } else {
      config = await prisma.configVisual.update({
        where: { id: config.id },
        data: { tema: temaRaw as any },
      })
    }

    return NextResponse.json(config)
  } catch (error) {
    console.error('Erro ao atualizar configuração visual:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar configuração visual.' },
      { status: 500 },
    )
  }
}

