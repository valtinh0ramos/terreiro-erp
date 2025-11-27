'use client'

import { useEffect, useState } from 'react'

type MediumPresencaResumo = {
  mediumId: number
  nome: string
  codigo: string | null
  totalSessoes: number
  totalPresencas: number
  totalFaltas: number
}

function calcFaixa(totalSessoes: number, faltas: number) {
  if (totalSessoes < 10) return 'nenhuma' as const
  const proporcao = faltas / totalSessoes
  if (proporcao >= 0.5) return '50' as const
  if (proporcao >= 0.25) return '25' as const
  return 'nenhuma' as const
}

export default function PresencasPorMediumPage() {
  const [resumos, setResumos] = useState<MediumPresencaResumo[]>([])
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch('/api/mediums/presencas-resumo')
        const data = await res.json()
        if (!res.ok) {
          setError(data.error || 'Erro ao carregar presenças.')
          setLoading(false)
          return
        }
        setResumos(data)
        if (data.length > 0) {
          setSelectedId(data[0].mediumId)
        }
      } catch (e: any) {
        console.error(e)
        setError(e.message || 'Erro ao carregar presenças.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const selecionado = resumos.find((r) => r.mediumId === selectedId) || null

  let faixa: 'nenhuma' | '25' | '50' = 'nenhuma'
  if (selecionado) {
    faixa = calcFaixa(
      selecionado.totalSessoes,
      selecionado.totalFaltas,
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-50">
          Presenças dos médiuns
        </h2>
        <p className="text-sm text-slate-400 mt-1 max-w-3xl">
          Selecione um médium para ver o total de sessões, presenças e faltas.
          As faixas de atenção aparecem a partir de 10 sessões registradas.
        </p>
      </div>

      {error && (
        <div className="text-xs text-red-400 bg-red-950/40 border border-red-800 rounded-lg px-3 py-2">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-xs text-slate-400">Carregando dados...</p>
      ) : resumos.length === 0 ? (
        <p className="text-xs text-slate-400">
          Nenhum registro de presenças encontrado.
        </p>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[260px,minmax(0,1fr)]">
          {/* Dropdown de médiuns */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
            <h3 className="text-sm font-semibold text-slate-100 mb-3">
              Selecionar médium
            </h3>
            <select
              value={selectedId ?? ''}
              onChange={(e) =>
                setSelectedId(
                  e.target.value ? Number(e.target.value) : null,
                )
              }
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-slate-50"
            >
              {resumos.map((r) => (
                <option key={r.mediumId} value={r.mediumId}>
                  {r.codigo ? `${r.codigo} – ${r.nome}` : r.nome}
                </option>
              ))}
            </select>

            {selecionado && faixa === '25' && (
              <div className="mt-3 rounded-md border border-yellow-400 bg-yellow-500/10 px-3 py-2 text-[11px] text-yellow-200">
                Atenção - Médium com 25% de faltas.
              </div>
            )}
            {selecionado && faixa === '50' && (
              <div className="mt-3 rounded-md border border-red-500 bg-red-500/10 px-3 py-2 text-[11px] text-red-200">
                Atenção - Médium com 50% de faltas.
              </div>
            )}
          </div>

          {/* Resumo do médium selecionado */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
            {selecionado ? (
              <div className="space-y-3 text-xs text-slate-300">
                <div>
                  <h3 className="text-sm font-semibold text-slate-100 mb-1">
                    Resumo de presenças
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {selecionado.codigo
                      ? `${selecionado.codigo} – ${selecionado.nome}`
                      : selecionado.nome}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg border border-slate-800 bg-slate-900/80 p-3">
                    <div className="text-[11px] text-slate-400">
                      Sessões consideradas
                    </div>
                    <div className="text-lg font-semibold text-slate-50">
                      {selecionado.totalSessoes}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-1">
                      (exclui registros com status &quot;Afastado&quot;)
                    </div>
                  </div>

                  <div className="rounded-lg border border-slate-800 bg-slate-900/80 p-3">
                    <div className="text-[11px] text-slate-400">
                      Presenças
                    </div>
                    <div className="text-lg font-semibold text-emerald-400">
                      {selecionado.totalPresencas}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1">
                      Faltas (inclui justificadas):{' '}
                      <span className="text-red-300">
                        {selecionado.totalFaltas}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border border-slate-800 bg-slate-900/80 p-3">
                  <div className="text-[11px] text-slate-400 mb-1">
                    % de faltas (a partir de 10 sessões)
                  </div>
                  {selecionado.totalSessoes < 10 ? (
                    <div className="text-[11px] text-slate-500">
                      Ainda não há 10 sessões registradas para este médium.
                    </div>
                  ) : (
                    (() => {
                      const proporcao =
                        selecionado.totalSessoes > 0
                          ? (selecionado.totalFaltas /
                              selecionado.totalSessoes) *
                            100
                          : 0
                      return (
                        <div className="flex items-center gap-3">
                          <div className="text-lg font-semibold text-slate-50">
                            {proporcao.toFixed(0)}%
                          </div>
                          <div className="flex-1 h-2 rounded-full bg-slate-800 overflow-hidden">
                            <div
                              className={`h-full ${
                                faixa === '50'
                                  ? 'bg-red-500'
                                  : faixa === '25'
                                  ? 'bg-yellow-400'
                                  : 'bg-emerald-500'
                              }`}
                              style={{
                                width: `${Math.min(
                                  100,
                                  Math.max(0, proporcao),
                                )}%`,
                              }}
                            />
                          </div>
                        </div>
                      )
                    })()
                  )}
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400">
                Selecione um médium à esquerda para ver o resumo.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

