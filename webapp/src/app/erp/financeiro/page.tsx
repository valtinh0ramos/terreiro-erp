'use client'

import { useEffect, useState } from 'react'

type Medium = {
  id: number
  nome: string
  nivel: string
  status: string
}

type Mensalidade = {
  id: number
  mediumId: number
  competencia: string
  valor: string
  status: string
  dataPagamento: string | null
  formaPagamento: string | null
  medium: {
    id: number
    nome: string
    nivel: string
    status: string
  }
}

type MensalidadeForm = {
  mediumId: string
  competencia: string
  valor: string
  status: string
  dataPagamento: string
  formaPagamento: string
}

// Opções de status (financeiro)
const STATUS_MENSALIDADE = [
  { value: 'Pendente', label: 'Pendente' },
  { value: 'Pago', label: 'Pago' },
  { value: 'Atrasado', label: 'Atrasado' },
  { value: 'Isento', label: 'Isento' },
]

const FORMA_PAGAMENTO = [
  { value: 'DINHEIRO', label: 'Dinheiro' },
  { value: 'PIX', label: 'Pix' },
  { value: 'CARTAO', label: 'Cartão' },
  { value: 'OUTRO', label: 'Outro' },
]

function formatDate(date: string | null) {
  if (!date) return '-'
  const d = new Date(date)
  if (Number.isNaN(d.getTime())) return '-'
  return d.toLocaleDateString('pt-BR')
}

