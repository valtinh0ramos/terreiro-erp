// src/app/api/mediums/[id]/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function getMediumIdFromUrl(request: Request): number | null {
  try {
    const url = new URL(request.url)
    const match = url.pathname.match(/\/api\/mediums\/(\d+)(\/)?$/)
    if (match && match[1]) {
      const n = Number(match[1])
      if (!Number.isNaN(n)) return n
    }
  } catch {
    // ignora
  }
  return null
}

// GET /api/mediums/[id]
export async function GET(request: Request) {
  const id = getMediumIdFromUrl(request)
  if (!id) {
    return NextResponse.json(
      { error: 'ID de médium inválido.' },
      { status: 400 },
    )
  }

  try {
    const medium = await prisma.medium.findUnique({
      where: { id },
    })

    if (!medium) {
      return NextResponse.json(
        { error: 'Médium não encontrado.' },
        { status: 404 },
      )
    }

    return NextResponse.json(medium)
  } catch (error) {
    console.error('Erro ao buscar médium:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar médium.' },
      { status: 500 },
    )
  }
}

// PATCH /api/mediums/[id]
export async function PATCH(request: Request) {
  const id = getMediumIdFromUrl(request)
  if (!id) {
    return NextResponse.json(
      { error: 'ID de médium inválido.' },
      { status: 400 },
    )
  }

  try {
    const body = await request.json()

    // Campos que permitiremos editar
    const data: any = {}

    const setStr = (field: keyof typeof body, target: string) => {
      if (field in body) {
        const val = body[field]
        data[target] = val === '' ? null : val
      }
    }

    const setDate = (field: keyof typeof body, target: string) => {
      if (field in body) {
        const val = body[field]
        data[target] = val ? new Date(val) : null
      }
    }

    // Básicos
    setStr('nome', 'nome')
    setStr('email', 'email')
    setStr('telefone', 'telefone')
    setStr('profissao', 'profissao')
    setStr('escolaridade', 'escolaridade')
    setStr('estadoCivil', 'estadoCivil')
    setStr('filiacao', 'filiacao')

    // Espirituais
    setStr('casaAnterior', 'casaAnterior')
    setStr('orixasCabeca', 'orixasCabeca')
    setStr('nomeGuiaChefe', 'nomeGuiaChefe')
    setStr('padrinhoMadrinha', 'padrinhoMadrinha')
    setStr('observacoesDirecao', 'observacoesDirecao')

    // Saúde
    setStr('doencas', 'doencas')
    setStr('medicacoes', 'medicacoes')
    setStr('alergias', 'alergias')
    setStr('observacoesSaude', 'observacoesSaude')

    // Datas
    setDate('dataNascimento', 'dataNascimento')
    setDate('dataEntrada', 'dataEntrada')

    // Nível e status
    if ('nivel' in body && body.nivel) {
      data.nivel = body.nivel
    }
    if ('status' in body && body.status) {
      data.status = body.status
    }

    const updated = await prisma.medium.update({
      where: { id },
      data,
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Erro ao atualizar médium:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar médium.' },
      { status: 500 },
    )
  }
}
