'use client'

import { useEffect, useState } from 'react'

type Medium = {
  id: number
  nome: string
  nivel: string
  status: string
}

type MedidaDisciplina = {
  id: number
  mediumId: number
  tipo: 'ADVERTENCIA' | 'SUSPENSAO' | 'EXPULSAO'
  motivo: string
  dataCriacao: string
  dataInicio: string | null
  dataFim: string | null
  status: 'ATIVA' | 'ENCERRADA'
  geradaAutomaticamente: boolean
}

const TIPOS_MEDIDA = [
  { value: 'ADVERTENCIA', label: 'Advertência' },
  { value: 'SUSPENSAO', label: 'Suspensão' },
  { value: 'EXPULSAO', label: 'Expulsão' },
]

export default function DisciplinaPage() {
  const [mediums, setMediums] = useState<Medium[]>([])
  const [selectedMediumId, setSelectedMediumId] = useState<number | null>(null)
  const [medidas, setMedidas] = useState<MedidaDisciplina[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const [form, setForm] = useState({
    tipo: 'ADVERTENCIA',
    motivo: '',
    diasSuspensao: 30,
  })

  /* ---------------------- CARREGAR MÉDIUNS ---------------------- */
  async function loadMediums() {
    try {
      const res = await fetch('/api/mediums')
      if (!res.ok) throw new Error('Erro ao carregar médiuns.')
      const data = await res.json()
      setMediums(data)
      if (data.length > 0 && !selectedMediumId) {
        setSelectedMediumId(data[0].id)
      }
    } catch (e: any) {
      console.error(e)
      setError(e.message)
    }
  }

  /* ---------------------- CARREGAR MEDIDAS ---------------------- */
  async function loadMedidas(mediumId: number) {
    setLoading(true)
    setError(null)
    setSuccess(null)
    try {
      const res = await fetch(`/api/disciplina?mediumId=${mediumId}`)
      if (!res.ok) throw new Error('Erro ao carregar disciplina.')
      const data = await res.json()
      setMedidas(data)
    } catch (e: any) {
      console.error(e)
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadMediums()
  }, [])

  useEffect(() => {
    if (selectedMediumId) loadMedidas(selectedMediumId)
  }, [selectedMediumId])

  /* ---------------------- SUBMETER NOVA MEDIDA ---------------------- */
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedMediumId) return

    if (!form.motivo.trim()) {
      setError('Motivo é obrigatório.')
      setSuccess(null)
      return
    }

    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      const res = await fetch('/api/disciplina', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mediumId: selectedMediumId,
          tipo: form.tipo,
          motivo: form.motivo,
          diasSuspensao:
            form.tipo === 'SUSPENSAO' ? form.diasSuspensao : undefined,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Erro ao registrar medida.')
        return
      }

      setForm((prev) => ({
        ...prev,
        motivo: '',
      }))

      setSuccess('Medida disciplinar registrada com sucesso.')
      await loadMedidas(selectedMediumId)
    } catch (e: any) {
      console.error(e)
      setError(e.message || 'Erro ao registrar medida.')
    } finally {
      setSaving(false)
    }
  }

  function tipoLabel(tipo: string) {
    switch (tipo) {
      case 'ADVERTENCIA':
        return 'Advertência'
      case 'SUSPENSAO':
        return 'Suspensão'
      case 'EXPULSAO':
        return 'Expulsão'
      default:
        return tipo
    }
  }

  function statusLabel(status: string) {
    switch (status) {
      case 'ATIVA':
        return 'Ativa'
      case 'ENCERRADA':
        return 'Encerrada'
      default:
        return status
    }
  }

  function mediumAtual() {
    return mediums.find((m) => m.id === selectedMediumId) || null
  }

  const mAtual = mediumAtual()

  /* ---------------------- RENDER ---------------------- */
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-50">
          Disciplina – Advertências, Suspensões e Expulsões
        </h2>
        <p className="text-sm text-slate-400 mt-1 max-w-3xl">
          Registre e acompanhe medidas disciplinares da casa. O sistema aplica
          automaticamente regras como: 3 advertências geram suspensão de 30 dias,
          2 suspensões geram expulsão e desligamento.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[260px,minmax(0,1fr)]">
        {/* ---------------------- COLUNA ESQUERDA: MÉDIUNS ---------------------- */}
        <div className="space-y-4">
          <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
            <h3 className="text-sm font-semibold text-slate-100 mb-3">
              Selecionar médium
            </h3>
            {mediums.length === 0 ? (
              <p className="text-xs text-slate-400">
                Nenhum médium cadastrado.
              </p>
            ) : (
              <select
                value={selectedMediumId ?? ''}
                onChange={(e) =>
                  setSelectedMediumId(
                    e.target.value ? Number(e.target.value) : null,
                  )
                }
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-2 py-1.5 text-xs text-slate-50"
              >
                {mediums.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.nome} – {m.nivel} ({m.status})
                  </option>
                ))}
              </select>
            )}

            {mAtual && (
              <div className="mt-3 text-[11px] text-slate-400 space-y-1">
                <div>
                  <span className="font-semibold text-slate-200">
                    Nível:{' '}
                  </span>
                  {mAtual.nivel}
                </div>
                <div>
                  <span className="font-semibold text-slate-200">
                    Status:{' '}
                  </span>
                  {mAtual.status}
                </div>
              </div>
            )}
          </div>

          {/* FORM DE NOVA MEDIDA */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
            <h3 className="text-sm font-semibold text-slate-100 mb-3">
              Registrar nova medida
            </h3>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] text-slate-300 mb-1">
                  Tipo de medida *
                </label>
                <select
                  value={form.tipo}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      tipo: e.target.value,
                    }))
                  }
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-2 py-1.5 text-slate-50"
                >
                  {TIPOS_MEDIDA.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>

              {form.tipo === 'SUSPENSAO' && (
                <div>
                  <label className="block text-[11px] text-slate-300 mb-1">
                    Duração (dias)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={form.diasSuspensao}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        diasSuspensao: Number(e.target.value || 30),
                      }))
                    }
                    className="w-full rounded-lg border border-slate-700 bg-slate-900 px-2 py-1.5 text-slate-50"
                  />
                </div>
              )}

              <div>
                <label className="block text-[11px] text-slate-300 mb-1">
                  Motivo *
                </label>
                <textarea
                  rows={3}
                  value={form.motivo}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      motivo: e.target.value,
                    }))
                  }
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-2 py-1.5 text-slate-50"
                />
              </div>

              <button
                type="submit"
                disabled={saving || !selectedMediumId}
                className="w-full rounded-lg bg-emerald-500 text-emerald-950 font-semibold py-1.5 disabled:opacity-60"
              >
                {saving ? 'Salvando...' : 'Registrar medida'}
              </button>

              {error && (
                <div className="mt-2 text-xs text-red-400 bg-red-950/40 border border-red-800 rounded-lg px-3 py-2">
                  {error}
                </div>
              )}

              {success && (
                <div className="mt-2 text-xs text-emerald-400 bg-emerald-950/40 border border-emerald-800 rounded-lg px-3 py-2">
                  {success}
                </div>
              )}
            </form>
          </div>
        </div>

        {/* ---------------------- COLUNA DIREITA: HISTÓRICO ---------------------- */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
          <h3 className="text-sm font-semibold text-slate-100 mb-3">
            Histórico de disciplina
          </h3>

          {!selectedMediumId ? (
            <p className="text-xs text-slate-400">
              Selecione um médium para ver o histórico.
            </p>
          ) : loading ? (
            <p className="text-xs text-slate-400">Carregando...</p>
          ) : medidas.length === 0 ? (
            <p className="text-xs text-slate-400">
              Nenhuma medida disciplinar registrada para este médium.
            </p>
          ) : (
            <div className="overflow-x-auto max-h-[480px]">
              <table className="min-w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="text-left py-2 pr-3">Data</th>
                    <th className="text-left py-2 pr-3">Tipo</th>
                    <th className="text-left py-2 pr-3">Período</th>
                    <th className="text-left py-2 pr-3">Status</th>
                    <th className="text-left py-2 pr-3">Origem</th>
                    <th className="text-left py-2 pr-3">Motivo</th>
                  </tr>
                </thead>
                <tbody>
                  {medidas.map((m) => (
                    <tr
                      key={m.id}
                      className="border-b border-slate-800/60 last:border-0"
                    >
                      <td className="py-1.5 pr-3 text-slate-200">
                        {new Date(m.dataCriacao).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="py-1.5 pr-3 text-slate-100">
                        {tipoLabel(m.tipo)}
                      </td>
                      <td className="py-1.5 pr-3 text-slate-300">
                        {m.tipo === 'SUSPENSAO' && m.dataInicio && m.dataFim
                          ? `${new Date(
                              m.dataInicio,
                            ).toLocaleDateString(
                              'pt-BR',
                            )} → ${new Date(
                              m.dataFim,
                            ).toLocaleDateString('pt-BR')}`
                          : '-'}
                      </td>
                      <td className="py-1.5 pr-3 text-slate-300">
                        {statusLabel(m.status)}
                      </td>
                      <td className="py-1.5 pr-3 text-slate-300">
                        {m.geradaAutomaticamente ? 'Automática' : 'Manual'}
                      </td>
                      <td className="py-1.5 pr-3 text-slate-300 max-w-xs">
                        <span className="line-clamp-2">{m.motivo}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

