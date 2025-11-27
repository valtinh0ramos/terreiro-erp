'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'

type Medium = {
  id: number
  nome: string
  codigo: string | null
  nivel: string
  status: string
}

type Guia = {
  id: number
  nome: string
  linha: string
  ativo: boolean
}

type GiraView = {
  id: number
  data: string
  tipo: string
  observacoes: string | null
  dirigenteId: number | null
  guiaChefeId: number | null
  horarioInicio: string | null
  horarioFim: string | null
  ata: string | null
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

const cardClass =
  'rounded-xl border border-[#E4E4E7] bg-white shadow-sm p-4'

function formatDateForInput(date: string | null) {
  if (!date) return ''
  const d = new Date(date)
  if (Number.isNaN(d.getTime())) return ''
  return d.toISOString().slice(0, 10)
}

function formatTimeForInput(date: string | null) {
  if (!date) return ''
  const d = new Date(date)
  if (Number.isNaN(d.getTime())) return ''
  return d.toTimeString().slice(0, 5)
}

export default function SessaoFichaPage() {
  const params = useParams()
  const id = params?.id as string

  const [dados, setDados] = useState<GiraView | null>(null)
  const [mediums, setMediums] = useState<Medium[]>([])
  const [guias, setGuias] = useState<Guia[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const [form, setForm] = useState({
    data: '',
    tipo: '',
    dirigenteId: '',
    guiaChefeId: '',
    horarioInicio: '',
    horarioFim: '',
    observacoes: '',
    ata: '',
  })

  const dirigentesElegiveis = mediums.filter((m) =>
    [
      'NIVEL_6_PAI_MAE_PEQUENA',
      'NIVEL_7_DIRIGENTE_INTERNO',
      'NIVEL_8_DIRIGENTE_GERAL',
    ].includes(m.nivel),
  )

  useEffect(() => {
    async function loadAll() {
      if (!id) return
      setLoading(true)
      setError(null)
      setSuccess(null)

      try {
        const [resSessao, resMediums, resGuias] = await Promise.all([
          fetch(`/api/giras/${id}`),
          fetch('/api/mediums'),
          fetch('/api/guias'),
        ])

        const sessaoData = await resSessao.json()
        const mediumsData = await resMediums.json()
        const guiasData = await resGuias.json()

        if (!resSessao.ok) {
          setError(sessaoData.error || 'Erro ao carregar sessão.')
          setLoading(false)
          return
        }

        setDados(sessaoData)
        setMediums(mediumsData)
        setGuias(guiasData.filter((g: any) => g.ativo !== false))

        setForm({
          data: formatDateForInput(sessaoData.data),
          tipo: sessaoData.tipo || '',
          dirigenteId: sessaoData.dirigenteId
            ? String(sessaoData.dirigenteId)
            : '',
          guiaChefeId: sessaoData.guiaChefeId
            ? String(sessaoData.guiaChefeId)
            : '',
          horarioInicio: formatTimeForInput(sessaoData.horarioInicio),
          horarioFim: formatTimeForInput(sessaoData.horarioFim),
          observacoes: sessaoData.observacoes || '',
          ata: sessaoData.ata || '',
        })
      } catch (e: any) {
        console.error(e)
        setError(e.message || 'Erro ao carregar dados da sessão.')
      } finally {
        setLoading(false)
      }
    }

    loadAll()
  }, [id])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!id) return
    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      const body: any = {
        tipo: form.tipo || null,
        observacoes: form.observacoes || null,
        dirigenteId: form.dirigenteId
          ? Number(form.dirigenteId)
          : null,
        guiaChefeId: form.guiaChefeId
          ? Number(form.guiaChefeId)
          : null,
        ata: form.ata || null,
      }

      if (form.data) body.data = form.data

      if (form.horarioInicio && form.data) {
        body.horarioInicio = new Date(
          `${form.data}T${form.horarioInicio}:00`,
        )
      } else {
        body.horarioInicio = null
      }

      if (form.horarioFim && form.data) {
        body.horarioFim = new Date(
          `${form.data}T${form.horarioFim}:00`,
        )
      } else {
        body.horarioFim = null
      }

      const res = await fetch(`/api/giras/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Erro ao salvar sessão.')
        setSaving(false)
        return
      }

      setSuccess('Sessão atualizada com sucesso.')
      setDados(data)
    } catch (e: any) {
      console.error(e)
      setError(e.message || 'Erro ao salvar sessão.')
    } finally {
      setSaving(false)
    }
  }

  if (!id) {
    return (
      <div className="text-xs text-slate-500">
        ID da sessão inválido.
      </div>
    )
  }

  if (loading) {
    return (
      <div className="text-xs text-slate-500">
        Carregando dados da sessão...
      </div>
    )
  }

  if (!dados) {
    return (
      <div className="text-xs text-red-600">
        Sessão não encontrada.
      </div>
    )
  }

  const dirigenteAtual = mediums.find(
    (m) => String(m.id) === form.dirigenteId,
  )
  const guiaAtual = guias.find(
    (g) => String(g.id) === form.guiaChefeId,
  )

  return (
    <div className="space-y-6">
      {/* CABEÇALHO */}
      <div className={cardClass}>
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">
              Sessão #{dados.id} –{' '}
              {new Date(dados.data).toLocaleDateString('pt-BR')}
            </h1>
            <p className="text-sm text-slate-500 mt-1 max-w-3xl">
              Ficha completa da sessão – dados da gira, dirigentes, horários e
              ATA.
            </p>
          </div>
          <div className="flex flex-col items-start md:items-end gap-2 text-xs text-slate-600">
            <a
              href={`/api/giras/${id}/ata`}
              target="_blank"
              className="rounded-full border border-slate-300 bg-white px-3 py-1 text-[11px] text-slate-700 hover:bg-slate-100"
            >
              Download da ATA em PDF
            </a>
          </div>
        </div>
      </div>

      {/* ALERTAS */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
          {success}
        </div>
      )}

      {/* FORMULÁRIO PRINCIPAL */}
      <form
        onSubmit={handleSubmit}
        className="grid gap-4 lg:grid-cols-3 text-xs"
      >
        {/* COLUNA 1 – Dados da sessão */}
        <div className="space-y-4 lg:col-span-1">
          <div className={cardClass}>
            <h2 className="text-sm font-semibold text-slate-900 mb-3">
              Dados da sessão
            </h2>
            <div className="space-y-3 text-slate-700">
              <div>
                <label className="block text-[11px] text-slate-500 mb-1">
                  Data
                </label>
                <input
                  type="date"
                  value={form.data}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      data: e.target.value,
                    }))
                  }
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-500 mb-1">
                  Tipo de sessão
                </label>
                <input
                  type="text"
                  value={form.tipo}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      tipo: e.target.value,
                    }))
                  }
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-500 mb-1">
                  Dirigente espiritual
                </label>
                <select
                  value={form.dirigenteId}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      dirigenteId: e.target.value,
                    }))
                  }
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900"
                >
                  <option value="">(não definido)</option>
                  {dirigentesElegiveis.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.codigo ? `${m.codigo} – ${m.nome}` : m.nome}
                    </option>
                  ))}
                </select>
                {dirigenteAtual && (
                  <p className="mt-1 text-[11px] text-slate-500">
                    Atual:{' '}
                    {dirigenteAtual.codigo
                      ? `${dirigenteAtual.codigo} – ${dirigenteAtual.nome}`
                      : dirigenteAtual.nome}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-[11px] text-slate-500 mb-1">
                  Guia chefe da sessão
                </label>
                <select
                  value={form.guiaChefeId}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      guiaChefeId: e.target.value,
                    }))
                  }
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900"
                >
                  <option value="">(não definido)</option>
                  {guias.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.nome} ({g.linha})
                    </option>
                  ))}
                </select>
                {guiaAtual && (
                  <p className="mt-1 text-[11px] text-slate-500">
                    Atual: {guiaAtual.nome} ({guiaAtual.linha})
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* COLUNA 2 – Horários + Observações */}
        <div className="space-y-4 lg:col-span-1">
          <div className={cardClass}>
            <h2 className="text-sm font-semibold text-slate-900 mb-3">
              Horários
            </h2>
            <div className="space-y-3 text-slate-700">
              <div>
                <label className="block text-[11px] text-slate-500 mb-1">
                  Horário de início
                </label>
                <input
                  type="time"
                  value={form.horarioInicio}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      horarioInicio: e.target.value,
                    }))
                  }
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-500 mb-1">
                  Horário de término
                </label>
                <input
                  type="time"
                  value={form.horarioFim}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      horarioFim: e.target.value,
                    }))
                  }
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900"
                />
              </div>
            </div>
          </div>

          <div className={cardClass}>
            <h2 className="text-sm font-semibold text-slate-900 mb-3">
              Observações da sessão
            </h2>
            <textarea
              rows={8}
              value={form.observacoes}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  observacoes: e.target.value,
                }))
              }
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 text-xs resize-none"
            />
          </div>
        </div>

        {/* COLUNA 3 – ATA */}
        <div className="space-y-4 lg:col-span-1">
          <div className={`${cardClass} h-full flex flex-col`}>
            <h2 className="text-sm font-semibold text-slate-900 mb-3">
              ATA da sessão
            </h2>
            <p className="text-[11px] text-slate-500 mb-2">
              Campo livre e longo para registrar a ata completa. No PDF, o
              cabeçalho incluirá data, tipo, dirigente, guia chefe e horários.
            </p>
            <textarea
              rows={16}
              value={form.ata}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  ata: e.target.value,
                }))
              }
              className="flex-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 text-xs resize-none"
            />
          </div>
        </div>

        {/* Botão salvar */}
        <div className="lg:col-span-3 flex justify-end mt-1">
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-emerald-500 text-emerald-950 font-semibold px-4 py-2 text-sm hover:brightness-110 disabled:opacity-60"
          >
            {saving ? 'Salvando...' : 'Salvar alterações da sessão'}
          </button>
        </div>
      </form>
    </div>
  )
}

