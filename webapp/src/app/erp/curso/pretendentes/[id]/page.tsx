'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'

type Matricula = {
  id: number
  turmaId: number
  dataInicio: string | null
  statusCurso: string
  etapaParou: string | null
  observacoes: string | null
  resultadoFinal: string | null
}

type VoluntarioRef = {
  id: number
  codigo: string
  tipo: string
}

type PretendenteView = {
  id: number
  codigo: string | null
  nome: string
  dataNascimento: string | null
  email: string | null
  telefone: string | null
  escolaridade: string | null
  profissao: string | null
  endereco: string | null
  indicacao: string | null
  observacoes: string | null
  matriculas: Matricula[]
  voluntarios: VoluntarioRef[]
}

function formatDate(date: string | null) {
  if (!date) return '-'
  const d = new Date(date)
  if (Number.isNaN(d.getTime())) return '-'
  return d.toLocaleDateString('pt-BR')
}

export default function PretendenteFichaPage() {
  const params = useParams()
  const router = useRouter()
  const id = params?.id as string

  const [dados, setDados] = useState<PretendenteView | null>(null)
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
        const res = await fetch(`/api/curso/pretendentes/${id}`)
        const data = await res.json()
        if (!res.ok) {
          setError(data.error || 'Erro ao carregar aluno.')
          setLoading(false)
          return
        }
        setDados(data)
      } catch (e: any) {
        console.error(e)
        setError(e.message || 'Erro ao carregar aluno.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  async function promover(tipo: 'medium' | 'voluntario') {
    if (!id) return
    setPromovendo(true)
    setError(null)
    setActionMsg(null)

    try {
      if (tipo === 'medium') {
        const res = await fetch(
          `/api/curso/pretendentes/${id}/promover-medium`,
          { method: 'POST' },
        )
        const data = await res.json()
        if (!res.ok) {
          setError(data.error || 'Erro ao promover a médium.')
          setPromovendo(false)
          return
        }
        setActionMsg('Aluno promovido a médium. Redirecionando...')
        setTimeout(() => {
          router.push(`/erp/mediums/${data.mediumId}`)
        }, 800)
      } else {
        const res = await fetch(
          `/api/curso/pretendentes/${id}/promover-voluntario`,
          { method: 'POST' },
        )
        const data = await res.json()
        if (!res.ok) {
          setError(data.error || 'Erro ao promover a voluntário.')
          setPromovendo(false)
          return
        }
        setActionMsg('Aluno promovido a voluntário. Redirecionando...')
        setTimeout(() => {
          router.push(`/erp/voluntarios/${data.voluntarioId}`)
        }, 800)
      }
    } catch (e: any) {
      console.error(e)
      setError(e.message || 'Erro ao processar promoção.')
    } finally {
      setPromovendo(false)
    }
  }

  if (!id) {
    return (
      <div className="text-xs text-slate-400">
        ID de aluno inválido.
      </div>
    )
  }

  if (loading) {
    return (
      <div className="text-xs text-slate-400">
        Carregando ficha do aluno...
      </div>
    )
  }

  if (!dados) {
    return (
      <div className="text-xs text-red-400">
        Não foi possível carregar os dados do aluno.
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
            Ficha do aluno do Curso de Umbanda (pretendente à corrente).
          </p>
        </div>

        <div className="flex flex-col items-start md:items-end gap-2 text-xs text-slate-300">
          <button
            type="button"
            onClick={() => router.push('/erp/curso')}
            className="rounded-full border border-slate-700 px-3 py-1 text-[11px] text-slate-100 hover:bg-slate-800"
          >
            Voltar para lista de alunos
          </button>

          <div className="flex gap-2">
            <button
              type="button"
              disabled={promovendo}
              onClick={() => promover('medium')}
              className="rounded-full border border-emerald-600 bg-emerald-500/10 px-3 py-1 text-[11px] text-emerald-200 hover:bg-emerald-500/30 disabled:opacity-60"
            >
              Transformar em médium
            </button>
            <button
              type="button"
              disabled={promovendo}
              onClick={() => promover('voluntario')}
              className="rounded-full border border-sky-600 bg-sky-500/10 px-3 py-1 text-[11px] text-sky-200 hover:bg-sky-500/30 disabled:opacity-60"
            >
              Transformar em voluntário
            </button>
          </div>

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
              Dados pessoais
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
                  Nascimento:{' '}
                </span>
                {formatDate(dados.dataNascimento)}
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
                  Escolaridade:{' '}
                </span>
                {dados.escolaridade || '-'}
              </div>
              <div>
                <span className="font-semibold text-slate-200">
                  Profissão:{' '}
                </span>
                {dados.profissao || '-'}
              </div>
              <div>
                <span className="font-semibold text-slate-200">
                  Endereço:{' '}
                </span>
                {dados.endereco || '-'}
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
            <h2 className="text-sm font-semibold text-slate-100 mb-3">
              Observações iniciais
            </h2>
            <p className="text-xs text-slate-300">
              {dados.observacoes || '-'}
            </p>
          </div>
        </div>

        {/* Curso / Matrícula */}
        <div className="space-y-4 lg:col-span-2">
          <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
            <h2 className="text-sm font-semibold text-slate-100 mb-3">
              Matrículas em turmas do Curso de Umbanda
            </h2>
            {dados.matriculas.length === 0 ? (
              <p className="text-xs text-slate-400">
                Nenhuma matrícula registrada.
              </p>
            ) : (
              <div className="overflow-x-auto max-h-72 text-xs text-slate-300">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400">
                      <th className="text-left py-1 pr-2">ID Turma</th>
                      <th className="text-left py-1 pr-2">Início</th>
                      <th className="text-left py-1 pr-2">Status</th>
                      <th className="text-left py-1 pr-2">Etapa</th>
                      <th className="text-left py-1 pr-2">Resultado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dados.matriculas.map((m) => (
                      <tr
                        key={m.id}
                        className="border-b border-slate-800/50 last:border-0"
                      >
                        <td className="py-1 pr-2">{m.turmaId}</td>
                        <td className="py-1 pr-2">
                          {formatDate(m.dataInicio)}
                        </td>
                        <td className="py-1 pr-2">{m.statusCurso}</td>
                        <td className="py-1 pr-2">
                          {m.etapaParou || '-'}
                        </td>
                        <td className="py-1 pr-2">
                          {m.resultadoFinal || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
            <h2 className="text-sm font-semibold text-slate-100 mb-3">
              Voluntariado gerado a partir deste aluno
            </h2>
            {dados.voluntarios.length === 0 ? (
              <p className="text-xs text-slate-400">
                Nenhum voluntário criado a partir deste aluno.
              </p>
            ) : (
              <ul className="text-xs text-slate-300 space-y-1">
                {dados.voluntarios.map((v) => (
                  <li key={v.id}>
                    {v.codigo} – tipo: {v.tipo}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

