// src/app/api/estoque/movimentacoes/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { MovimentacaoTipo } from '@prisma/client'

/**
 * GET /api/estoque/movimentacoes
 * Lista últimas 100 movimentações com info do produto.
 */
export async function GET() {
  try {
    const movs = await prisma.movimentacaoEstoque.findMany({
      orderBy: { data: 'desc' },
      take: 100,
      include: {
        produtoEstoque: {
          select: {
            id: true,
            nome: true,
            unidade: true,
          },
        },
      },
    })

    return NextResponse.json(movs)
  } catch (error) {
    console.error('Erro ao listar movimentações de estoque:', error)
    return NextResponse.json(
      { error: 'Erro ao listar movimentações de estoque.' },
      { status: 500 },
    )
  }
}

/**
 * POST /api/estoque/movimentacoes
 *
 * body: {
 *   produtoEstoqueId: number
 *   tipo: "ENTRADA"|"SAIDA"|"AJUSTE"
 *   quantidade: number
 *   origem?: string
 *   observacao?: string
 * }
 *
 * - ENTRADA: incrementa quantidadeAtual
 * - SAIDA: decrementa quantidadeAtual
 * - AJUSTE: define quantidadeAtual exatamente como o valor informado
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()

    const produtoEstoqueId = Number(body.produtoEstoqueId)
    const tipoRaw = String(body.tipo || '').toUpperCase()
    const quantidade = Number(body.quantidade || 0)
    const origem = body.origem ? String(body.origem).trim() : null
    const observacao = body.observacao
      ? String(body.observacao).trim()
      : null

    if (!produtoEstoqueId || Number.isNaN(produtoEstoqueId)) {
      return NextResponse.json(
        { error: 'produtoEstoqueId inválido.' },
        { status: 400 },
      )
    }

    if (
      !['ENTRADA', 'SAIDA', 'AJUSTE'].includes(tipoRaw)
    ) {
      return NextResponse.json(
        { error: 'Tipo inválido. Use ENTRADA, SAIDA ou AJUSTE.' },
        { status: 400 },
      )
    }

    if (!quantidade || Number.isNaN(quantidade) || quantidade <= 0) {
      return NextResponse.json(
        { error: 'Quantidade deve ser > 0.' },
        { status: 400 },
      )
    }

    const tipo = tipoRaw as MovimentacaoTipo

    const mov = await prisma.$transaction(async (tx) => {
      // Busca produto atual
      const produto = await tx.produtoEstoque.findUnique({
        where: { id: produtoEstoqueId },
      })

      if (!produto) {
        throw new Error('Produto de estoque não encontrado.')
      }

      let novaQuantidade = Number(produto.quantidadeAtual || 0)

      if (tipo === 'ENTRADA') {
        novaQuantidade += quantidade
      } else if (tipo === 'SAIDA') {
        novaQuantidade -= quantidade
        if (novaQuantidade < 0) novaQuantidade = 0
      } else if (tipo === 'AJUSTE') {
        novaQuantidade = quantidade
      }

      // Cria movimentação
      const created = await tx.movimentacaoEstoque.create({
        data: {
          produtoEstoqueId,
          tipo,
          quantidade,
          origem: origem || undefined,
          observacao: observacao || undefined,
        },
      })

      // Atualiza quantidadeAtual
      await tx.produtoEstoque.update({
        where: { id: produtoEstoqueId },
        data: {
          quantidadeAtual: novaQuantidade,
        },
      })

      return created
    })

    return NextResponse.json(mov, { status: 201 })
  } catch (error: any) {
    console.error('Erro ao registrar movimentação de estoque:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao registrar movimentação.' },
      { status: 500 },
    )
  }
}

