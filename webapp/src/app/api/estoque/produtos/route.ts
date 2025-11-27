// src/app/api/estoque/produtos/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/estoque/produtos
 * Lista todos os produtos de estoque
 */
export async function GET() {
  try {
    const produtos = await prisma.produtoEstoque.findMany({
      orderBy: { nome: 'asc' },
    })
    return NextResponse.json(produtos)
  } catch (error) {
    console.error('Erro ao listar produtos de estoque:', error)
    return NextResponse.json(
      { error: 'Erro ao listar produtos de estoque.' },
      { status: 500 },
    )
  }
}

/**
 * POST /api/estoque/produtos
 * body: { nome, categoria, unidade, estoqueMinimo? }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const nome = String(body.nome || '').trim()
    const categoria = String(body.categoria || '').trim()
    const unidade = String(body.unidade || '').trim()
    const estoqueMinimo = body.estoqueMinimo
      ? Number(body.estoqueMinimo)
      : null

    if (!nome || !unidade) {
      return NextResponse.json(
        { error: 'Nome e unidade são obrigatórios.' },
        { status: 400 },
      )
    }

    const produto = await prisma.produtoEstoque.create({
      data: {
        nome,
        categoria: categoria || 'Geral',
        unidade,
        estoqueMinimo: estoqueMinimo ?? null,
        quantidadeAtual: 0,
      },
    })

    return NextResponse.json(produto, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar produto de estoque:', error)
    return NextResponse.json(
      { error: 'Erro ao criar produto de estoque.' },
      { status: 500 },
    )
  }
}

