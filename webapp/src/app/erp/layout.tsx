import type { ReactNode } from 'react'
import { redirect } from 'next/navigation'
import { getCurrentUserFromCookie } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

type Props = {
  children: ReactNode
}

type TemaVisual = 'VERDE' | 'AZUL' | 'ROXO' | 'CLARO'

/**
 * Configuração de cores pra cada tema.
 * CLARO tenta seguir o estilo ChatGPT: fundo branco, sidebar cinza claro, texto escuro.
 */
const temaConfig: Record<
  TemaVisual,
  {
    appBg: string
    appText: string
    sidebarBg: string
    sidebarBorder: string
    navText: string
    navHoverBg: string
    navHoverText: string
    logoAccent: string
    topbarBg: string
    topbarText: string
    topbarBorder: string
    footerText: string
  }
> = {
  VERDE: {
    appBg: 'bg-slate-950',
    appText: 'text-slate-50',
    sidebarBg: 'bg-slate-900',
    sidebarBorder: 'border-slate-800',
    navText: 'text-slate-200',
    navHoverBg: 'hover:bg-slate-800',
    navHoverText: 'hover:text-emerald-300',
    logoAccent: 'text-emerald-400',
    topbarBg: 'bg-slate-950/80',
    topbarText: 'text-slate-200',
    topbarBorder: 'border-slate-800',
    footerText: 'text-slate-400',
  },
  AZUL: {
    appBg: 'bg-slate-950',
    appText: 'text-slate-50',
    sidebarBg: 'bg-slate-900',
    sidebarBorder: 'border-slate-800',
    navText: 'text-slate-200',
    navHoverBg: 'hover:bg-slate-800',
    navHoverText: 'hover:text-sky-300',
    logoAccent: 'text-sky-400',
    topbarBg: 'bg-slate-950/80',
    topbarText: 'text-slate-200',
    topbarBorder: 'border-slate-800',
    footerText: 'text-slate-400',
  },
  ROXO: {
    appBg: 'bg-slate-950',
    appText: 'text-slate-50',
    sidebarBg: 'bg-slate-900',
    sidebarBorder: 'border-slate-800',
    navText: 'text-slate-200',
    navHoverBg: 'hover:bg-slate-800',
    navHoverText: 'hover:text-violet-300',
    logoAccent: 'text-violet-400',
    topbarBg: 'bg-slate-950/80',
    topbarText: 'text-slate-200',
    topbarBorder: 'border-slate-800',
    footerText: 'text-slate-400',
  },
  CLARO: {
    appBg: 'bg-white',
    appText: 'text-slate-900',
    sidebarBg: 'bg-[#F7F7F8]',
    sidebarBorder: 'border-[#E5E5E5]',
    navText: 'text-slate-800',
    navHoverBg: 'hover:bg-[#EBEBEC]',
    navHoverText: 'hover:text-slate-900',
    logoAccent: 'text-emerald-700',
    topbarBg: 'bg-white/80',
    topbarText: 'text-slate-800',
    topbarBorder: 'border-[#E5E5E5]',
    footerText: 'text-slate-500',
  },
}

function roleLabel(role: string) {
  switch (role) {
    case 'DIRECAO':
      return 'Direção'
    case 'SECRETARIA':
      return 'Secretaria'
    case 'FINANCEIRO':
      return 'Financeiro'
    case 'COORDENACAO_ESTUDOS':
      return 'Coordenação / Estudos'
    case 'BIBLIOTECA':
      return 'Biblioteca'
    case 'ESTOQUE_CANTINA':
      return 'Estoque / Cantina'
    case 'MEDIUM_LIMITADO':
      return 'Médium (acesso limitado)'
    default:
      return role
  }
}

