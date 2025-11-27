// src/app/api/doacoes/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { DoacaoTipo, FormaPagamento } from '@prisma/client'

/**
 * GET /api/doacoes?tipo=FINANCEIRA|MATERIAL
 * Lista últimas 100 doações, com médium (se houver) e itens (se material).
 */
export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const tipoParam = url.searchParams.get('tipo')

    const where: any = {}
    if (tipoParam && (tipoParam === 'FINANCEIRA' || tipoParam === 'MATERIAL')) {
      where.tipo = tipoParam as DoacaoTipo
    }

    const doacoes = await prisma.doacao.findMany({
      where,
      orderBy: { data: 'desc' },
      take: 100,
      include: {
        medium: {
          select: {
            id: true,
            nome: true,
          },
        },
        itens: {
          include: {
            produtoEstoque: {
              select: {
                id: true,
                nome: true,
                unidade: true,
              },
            },
          },
        },
      },
    })

    return NextResponse.json(doacoes)
  } catch (error) {
    console.error('Erro ao listar doações:', error)
    return NextResponse.json(
      { error: 'Erro ao listar doações.' },
      { status: 500 },
    )
  }
}

/**
 * POST /api/doacoes
 *
 * body financeiro:
 * {
 *   tipo: "FINANCEIRA",
 *   mediumId?: number,
 *   doadorExterno?: string,
 *   valor: number,
 *   formaPagamento?: "DINHEIRO"|"PIX"|"CARTAO"|"OUTRO",
 *   observacoes?: string
 * }
 *
 * body material:
 * {
 *   tipo: "MATERIAL",
 *   mediumId?: number,
 *   doadorExterno?: string,
 *   itens: [
 *     { produtoEstoqueId: number, quantidade: number }
 *   ],
 *   observacoes?: string
 * }
 *
 * Regra:
 * - se MATERIAL: gera Doacao + DoacaoItem + MovimentacaoEstoque(ENTRADA)
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()

    const tipoRaw = String(body.tipo || '').toUpperCase()
    if (tipoRaw !== 'FINANCEIRA' && tipoRaw !== 'MATERIAL') {
      return NextResponse.json(
        { error: 'Tipo de doação inválido. Use FINANCEIRA ou MATERIAL.' },
        { status: 400 },
      )
    }

    const tipo = tipoRaw as DoacaoTipo
    const mediumId = body.mediumId ? Number(body.mediumId) : null
    const doadorExterno = body.doadorExterno
      ? String(body.doadorExterno).trim()
      : null
    const observacoes = body.observacoes
      ? String(body.observacoes).trim()
      : null

    if (!mediumId && !doadorExterno) {
      return NextResponse.json(
        {
          error:
            'Informe um médium (mediumId) ou um doador externo (doadorExterno).',
        },
        { status: 400 },
      )
    }

    // DOAÇÃO FINANCEIRA
    if (tipo === 'FINANCEIRA') {
      const valor = Number(body.valor || 0)
      if (!valor || Number.isNaN(valor) || valor <= 0) {
        return NextResponse.json(
          { error: 'Valor da doação financeira é obrigatório e deve ser > 0.' },
          { status: 400 },
        )
      }

      let formaPagamento: FormaPagamento | null = null
      if (body.formaPagamento) {
        const raw = String(body.formaPagamento).toUpperCase() as keyof typeof FormaPagamento
        if (FormaPagamento[raw]) {
          formaPagamento = FormaPagamento[raw]
        }
      }

      const doacao = await prisma.doacao.create({
        data: {
          tipo,
          mediumId: mediumId || undefined,
          doadorExterno: doadorExterno || undefined,
          valor,
          formaPagamento: formaPagamento || null,
          observacoes,
        },
      })

      return NextResponse.json(doacao, { status: 201 })
    }

    // DOAÇÃO MATERIAL
    if (tipo === 'MATERIAL') {
      const itens = Array.isArray(body.itens) ? body.itens : []

      if (itens.length === 0) {
        return NextResponse.json(
          { error: 'Doação material deve conter ao menos um item.' },
          { status: 400 },
        )
      }

      // Cria a doação + itens + movimentações de estoque numa transação
      const resultado = await prisma.$transaction(async (tx) => {
        const doacao = await tx.doacao.create({
          data: {
            tipo,
            mediumId: mediumId || undefined,
            doadorExterno: doadorExterno || undefined,
            observacoes,
          },
        })

        for (const item of itens) {
          const produtoEstoqueId = Number(item.produtoEstoqueId)
          const quantidade = Number(item.quantidade)

          if (!produtoEstoqueId || Number.isNaN(produtoEstoqueId)) {
            throw new Error('produtoEstoqueId inválido em item de doação.')
          }
          if (!quantidade || Number.isNaN(quantidade) || quantidade <= 0) {
            throw new Error('Quantidade inválida em item de doação.')
          }

          // Cria o item da doação
          await tx.doacaoItem.create({
            data: {
              doacaoId: doacao.id,
              produtoEstoqueId,
              quantidade,
            },
          })

          // Cria a movimentação de estoque (ENTRADA)
          await tx.movimentacaoEstoque.create({
            data: {
              produtoEstoqueId,
              tipo: 'ENTRADA',
              quantidade,
              origem: 'Doação material',
              observacao: `Doação vinculada à doação ID ${doacao.id}`,
            },
          })

          // Atualiza quantidade atual do produto
          await tx.produtoEstoque.update({
            where: { id: produtoEstoqueId },
            data: {
              quantidadeAtual: {
                increment: quantidade,
              },
            },
          })
        }

        return doacao
      })

      return NextResponse.json(resultado, { status: 201 })
    }

    // Não deve chegar aqui, mas por segurança:
    return NextResponse.json(
      { error: 'Tipo de doação não tratado.' },
      { status: 400 },
    )
  } catch (error: any) {
    console.error('Erro ao registrar doação:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao registrar doação.' },
      { status: 500 },
    )
  }
}

