// src/app/api/users/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

function hashSenha(senha: string) {
  // Hash simples com SHA256 (por enquanto)
  return crypto.createHash('sha256').update(senha).digest('hex')
}

/**
 * GET /api/users
 * Lista todos os usuários do ERP.
 */
export async function GET() {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        nome: true,
        email: true,
        role: true,
        nivelAcesso: true,
        createdAt: true,
      },
    })

    return NextResponse.json(users)
  } catch (error) {
    console.error('Erro ao listar usuários:', error)
    return NextResponse.json(
      { error: 'Erro ao listar usuários.' },
      { status: 500 },
    )
  }
}

/**
 * POST /api/users
 * body: { nome, email, senha, nivelAcesso }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()

    const nome = String(body.nome || '').trim()
    const email = String(body.email || '').trim()
    const senha = String(body.senha || '').trim()
    const nivelRaw = String(body.nivelAcesso || 'COMUM').toUpperCase()

    if (!nome || !email || !senha) {
      return NextResponse.json(
        { error: 'Nome, e-mail e senha são obrigatórios.' },
        { status: 400 },
      )
    }

    if (!['COMUM', 'AVANCADO', 'SUPERUSER'].includes(nivelRaw)) {
      return NextResponse.json(
        { error: 'Nível de acesso inválido.' },
        { status: 400 },
      )
    }

    const senhaHash = hashSenha(senha)

    const user = await prisma.user.create({
      data: {
        nome,
        email,
        senhaHash,
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

    return NextResponse.json(user, { status: 201 })
  } catch (error: any) {
    console.error('Erro ao criar usuário:', error)
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Já existe um usuário com esse e-mail.' },
        { status: 400 },
      )
    }
    return NextResponse.json(
      { error: 'Erro ao criar usuário.' },
      { status: 500 },
    )
  }
}

