'use client'

import { useEffect, useState } from 'react'

type Gira = {
  id: number
  data: string
  tipo: string
  observacoes: string | null
  dirigenteId: number | null
  guiaChefeId: number | null
  dirigente?: {
    id: number
    nome: string
    codigo: string | null
    nivel: string
  } | null
  guiaChefe?: {
    id: number
    nome: string
    linha: string
  } | null
}

type Medium = {
  id: number
  nome: string
  nivel: string
  status: string
  codigo: string | null
}

type Guia = {
  id: number
  nome: string
  linha: string
  ativo: boolean
}

type Presenca = {
  mediumId: number
  status: string
  observacao?: string
}

const STATUS_PRESENCA = [
  { value: 'PRESENTE', label: 'Presente' },
  { value: 'FALTA', label: 'Falta' },
  { value: 'FALTA_JUSTIFICADA', label: 'Falta justificada' },
  { value: 'AFASTADO', label: 'Afastado' },
]

const TIPOS_GIRA = [
  'Caboclo',
  'Preto-Velho',
  'Exu',
  'Baianos',
  'Boiadeiros',
  'Marinheiros',
  'Crianças / Ibeji',
  'Desenvolvimento',
  'Amaci',
  'Iniciação',
  'Cura/Passe',
  'Externa-Praia',
  'Exter-Cachoeira',
  'Externa-Visita',
  'Externa-Sitio',
  'Atendimento especial',
]

const cardClass =
  'rounded-xl border border-[#E4E4E7] bg-white shadow-sm p-4'