export default async function ErpLayout({ children }: Props) {
  const user = await getCurrentUserFromCookie()

  if (!user) {
    redirect('/login')
  }

  // 🔑 Nível de acesso (COMUM / AVANCADO / SUPERUSER)
  const nivelAcesso =
    ((user as any)?.nivelAcesso as 'COMUM' | 'AVANCADO' | 'SUPERUSER') ||
    'SUPERUSER'

  const isSuperUser = nivelAcesso === 'SUPERUSER'
  const isAvancado = nivelAcesso === 'AVANCADO' || isSuperUser
  const isComum = nivelAcesso === 'COMUM'

  // 🎨 Tema visual carregado do banco (ConfigVisual)
  let tema: TemaVisual = 'VERDE'
  try {
    const config = await prisma.configVisual.findFirst()
    if (
      config &&
      config.tema &&
      ['VERDE', 'AZUL', 'ROXO', 'CLARO'].includes(config.tema)
    ) {
      tema = config.tema as TemaVisual
    }
  } catch (e) {
    console.error('Erro ao carregar ConfigVisual. Usando tema VERDE.', e)
  }

  const t = temaConfig[tema]

  return (
    <div className={`min-h-screen flex ${t.appBg} ${t.appText}`}>
      {/* ---------------------- SIDEBAR ---------------------- */}
      <aside
        className={`w-64 flex flex-col ${t.sidebarBg} ${t.sidebarBorder} border-r`}
      >
        {/* Topo do menu */}
        <div className="px-4 py-4 border-b border-[#E5E5E5]/60">
          <h1 className="text-lg font-semibold leading-tight text-slate-900">
            Tenda Espírita
            <span className={`block text-xs ${t.logoAccent}`}>
              Nossa Senhora da Glória
            </span>
          </h1>
        </div>

        {/* MENU LATERAL */}
        <nav className="flex-1 overflow-y-auto py-3">
          <ul className="space-y-1 px-2 text-sm">
            {/* DASHBOARD – todos veem */}
            <li>
              <a
                href="/erp"
                className={`block rounded-md px-3 py-2 ${t.navText} ${t.navHoverBg} ${t.navHoverText} transition`}
              >
                Dashboard
              </a>
            </li>

            {/* MÉDIUNS – AVANÇADO e SUPERUSER */}
            {isAvancado && (
              <li>
                <a
                  href="/erp/mediums"
                  className={`block rounded-md px-3 py-2 ${t.navText} ${t.navHoverBg} ${t.navHoverText} transition`}
                >
                  Médiuns
                </a>
              </li>
            )}

            {/* SESSÕES */}
            {isAvancado && (
              <li className="mt-1">
                <details
                  className={`group rounded-md border ${t.sidebarBorder} ${t.sidebarBg}`}
                >
                  <summary
                    className={`flex items-center justify-between cursor-pointer px-3 py-2 ${t.navText} ${t.navHoverBg} ${t.navHoverText} list-none`}
                  >
                    <span className="text-sm font-medium">Sessões</span>
                    <span className="text-xs font-mono text-slate-500 group-open:hidden">
                      + aparecer
                    </span>
                    <span className="text-xs font-mono text-slate-500 hidden group-open:inline">
                      - esconder
                    </span>
                  </summary>

                  <div className="border-t border-[#E5E5E5]/60 py-1">
                    <a
                      href="/erp/presencas"
                      className="block px-4 py-1.5 text-xs text-slate-700 hover:bg-[#EBEBEC] hover:text-slate-900"
                    >
                      Lançar Sessões (presenças)
                    </a>
                    <a
                      href="/erp/sessoes"
                      className="block px-4 py-1.5 text-xs text-slate-700 hover:bg-[#EBEBEC] hover:text-slate-900"
                    >
                      Listar Sessões
                    </a>
                    <a
                      href="/erp/sessoes/presencas"
                      className="block px-4 py-1.5 text-xs text-slate-700 hover:bg-[#EBEBEC] hover:text-slate-900"
                    >
                      Presenças dos médiuns
                    </a>
                  </div>
                </details>
              </li>
            )}

            {/* DISCIPLINA */}
            {isAvancado && (
              <li>
                <a
                  href="/erp/disciplina"
                  className={`block rounded-md px-3 py-2 ${t.navText} ${t.navHoverBg} ${t.navHoverText} transition`}
                >
                  Disciplina
                </a>
              </li>
            )}

	   {/* FINANCEIRO */}
{isAvancado && (
  <li className="mt-1">
    <details
      className={`group rounded-md border ${t.sidebarBorder} ${t.sidebarBg}`}
    >
      <summary
        className={`flex items-center justify-between cursor-pointer px-3 py-2 ${t.navText} ${t.navHoverBg} ${t.navHoverText} list-none`}
      >
        <span className="text-sm font-medium">Financeiro</span>
        <span className="text-xs font-mono text-slate-500 group-open:hidden">
          + aparecer
        </span>
        <span className="text-xs font-mono text-slate-500 hidden group-open:inline">
          - esconder
        </span>
      </summary>

      <div className="border-t border-[#E5E5E5]/60 py-1">
        {/* Página principal do Financeiro */}
        <a
          href="/erp/financeiro"
          className="block px-4 py-1.5 text-xs text-slate-700 hover:bg-[#EBEBEC] hover:text-slate-900"
        >
          Visão Geral
        </a>

        {/*  Novo submenu: Doações */}
        <a
          href="/erp/financeiro/doacoes"
          className="block px-4 py-1.5 text-xs text-slate-700 hover:bg-[#EBEBEC] hover:text-slate-900"
        >
          Doações Financeiras
        </a>
	<a
  	href="/erp/financeiro/despesas"
  	className="block px-4 py-1.5 text-xs text-slate-700 hover:bg-[#EBEBEC] hover:text-slate-900"
	>
  	Despesas
	</a>
        {/* Futuro: outras opções podem ser adicionadas aqui */}
      </div>
    </details>
  </li>
)}

            {/* ESTOQUE */}
            {isAvancado && (
              <li>
                <a
                  href="/erp/estoque"
                  className={`block rounded-md px-3 py-2 ${t.navText} ${t.navHoverBg} ${t.navHoverText} transition`}
                >
                  Estoque
                </a>
              </li>
            )}

            {/* BIBLIOTECA */}
            {isAvancado && (
              <li>
                <a
                  href="/erp/biblioteca"
                  className={`block rounded-md px-3 py-2 ${t.navText} ${t.navHoverBg} ${t.navHoverText} transition`}
                >
                  Biblioteca
                </a>
              </li>
            )}

            {/* VOLUNTÁRIOS */}
            {isAvancado && (
              <li>
                <a
                  href="/erp/voluntarios"
                  className={`block rounded-md px-3 py-2 ${t.navText} ${t.navHoverBg} ${t.navHoverText} transition`}
                >
                  Voluntários
                </a>
              </li>
            )}

            {/* GUIAS */}
            {isAvancado && (
              <li>
                <a
                  href="/erp/guias"
                  className={`block rounded-md px-3 py-2 ${t.navText} ${t.navHoverBg} ${t.navHoverText} transition`}
                >
                  Guias
                </a>
              </li>
            )}

            {/* CURSO DE UMBANDA */}
            {isAvancado && (
              <li className="mt-2">
                <details
                  className={`group rounded-md border ${t.sidebarBorder} ${t.sidebarBg}`}
                >
                  <summary
                    className={`flex items-center justify-between cursor-pointer px-3 py-2 ${t.navText} ${t.navHoverBg} ${t.navHoverText} list-none`}
                  >
                    <span className="text-sm font-medium">
                      Curso de Umbanda
                    </span>
                    <span className="text-xs font-mono text-slate-500 group-open:hidden">
                      + aparecer
                    </span>
                    <span className="text-xs font-mono text-slate-500 hidden group-open:inline">
                      - esconder
                    </span>
                  </summary>

                  <div className="border-t border-[#E5E5E5]/60 py-1">
                    <a
                      href="/erp/curso"
                      className="block px-4 py-1.5 text-xs text-slate-700 hover:bg-[#EBEBEC] hover:text-slate-900"
                    >
                      Alunos (pretendentes)
                    </a>
                    <a
                      href="/erp/curso/turmas"
                      className="block px-4 py-1.5 text-xs text-slate-700 hover:bg-[#EBEBEC] hover:text-slate-900"
                    >
                      Turmas
                    </a>
                    <a
                      href="/erp/curso/material"
                      className="block px-4 py-1.5 text-xs text-slate-700 hover:bg-[#EBEBEC] hover:text-slate-900"
                    >
                      Material Didático
                    </a>
                  </div>
                </details>
              </li>
            )}

            {/* PAINEL DE CONTROLE */}
            {isSuperUser && (
              <li className="mt-4">
                <a
                  href="/erp/painel-controle"
                  className={`block rounded-md px-3 py-2 ${t.navText} ${t.navHoverBg} ${t.navHoverText} transition`}
                >
                  Painel de Controle
                </a>
              </li>
            )}
          </ul>
        </nav>

        {/* Rodapé da sidebar */}
        <div
          className={`px-4 py-4 border-t border-[#E5E5E5]/60 text-xs ${t.footerText}`}
        >
          <div className="font-semibold text-slate-800">
            {user?.nome ?? 'Usuário'}
          </div>
          <div>{roleLabel((user as any)?.role || '')}</div>
          <div className="mt-1 text-[11px]">
            Nível de acesso: <strong>{nivelAcesso}</strong>
          </div>
          <div className="mt-2 text-[11px]">
            Área restrita – uso exclusivo interno.
          </div>
        </div>
      </aside>

      {/* ---------------------- CONTEÚDO PRINCIPAL ---------------------- */}
      <div className="flex-1 flex flex-col min-w-0">
        <ErpTopbar userName={user?.nome || ''} tema={tema} />
        <main className="flex-1 p-4 lg:p-6 overflow-y-auto">{children}</main>
      </div>
    </div>
  )
}

function ErpTopbar({
  userName,
  tema,
}: {
  userName: string
  tema: TemaVisual
}) {
  const t = temaConfig[tema]
  return (
    <div
      className={`h-14 flex items-center justify-between px-4 lg:px-6 ${t.topbarBg} ${t.topbarText} ${t.topbarBorder} border-b backdrop-blur`}
    >
      <div className="text-sm font-medium">
        Painel de Gestão do Terreiro
      </div>

      <form
        action="/api/auth/logout"
        method="post"
        className="flex items-center gap-3"
      >
        <span className="text-xs text-slate-500 hidden sm:inline">
          Logado como{' '}
          <span className="text-slate-800 font-semibold">
            {userName}
          </span>
        </span>
        <button
          type="submit"
          className="rounded-full border border-slate-400 px-3 py-1 text-xs text-slate-700 hover:bg-slate-200 transition"
        >
          Sair
        </button>
      </form>
    </div>
  )
}

