'use client'

import { useEffect, useState } from 'react'

type Medium = {
  id: number
  nome: string
  codigo: string | null
}

type Guia = {
  id: number
  nome: string
  linha: string
  ativo: boolean
  observacoes: string | null
  medium?: {
    id: number
    nome: string
    codigo: string | null
  } | null
}

type GuiaForm = {
  nome: string
  linha: string
  mediumId: string
  observacoes: string
}

const LINHAS_TRABALHO = [
  { value: 'CABOCLO', label: 'Caboclo(a)' },
  { value: 'PRETO_VELHO', label: 'Preto(a)-Velho(a)' },
  { value: 'BAIANO', label: 'Baiano(a)' },
  { value: 'BOIADEIRO', label: 'Boiadeiro' },
  { value: 'MARINHEIRO', label: 'Marinheiro' },
  { value: 'IBEJI', label: 'Ibeji' },
  { value: 'CIGANO', label: 'Cigano(a)' },
  { value: 'EXU', label: 'Exu' },
  { value: 'POMBAGIRA', label: 'Pombagira' },
  { value: 'MALANDRO', label: 'Malandro(a)' },
  { value: 'EXU_MIRIM', label: 'Exu Mirim' },
  { value: 'MEDICO', label: 'Médico(a)' },
  { value: 'MESTRE_ORIENTE', label: 'Mestre Oriente' },
]

export default function GuiasPage() {
  const [mediums, setMediums] = useState<Medium[]>([])
  const [guias, setGuias] = useState<Guia[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const [form, setForm] = useState<GuiaForm>({
    nome: '',
    linha: 'CABOCLO',
    mediumId: '',
    observacoes: '',
  })

  async function loadMediums() {
    try {
      const res = await fetch('/api/mediums')
      const data = await res.json()
      if (res.ok) {
        setMediums(data)
        if (!form.mediumId && data.length > 0) {
          setForm((prev) => ({ ...prev, mediumId: String(data[0].id) }))
        }
      }
    } catch (e) {
      console.error(e)
    }
  }

  async function loadGuias() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/guias')
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Erro ao carregar guias.')
        setLoading(false)
        return
      }
      setGuias(data)
    } catch (e: any) {
      console.error(e)
      setError(e.message || 'Erro ao carregar guias.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadMediums()
    loadGuias()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.nome.trim()) {
      setError('Nome do guia é obrigatório.')
      return
    }

    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      const payload = {
        nome: form.nome,
        linha: form.linha,
        mediumId: form.mediumId ? Number(form.mediumId) : undefined,
        observacoes: form.observacoes || undefined,
      }

      const res = await fetch('/api/guias', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Erro ao cadastrar guia.')
        setSaving(false)
        return
      }

      setSuccess('Guia cadastrado com sucesso.')
      setForm((prev) => ({
        ...prev,
        nome: '',
        observacoes: '',
      }))
      await loadGuias()
    } catch (e: any) {
      console.error(e)
      setError(e.message || 'Erro ao cadastrar guia.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: number) {
    const guia = guias.find((g) => g.id === id)
    const label = guia ? `${guia.nome} (${guia.linha})` : `ID ${id}`

    if (
      !window.confirm(
        `Tem certeza que deseja deletar o guia ${label}?\nSe ele estiver associado a sessões, a operação poderá falhar.`,
      )
    ) {
      return
    }

    setError(null)
    setSuccess(null)

    try {
      const res = await fetch(`/api/guias/${id}`, {
        method: 'DELETE',
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Não foi possível deletar o guia.')
        return
      }
      setGuias((prev) => prev.filter((g) => g.id !== id))
      setSuccess('Guia removido com sucesso.')
    } catch (e: any) {
      console.error(e)
      setError(e.message || 'Erro ao deletar guia.')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-50">
          Guias espirituais da Casa
        </h2>
        <p className="text-sm text-slate-400 mt-1 max-w-3xl">
          Cadastre os guias espirituais que trabalham na casa, associe-os aos
          médiuns e organize por linha de trabalho. Essas informações são usadas
          ao lançar sessões para escolher o Guia Chefe.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[360px,minmax(0,1fr)]">
        {/* FORMULÁRIO */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
          <h3 className="text-sm font-semibold text-slate-100 mb-3">
            Novo guia
          </h3>

          <form onSubmit={handleSubmit} className="space-y-3 text-xs">
            <div>
              <label className="block text-[11px] text-slate-300 mb-1">
                Nome do guia *
              </label>
              <input
                type="text"
                value={form.nome}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, nome: e.target.value }))
                }
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-50"
              />
            </div>

            <div>
              <label className="block text-[11px] text-slate-300 mb-1">
                Linha de trabalho *
              </label>
              <select
                value={form.linha}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, linha: e.target.value }))
                }
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-50"
              >
                {LINHAS_TRABALHO.map((l) => (
                  <option key={l.value} value={l.value}>
                    {l.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] text-slate-300 mb-1">
                Associar a médium (opcional)
              </label>
              <select
                value={form.mediumId}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, mediumId: e.target.value }))
                }
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-50"
              >
                <option value="">(Sem vínculo fixo)</option>
                {mediums.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.codigo ? `${m.codigo} – ` : ''}
                    {m.nome}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] text-slate-300 mb-1">
                Observações
              </label>
              <textarea
                rows={3}
                value={form.observacoes}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, observacoes: e.target.value }))
                }
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-50 resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-lg bg-emerald-500 text-emerald-950 font-semibold py-1.5 text-xs hover:brightness-110 disabled:opacity-60"
            >
              {saving ? 'Salvando...' : 'Cadastrar guia'}
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

        {/* LISTA DE GUIAS */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
          <h3 className="text-sm font-semibold text-slate-100 mb-3">
            Guias cadastrados
          </h3>

          {loading ? (
            <p className="text-xs text-slate-400">Carregando...</p>
          ) : guias.length === 0 ? (
            <p className="text-xs text-slate-400">
              Nenhum guia cadastrado ainda.
            </p>
          ) : (
            <div className="overflow-x-auto max-h-[480px] text-xs">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="text-left py-2 pr-3">Nome</th>
                    <th className="text-left py-2 pr-3">Linha</th>
                    <th className="text-left py-2 pr-3">Médium</th>
                    <th className="text-left py-2 pr-3">Ativo</th>
                    <th className="text-left py-2 pr-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {guias.map((g) => (
                    <tr
                      key={g.id}
                      className="border-b border-slate-800/60 last:border-0"
                    >
                      <td className="py-1.5 pr-3 text-slate-50">{g.nome}</td>
                      <td className="py-1.5 pr-3 text-slate-300">
                        {
                          LINHAS_TRABALHO.find((l) => l.value === g.linha)
                            ?.label
                        }
                      </td>
                      <td className="py-1.5 pr-3 text-slate-300">
                        {g.medium
                          ? g.medium.codigo
                            ? `${g.medium.codigo} – ${g.medium.nome}`
                            : g.medium.nome
                          : '-'}
                      </td>
                      <td className="py-1.5 pr-3 text-slate-300">
                        {g.ativo ? 'Sim' : 'Não'}
                      </td>
                      <td className="py-1.5 pr-3 text-right">
                        <button
                          type="button"
                          onClick={() => handleDelete(g.id)}
                          className="rounded-full border border-red-700 bg-red-900/30 px-3 py-1 text-[10px] text-red-300 hover:bg-red-900/60"
                        >
                          Deletar
                        </button>
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