export default function FinanceiroPage() {
  
    // 🔹 Estado para o resumo financeiro geral
  const [resumo, setResumo] = useState<{ receitas: { mensalidades: number; doacoes: number }; despesas: number; saldo: number } | null>(null);

  // 🔹 Carregar o resumo financeiro geral (mensalidades + doações - despesas)
  async function carregarResumoFinanceiro() {
    try {
      const res = await fetch("/api/financeiro/resumo");
      const data = await res.json();
      setResumo(data);
    } catch (error) {
      console.error("Erro ao carregar resumo financeiro:", error);
    }
  }

  useEffect(() => {
    carregarResumoFinanceiro();
  }, []);


  const [mediums, setMediums] = useState<Medium[]>([])
  const [mensalidades, setMensalidades] = useState<Mensalidade[]>([])
  const [competencia, setCompetencia] = useState<string>(() => {
    const now = new Date()
    const ano = now.getFullYear()
    const mes = String(now.getMonth() + 1).padStart(2, '0')
    return `${ano}-${mes}`
  })
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const [form, setForm] = useState<MensalidadeForm>({
    mediumId: '',
    competencia: '',
    valor: '',
    status: 'Pago',
    dataPagamento: '',
    formaPagamento: 'PIX',
  })

  async function loadMediums() {
    try {
      const res = await fetch('/api/mediums')
      if (!res.ok) throw new Error('Erro ao carregar médiuns.')
      const data = await res.json()
      setMediums(data)
      if (data.length > 0 && !form.mediumId) {
        setForm((prev) => ({ ...prev, mediumId: String(data[0].id) }))
      }
    } catch (e: any) {
      console.error(e)
      setError(e.message)
    }
  }

  async function loadMensalidades(comp: string) {
    setLoading(true)
    setError(null)
    setSuccess(null)
    try {
      const res = await fetch(
        `/api/financeiro/mensalidades?competencia=${encodeURIComponent(
          comp,
        )}`,
      )
      if (!res.ok) throw new Error('Erro ao carregar mensalidades.')
      const data = await res.json()
      setMensalidades(data)
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
    if (competencia) {
      loadMensalidades(competencia)
      setForm((prev) => ({ ...prev, competencia }))
    }
  }, [competencia])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      const res = await fetch('/api/financeiro/mensalidades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Erro ao registrar mensalidade.')
        setSaving(false)
        return
      }

      setSuccess('Mensalidade registrada/atualizada com sucesso.')
      await loadMensalidades(competencia)
    } catch (e: any) {
      console.error(e)
      setError(e.message || 'Erro ao registrar mensalidade.')
    } finally {
      setSaving(false)
    }
  }

  const totalMes = mensalidades.reduce((acc, m) => {
    const v = Number(m.valor || 0)
    return acc + (Number.isNaN(v) ? 0 : v)
  }, 0)

  const totalPagas = mensalidades.filter((m) => m.status === 'Pago').length
  const totalPendentes = mensalidades.filter(
    (m) => m.status === 'Pendente' || m.status === 'Atrasado',
  ).length

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-50">
          Financeiro – Mensalidades & Arrecadação
        </h2>
        <p className="text-sm text-slate-400 mt-1 max-w-3xl">
          Controle de mensalidades por competência (mês/ano), com registro de
          pagamentos, status e forma de pagamento.
        </p>
      </div>

	      {/* 🔹 Resumo Financeiro Geral */}
      {resumo && (
        <div className="grid gap-4 md:grid-cols-3 mt-4">
          <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4 text-center">
            <p className="text-xs text-slate-400">Total arrecadado (Mensalidades + Doações)</p>
            <p className="text-2xl font-semibold text-emerald-400 mt-1">
              R$ {(resumo.receitas.mensalidades + resumo.receitas.doacoes)
                .toFixed(2)
                .replace(".", ",")}
            </p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4 text-center">
            <p className="text-xs text-slate-400">Total de Despesas</p>
            <p className="text-2xl font-semibold text-red-400 mt-1">
              R$ {resumo.despesas.toFixed(2).replace(".", ",")}
            </p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4 text-center">
            <p className="text-xs text-slate-400">Saldo Final</p>
            <p
              className={`text-2xl font-semibold mt-1 ${
                resumo.saldo >= 0 ? "text-emerald-500" : "text-red-500"
              }`}
            >
              R$ {resumo.saldo.toFixed(2).replace(".", ",")}
            </p>
          </div>
        </div>
      )}


      {/* Filtro de competência + cards resumo */}
      <div className="grid gap-4 md:grid-cols-[220px,1fr]">
        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Competência (AAAA-MM)
          </label>
          <input
            type="month"
            value={competencia}
            onChange={(e) => setCompetencia(e.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-slate-50 outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <p className="text-[11px] text-slate-500 mt-2">
            Use esse campo para navegar pelas mensalidades de cada mês.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
            <div className="text-xs text-slate-400">Total (mês)</div>
            <div className="text-2xl font-semibold text-emerald-400 mt-1">
              R$ {totalMes.toFixed(2).replace('.', ',')}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              Soma de todos os lançamentos da competência.
            </div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
            <div className="text-xs text-slate-400">Pagas</div>
            <div className="text-2xl font-semibold text-slate-100 mt-1">
              {totalPagas}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              Mensalidades com status &quot;Pago&quot;.
            </div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
            <div className="text-xs text-slate-400">Pendentes/Atrasadas</div>
            <div className="text-2xl font-semibold text-slate-100 mt-1">
              {totalPendentes}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              Mensalidades pendentes ou atrasadas no mês.
            </div>
          </div>
        </div>
      </div>

      {/* Form + Tabela */}
      <div className="grid gap-4 lg:grid-cols-[320px,minmax(0,1fr)]">
        {/* Form */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
          <h3 className="text-sm font-semibold text-slate-100 mb-3">
            Registrar / atualizar mensalidade
          </h3>

          <form onSubmit={handleSubmit} className="space-y-3 text-xs">
            <div>
              <label className="block text-[11px] text-slate-300 mb-1">
                Médium
              </label>
              <select
                value={form.mediumId}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    mediumId: e.target.value,
                  }))
                }
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-2 py-1.5 text-slate-50"
              >
                {mediums.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.nome} – {m.nivel} ({m.status})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] text-slate-300 mb-1">
                Competência (AAAA-MM)
              </label>
              <input
                type="month"
                value={form.competencia}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    competencia: e.target.value,
                  }))
                }
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-2 py-1.5 text-slate-50"
              />
            </div>

            <div>
              <label className="block text-[11px] text-slate-300 mb-1">
                Valor (R$)
              </label>
              <input
                type="number"
                step="0.01"
                value={form.valor}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    valor: e.target.value,
                  }))
                }
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-2 py-1.5 text-slate-50"
              />
            </div>

            <div>
              <label className="block text-[11px] text-slate-300 mb-1">
                Status
              </label>
              <select
                value={form.status}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    status: e.target.value,
                  }))
                }
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-2 py-1.5 text-slate-50"
              >
                {STATUS_MENSALIDADE.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] text-slate-300 mb-1">
                Data de pagamento
              </label>
              <input
                type="date"
                value={form.dataPagamento}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    dataPagamento: e.target.value,
                  }))
                }
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-2 py-1.5 text-slate-50"
              />
            </div>

            <div>
              <label className="block text-[11px] text-slate-300 mb-1">
                Forma de pagamento
              </label>
              <select
                value={form.formaPagamento}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    formaPagamento: e.target.value,
                  }))
                }
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-2 py-1.5 text-slate-50"
              >
                {FORMA_PAGAMENTO.map((f) => (
                  <option key={f.value} value={f.value}>
                    {f.label}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-lg bg-emerald-500 text-emerald-950 font-semibold py-1.5 text-xs hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {saving ? 'Salvando...' : 'Registrar mensalidade'}
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

        {/* Tabela de mensalidades */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
          <h3 className="text-sm font-semibold text-slate-100 mb-3">
            Mensalidades da competência
          </h3>

          {loading ? (
            <p className="text-xs text-slate-400">Carregando...</p>
          ) : mensalidades.length === 0 ? (
            <p className="text-xs text-slate-400">
              Nenhuma mensalidade registrada para este mês.
            </p>
          ) : (
            <div className="overflow-x-auto max-h-[480px]">
              <table className="min-w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="text-left py-2 pr-3">Médium</th>
                    <th className="text-left py-2 pr-3">Valor</th>
                    <th className="text-left py-2 pr-3">Status</th>
                    <th className="text-left py-2 pr-3">Pagamento</th>
                    <th className="text-left py-2 pr-3">Forma</th>
                  </tr>
                </thead>
                <tbody>
                  {mensalidades.map((m) => (
                    <tr
                      key={m.id}
                      className="border-b border-slate-800/60 last:border-0"
                    >
                      <td className="py-1.5 pr-3 text-slate-50">
                        {m.medium?.nome || '-'}
                      </td>
                      <td className="py-1.5 pr-3 text-slate-300">
                        R${' '}
                        {Number(m.valor || 0)
                          .toFixed(2)
                          .replace('.', ',')}
                      </td>
                      <td className="py-1.5 pr-3 text-slate-300">
                        {m.status}
                      </td>
                      <td className="py-1.5 pr-3 text-slate-300">
                        {formatDate(m.dataPagamento)}
                      </td>
                      <td className="py-1.5 pr-3 text-slate-300">
                        {m.formaPagamento || '-'}
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
