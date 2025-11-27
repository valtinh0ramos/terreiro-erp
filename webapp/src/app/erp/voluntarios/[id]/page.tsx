'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'

type VoluntarioView = {
  id: number
  codigo: string | null
  nome: string
  email: string | null
  telefone: string | null
  tipo: string
  ativo: boolean
  areasAtuacao: string | null
  observacoes: string | null
  pretendente?: {
    id: number
    nome: string
    codigo: string | null
  } | null
  medium?: {
    id: number
    nome: string
    codigo: string | null
  } | null
}

export default function VoluntarioFichaPage() {
  const params = useParams()
  const router = useRouter()
  const id = params?.id as string

  const [dados, setDados] = useState<VoluntarioView | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionMsg, setActionMsg] = useState<string | null>(null)
  const [promovendo, setPromovendo] = useState(false)

  useEffect(() => {
    async function load() {
      if (!id) return
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`/api/voluntarios/${id}`)
        const data = await res.json()
        if (!res.ok) {
          setError(data.error || 'Erro ao carregar voluntário.')
          setLoading(false)
          return
        }
        setDados(data)
      } catch (e: any) {
        console.error(e)
        setError(e.message || 'Erro ao carregar voluntário.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  async function promoverMedium() {
    if (!id) return
    setPromovendo(true)
    setError(null)
    setActionMsg(null)

    try {
      const res = await fetch(
        `/api/voluntarios/${id}/promover-medium`,
        { method: 'POST' },
      )
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Erro ao promover voluntário a médium.')
        setPromovendo(false)
        return
      }
      setActionMsg('Voluntário promovido a médium. Redirecionando...')
      setTimeout(() => {
        router.push(`/erp/mediums/${data.mediumId}`)
      }, 800)
    } catch (e: any) {
      console.error(e)
      setError(e.message || 'Erro ao promover voluntário.')
    } finally {
      setPromovendo(false)
    }
  }

  if (!id) {
    return (
      <div className="text-xs text-slate-400">
        ID de voluntário inválido.
      </div>
    )
  }

  if (loading) {
    return (
      <div className="text-xs text-slate-400">
        Carregando ficha do voluntário...
      </div>
    )
  }

  if (!dados) {
    return (
      <div className="text-xs text-red-400">
        Não foi possível carregar os dados do voluntário.
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-50">
            {dados.codigo
              ? `${dados.codigo} – ${dados.nome}`
              : dados.nome}
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Ficha de voluntário da casa espiritual.
          </p>
        </div>

        <div className="flex flex-col items-start md:items-end gap-2 text-xs text-slate-300">
          <button
            type="button"
            onClick={() => router.push('/erp/voluntarios')}
            className="rounded-full border border-slate-700 px-3 py-1 text-[11px] text-slate-100 hover:bg-slate-800"
          >
            Voltar para lista de voluntários
          </button>

          <button
            type="button"
            disabled={promovendo}
            onClick={promoverMedium}
            className="rounded-full border border-emerald-600 bg-emerald-500/10 px-3 py-1 text-[11px] text-emerald-200 hover:bg-emerald-500/30 disabled:opacity-60"
          >
            Transformar em médium
          </button>

          {actionMsg && (
            <div className="text-[11px] text-emerald-300">
              {actionMsg}
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="text-xs text-red-400 bg-red-950/40 border border-red-800 rounded-lg px-3 py-2">
          {error}
        </div>
      )}

      {/* Dados principais */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-1">
          <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
            <h2 className="text-sm font-semibold text-slate-100 mb-3">
              Dados do voluntário
            </h2>
            <div className="space-y-1 text-xs text-slate-300">
              <div>
                <span className="font-semibold text-slate-200">
                  Nome:{' '}
                </span>
                {dados.nome}
              </div>
              <div>
                <span className="font-semibold text-slate-200">
                  E-mail:{' '}
                </span>
                {dados.email || '-'}
              </div>
              <div>
                <span className="font-semibold text-slate-200">
                  Telefone:{' '}
                </span>
                {dados.telefone || '-'}
              </div>
              <div>
                <span className="font-semibold text-slate-200">
                  Tipo:{' '}
                </span>
                {dados.tipo}
              </div>
              <div>
                <span className="font-semibold text-slate-200">
                  Ativo:{' '}
                </span>
                {dados.ativo ? 'Sim' : 'Não'}
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
            <h2 className="text-sm font-semibold text-slate-100 mb-3">
              Origem
            </h2>
            <div className="text-xs text-slate-300 space-y-1">
              {dados.pretendente ? (
                <div>
                  <span className="font-semibold text-slate-200">
                    Ex-aluno:{' '}
                  </span>
                  {dados.pretendente.codigo
                    ? `${dados.pretendente.codigo} – ${dados.pretendente.nome}`
                    : dados.pretendente.nome}
                </div>
              ) : (
                <div>Não veio de cadastro de aluno.</div>
              )}

              {dados.medium ? (
                <div>
                  <span className="font-semibold text-slate-200">
                    Já ligado ao médium:{' '}
                  </span>
                  {dados.medium.codigo
                    ? `${dados.medium.codigo} – ${dados.medium.nome}`
                    : dados.medium.nome}
                </div>
              ) : (
                <div>Não há vínculo com médium ainda.</div>
              )}
            </div>
          </div>
        </div>

        {/* Atuação & Observações */}
        <div className="space-y-4 lg:col-span-2">
          <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
            <h2 className="text-sm font-semibold text-slate-100 mb-3">
              Áreas de atuação
            </h2>
            <p className="text-xs text-slate-300">
              {dados.areasAtuacao || '-'}
            </p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
            <h2 className="text-sm font-semibold text-slate-100 mb-3">
              Observações
            </h2>
            <p className="text-xs text-slate-300">
              {dados.observacoes || '-'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

