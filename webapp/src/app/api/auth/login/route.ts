// src/app/api/auth/login/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  createAuthToken,
  AUTH_COOKIE_NAME,
  AUTH_COOKIE_MAX_AGE_DAYS,
} from '@/lib/auth'
import crypto from 'crypto'

function hashSenha(senha: string) {
  // Mesmo hash utilizado em /api/users
  return crypto.createHash('sha256').update(senha).digest('hex')
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const email = String(body.email || '').trim().toLowerCase()
    const senha = String(body.senha || '').trim()

    if (!email || !senha) {
      return NextResponse.json(
        { error: 'E-mail e senha são obrigatórios.' },
        { status: 400 },
      )
    }

    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Credenciais inválidas.' },
        { status: 401 },
      )
    }

    const senhaHash = hashSenha(senha)

    if (user.senhaHash !== senhaHash) {
      return NextResponse.json(
        { error: 'Credenciais inválidas.' },
        { status: 401 },
      )
    }

    // Gera o token com os dados do usuário
    const token = await createAuthToken({
      id: user.id,
      email: user.email,
      nome: user.nome,
      role: user.role,
      nivelAcesso: user.nivelAcesso as any,
    })

    // Cria a resposta e seta o cookie de autenticação
    const response = NextResponse.json({ ok: true })

    const maxAgeSeconds = AUTH_COOKIE_MAX_AGE_DAYS * 24 * 60 * 60

    response.cookies.set(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: maxAgeSeconds,
      path: '/',
    })

    return response
  } catch (error) {
    console.error('Erro no login:', error)
    return NextResponse.json(
      { error: 'Erro ao processar login.' },
      { status: 500 },
    )
  }
}

