// src/lib/auth.ts
import { cookies } from 'next/headers'
import { SignJWT, jwtVerify, JWTPayload } from 'jose'

export const AUTH_COOKIE_NAME = 'erp_auth'
export const AUTH_COOKIE_MAX_AGE_DAYS = 30

const SECRET_KEY = new TextEncoder().encode(
  process.env.AUTH_SECRET || 'dev-secret-change-me',
)

export type AuthUserPayload = {
  id: number
  email: string
  nome: string
  role?: string | null
  nivelAcesso?: 'COMUM' | 'AVANCADO' | 'SUPERUSER'
}

/**
 * Cria o token JWT com os dados do usuário.
 */
export async function createAuthToken(payload: AuthUserPayload) {
  return await new SignJWT(payload as unknown as JWTPayload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${AUTH_COOKIE_MAX_AGE_DAYS}d`)
    .sign(SECRET_KEY)
}

/**
 * Verifica e decodifica o token JWT.
 */
export async function verifyAuthToken(token: string) {
  const { payload } = await jwtVerify(token, SECRET_KEY)
  return payload as AuthUserPayload
}

/**
 * Lê o cookie de autenticação e devolve o usuário ou null.
 *
 * ATENÇÃO: em Next 16, cookies() é assíncrono → precisa de await.
 */
export async function getCurrentUserFromCookie(): Promise<AuthUserPayload | null> {
  try {
    const cookieStore = await cookies() // <-- aqui está a correção
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value
    if (!token) return null

    const user = await verifyAuthToken(token)
    return user
  } catch (e) {
    console.error('Erro ao ler token de autenticação:', e)
    return null
  }
}