export default function PresencasPage() {
  const [giras, setGiras] = useState<Gira[]>([])
  const [mediums, setMediums] = useState<Medium[]>([])
  const [guias, setGuias] = useState<Guia[]>([])
  const [selectedGiraId, setSelectedGiraId] = useState<number | null>(null)
  const [presencas, setPresencas] = useState<Record<number, Presenca>>({})
  const [loadingGiras, setLoadingGiras] = useState(true)
  const [loadingMediums, setLoadingMediums] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [novaGira, setNovaGira] = useState({
    data: '',
    tipo: '',
    dirigenteId: '',
    guiaChefeId: '',
    observacoes: '',
  })

  const dirigentesElegiveis = mediums.filter((m) =>
    [
      'NIVEL_6_PAI_MAE_PEQUENA',
      'NIVEL_7_DIRIGENTE_INTERNO',
      'NIVEL_8_DIRIGENTE_GERAL',
    ].includes(m.nivel),
  )

  async function loadGiras() {
    setLoadingGiras(true)
    try {
      const res = await fetch('/api/giras')
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erro ao carregar sessões.')
      setGiras(data)
      if (!selectedGiraId && data.length > 0) {
        setSelectedGiraId(data[0].id)
      }
    } catch (e: any) {
      console.error(e)
      setError(e.message || 'Erro ao carregar sessões.')
    } finally {
      setLoadingGiras(false)
    }
  }

  async function loadMediums() {
    setLoadingMediums(true)
    try {
      const res = await fetch('/api/mediums')
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erro ao carregar médiuns.')
      setMediums(data)
    } catch (e: any) {
      console.error(e)
      setError(e.message || 'Erro ao carregar médiuns.')
    } finally {
      setLoadingMediums(false)
    }
  }

  async function loadGuias() {
    try {
      const res = await fetch('/api/guias')
      const data = await res.json()
      if (!res.ok) return
      setGuias(data.filter((g: any) => g.ativo !== false))
    } catch (e) {
      console.error(e)
    }
  }

  async function loadPresencas(giraId: number) {
    try {
      const res = await fetch(`/api/giras/${giraId}/presencas`)
      if (!res.ok) {
        setPresencas({})
        return
      }
      const data = await res.json()
      const mapa: Record<number, Presenca> = {}
      data.forEach(
        (p: { mediumId: number; status: string; observacao: string | null }) => {
          mapa[p.mediumId] = {
            mediumId: p.mediumId,
            status: p.status,
            observacao: p.observacao || undefined,
          }
        },
      )
      setPresencas(mapa)
    } catch (e) {
      console.error(e)
      setPresencas({})
    }
  }

  useEffect(() => {
    loadGiras()
    loadMediums()
    loadGuias()
  }, [])

  useEffect(() => {
    if (selectedGiraId) loadPresencas(selectedGiraId)
  }, [selectedGiraId])

  async function handleNovaGira(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!novaGira.data || !novaGira.tipo) {
      setError('Data e tipo da sessão são obrigatórios.')
      return
    }

    try {
      const res = await fetch('/api/giras', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: novaGira.data,
          tipo: novaGira.tipo,
          observacoes: novaGira.observacoes || null,
          dirigenteId: novaGira.dirigenteId
            ? Number(novaGira.dirigenteId)
            : null,
          guiaChefeId: novaGira.guiaChefeId
            ? Number(novaGira.guiaChefeId)
            : null,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Erro ao criar sessão.')
        return
      }

      setNovaGira({
        data: '',
        tipo: '',
        dirigenteId: '',
        guiaChefeId: '',
        observacoes: '',
      })

      await loadGiras()
      setSelectedGiraId(data.id)
    } catch (e: any) {
      console.error(e)
      setError(e.message || 'Erro ao criar sessão.')
    }
  }

  function setStatus(mediumId: number, status: string) {
    setPresencas((prev) => ({
      ...prev,
      [mediumId]: {
        mediumId,
        status,
        observacao: prev[mediumId]?.observacao,
      },
    }))
  }

  async function salvarPresencas() {
    if (!selectedGiraId) return
    setSaving(true)
    setError(null)

    try {
      const res = await fetch(`/api/giras/${selectedGiraId}/presencas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          presencas: Object.values(presencas),
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Erro ao salvar presenças.')
      }
    } catch (e: any) {
      console.error(e)
      setError(e.message || 'Erro ao salvar presenças.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDeleteSessao(id: number) {
    const sessao = giras.find((g) => g.id === id)
    const label = sessao
      ? `${new Date(sessao.data).toLocaleDateString('pt-BR')} – ${
          sessao.tipo
        }`
      : `Sessão ID ${id}`

    if (
      !window.confirm(
        `Tem certeza que deseja deletar a sessão ${label}?\nEla será removida da lista, mas continuará contabilizando as presenças para estatísticas.`,
      )
    ) {
      return
    }

    try {
      const res = await fetch(`/api/giras/${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Erro ao deletar sessão.')
        return
      }

      const novas = giras.filter((g) => g.id !== id)
      setGiras(novas)

      if (selectedGiraId === id) {
        if (novas.length > 0) {
          setSelectedGiraId(novas[0].id)
          loadPresencas(novas[0].id)
        } else {
          setSelectedGiraId(null)
          setPresencas({})
        }
      }
    } catch (e: any) {
      console.error(e)
      setError(e.message || 'Erro ao deletar sessão.')
    }
  }

  const giraSelecionada =
    giras.find((g) => g.id === selectedGiraId) || null

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className={cardClass}>
        <h2 className="text-xl font-semibold text-slate-900">
          Sessões & Presenças
        </h2>
        <p className="text-sm text-slate-500 mt-1 max-w-3xl">
          Crie sessões (giras), defina dirigente espiritual e guia chefe, e
          registre as presenças dos médiuns.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[320px,minmax(0,1fr)]">
        {/* COLUNA ESQUERDA: nova sessão + lista */}
        <div className="space-y-4">
          {/* Nova sessão */}
          <div className={cardClass}>
            <h3 className="text-sm font-semibold text-slate-900 mb-3">
              Nova sessão
            </h3>

            <form
              onSubmit={handleNovaGira}
              className="space-y-3 text-xs text-slate-700"
            >
              <div>
                <label className="block text-[11px] mb-1 text-slate-500">
                  Data *
                </label>
                <input
                  type="date"
                  value={novaGira.data}
                  onChange={(e) =>
                    setNovaGira((prev) => ({
                      ...prev,
                      data: e.target.value,
                    }))
                  }
                  className="w-full rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-slate-900"
                />
              </div>

              <div>
                <label className="block text-[11px] mb-1 text-slate-500">
                  Tipo de sessão *
                </label>
                <select
                  value={novaGira.tipo}
                  onChange={(e) =>
                    setNovaGira((prev) => ({
                      ...prev,
                      tipo: e.target.value,
                    }))
                  }
                  className="w-full rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-slate-900"
                >
                  <option value="">Selecione...</option>
                  {TIPOS_GIRA.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] mb-1 text-slate-500">
                  Dirigente da sessão
                </label>
                <select
                  value={novaGira.dirigenteId}
                  onChange={(e) =>
                    setNovaGira((prev) => ({
                      ...prev,
                      dirigenteId: e.target.value,
                    }))
                  }
                  className="w-full rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-slate-900"
                >
                  <option value="">(Opcional)</option>
                  {dirigentesElegiveis.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.codigo ? `${m.codigo} – ` : ''}
                      {m.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] mb-1 text-slate-500">
                  Guia chefe da sessão
                </label>
                <select
                  value={novaGira.guiaChefeId}
                  onChange={(e) =>
                    setNovaGira((prev) => ({
                      ...prev,
                      guiaChefeId: e.target.value,
                    }))
                  }
                  className="w-full rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-slate-900"
                >
                  <option value="">(Opcional)</option>
                  {guias.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.nome} ({g.linha})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] mb-1 text-slate-500">
                  Observações
                </label>
                <textarea
                  rows={2}
                  value={novaGira.observacoes}
                  onChange={(e) =>
                    setNovaGira((prev) => ({
                      ...prev,
                      observacoes: e.target.value,
                    }))
                  }
                  className="w-full rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-slate-900 resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-lg bg-emerald-500 text-emerald-950 font-semibold py-1.5 text-xs hover:brightness-110"
              >
                Criar sessão
              </button>

              {error && (
                <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mt-2">
                  {error}
                </div>
              )}
            </form>
          </div>

          {/* Lista de sessões */}
          <div className={cardClass}>
            <h3 className="text-sm font-semibold text-slate-900 mb-3">
              Sessões recentes
            </h3>

            {loadingGiras ? (
              <p className="text-xs text-slate-500">Carregando...</p>
            ) : giras.length === 0 ? (
              <p className="text-xs text-slate-500">
                Nenhuma sessão cadastrada ainda.
              </p>
            ) : (
              <ul className="space-y-1 text-xs text-slate-700">
                {giras.map((g) => (
                  <li key={g.id}>
                    <div
                      className={`w-full rounded-lg border px-2 py-1.5 ${
                        selectedGiraId === g.id
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-900'
                          : 'border-slate-200 bg-slate-50'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedGiraId(g.id)}
                          className="flex-1 text-left"
                        >
                          <div className="font-medium">
                            {new Date(g.data).toLocaleDateString(
                              'pt-BR',
                            )}{' '}
                            – {g.tipo}
                          </div>

                          {g.dirigente && (
                            <div className="text-[11px] text-slate-500">
                              Dirigente:{' '}
                              {g.dirigente.codigo
                                ? `${g.dirigente.codigo} – `
                                : ''}
                              {g.dirigente.nome}
                            </div>
                          )}

                          {g.guiaChefe && (
                            <div className="text-[11px] text-slate-500">
                              Guia chefe: {g.guiaChefe.nome} (
                              {g.guiaChefe.linha})
                            </div>
                          )}
                        </button>

                        <div className="flex flex-col gap-1">
                          <a
                            href={`/erp/sessoes/${g.id}`}
                            className="rounded-full border border-slate-300 bg-white px-2 py-1 text-[10px] text-slate-700 hover:bg-slate-100 text-center"
                          >
                            Ver sessão
                          </a>
                          <button
                            type="button"
                            onClick={() => handleDeleteSessao(g.id)}
                            className="rounded-full border border-red-300 bg-red-50 px-2 py-1 text-[10px] text-red-700 hover:bg-red-100 text-center"
                          >
                            Deletar sessão
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* COLUNA DIREITA: Presenças */}
        <div className={cardClass}>
          {selectedGiraId && giraSelecionada ? (
            <>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">
                    Presenças –{' '}
                    {new Date(
                      giraSelecionada.data,
                    ).toLocaleDateString('pt-BR')}{' '}
                    • {giraSelecionada.tipo}
                  </h3>
                  {giraSelecionada.dirigente && (
                    <p className="text-[11px] text-slate-500">
                      Dirigente:{' '}
                      {giraSelecionada.dirigente.codigo
                        ? `${giraSelecionada.dirigente.codigo} – `
                        : ''}
                      {giraSelecionada.dirigente.nome}
                    </p>
                  )}
                  {giraSelecionada.guiaChefe && (
                    <p className="text-[11px] text-slate-500">
                      Guia chefe: {giraSelecionada.guiaChefe.nome} (
                      {giraSelecionada.guiaChefe.linha})
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={salvarPresencas}
                  disabled={saving || loadingMediums}
                  className="rounded-lg bg-emerald-500 text-emerald-950 font-semibold px-3 py-1.5 text-xs hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {saving ? 'Salvando...' : 'Salvar presenças'}
                </button>
              </div>

              {loadingMediums ? (
                <p className="text-xs text-slate-500">
                  Carregando médiuns...
                </p>
              ) : mediums.length === 0 ? (
                <p className="text-xs text-slate-500">
                  Nenhum médium cadastrado. Cadastre em &quot;Médiuns&quot;.
                </p>
              ) : (
                <div className="overflow-x-auto max-h-[480px]">
                  <table className="min-w-full text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-500">
                        <th className="text-left py-2 pr-3">Médium</th>
                        <th className="text-left py-2 pr-3">Nível</th>
                        <th className="text-left py-2 pr-3">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mediums.map((m) => {
                        const pres = presencas[m.id]
                        return (
                          <tr
                            key={m.id}
                            className="border-b border-slate-100 last:border-0"
                          >
                            <td className="py-1.5 pr-3 text-slate-900">
                              {m.codigo
                                ? `${m.codigo} – ${m.nome}`
                                : m.nome}
                            </td>
                            <td className="py-1.5 pr-3 text-slate-600">
                              {m.nivel}
                            </td>
                            <td className="py-1.5 pr-3 text-slate-600">
                              <select
                                className="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500"
                                value={pres?.status || ''}
                                onChange={(e) =>
                                  setStatus(m.id, e.target.value)
                                }
                              >
                                <option value="">(não marcado)</option>
                                {STATUS_PRESENCA.map((s) => (
                                  <option key={s.value} value={s.value}>
                                    {s.label}
                                  </option>
                                ))}
                              </select>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          ) : (
            <p className="text-xs text-slate-500">
              Selecione ou crie uma sessão na coluna à esquerda para lançar as
              presenças dos médiuns.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

