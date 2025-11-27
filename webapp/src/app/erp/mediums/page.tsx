'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

type Medium = {
  id: number
  nome: string
  email: string | null
  telefone: string | null
  nivel: string
  status: string
  dataEntrada: string | null
}

type FormState = {
  nome: string
  email: string
  telefone: string
  nivel: string
  status: string
  dataEntrada: string
  casaAnterior: string
  orixasCabeca: string
  nomeGuiaChefe: string
}

const NIVEL_OPTIONS = [
  { value: 'NIVEL_1_INICIANTE', label: '1 – Iniciante' },
  { value: 'NIVEL_2_DESENVOLVIMENTO', label: '2 – Desenvolvimento' },
  { value: 'NIVEL_3_TRABALHO_SEM_CONSULTA', label: '3 – Trabalho sem consulta' },
  { value: 'NIVEL_4_TRABALHO_COMPLETO', label: '4 – Trabalho completo' },
  { value: 'NIVEL_5_LIDER_SESSAO', label: '5 – Líder de sessão' },
  { value: 'NIVEL_6_PAI_MAE_PEQUENA', label: '6 – Pai/Mãe Pequena' },
  { value: 'NIVEL_7_DIRIGENTE_INTERNO', label: '7 – Dirigente interno' },
  { value: 'NIVEL_8_DIRIGENTE_GERAL', label: '8 – Dirigente geral' },
]

const STATUS_OPTIONS = [
  { value: 'ATIVO', label: 'Ativo' },
  { value: 'AFASTADO', label: 'Afastado' },
  { value: 'SUSPENSO', label: 'Suspenso' },
  { value: 'DESLIGADO', label: 'Desligado' },
]

export default function MediumsPage() {
  const [mediums, setMediums] = useState<Medium[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const [form, setForm] = useState<FormState>({
    nome: '',
    email: '',
    telefone: '',
    nivel: 'NIVEL_1_INICIANTE',
    status: 'ATIVO',
    dataEntrada: '',
    casaAnterior: '',
    orixasCabeca: '',
    nomeGuiaChefe: '',
  })

  async function loadMediums() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/mediums')
      if (!res.ok) {
        throw new Error('Falha ao carregar médiuns.')
      }
      const data = await res.json()
      setMediums(data)
    } catch (err: any) {
      console.error(err)
      setError(err.message || 'Erro ao carregar médiuns.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadMediums()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.nome.trim()) {
      setError('Nome do médium é obrigatório.')
      return
    }

    setSaving(true)
    setError(null)

    try {
      const res = await fetch('/api/mediums', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Erro ao salvar médium.')
        setSaving(false)
        return
      }

      await loadMediums()

      setForm((prev) => ({
        ...prev,
        nome: '',
        email: '',
        telefone: '',
        dataEntrada: '',
        casaAnterior: '',
        orixasCabeca: '',
        nomeGuiaChefe: '',
      }))
    } catch (err: any) {
      console.error(err)
      setError(err.message || 'Erro ao salvar médium.')
    } finally {
      setSaving(false)
    }
  }

  function nivelLabel(value: string) {
    const found = NIVEL_OPTIONS.find((n) => n.value === value)
    return found ? found.label : value
  }

  function statusLabel(value: string) {
    const found = STATUS_OPTIONS.find((s) => s.value === value)
    return found ? found.label : value
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-50">
          Médiuns & Corrente
        </h2>
        <p className="text-sm text-slate-400 mt-1 max-w-2xl">
          Cadastro central de médiuns da casa. Clique em &quot;Ver ficha&quot; para
          acessar a visão completa do histórico espiritual, disciplinar e
          administrativo de cada médium.
        </p>
      </div>

      {/* Formulário de novo médium */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
        <h3 className="text-sm font-semibold text-slate-100 mb-3">
          Novo médium
        </h3>

        <form
          onSubmit={handleSubmit}
          className="grid gap-3 md:grid-cols-2 lg:grid-cols-3"
        >
          <div className="md:col-span-2 lg:col-span-3">
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Nome completo *
            </label>
            <input
              type="text"
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-50 outline-none focus:ring-2 focus:ring-emerald-500"
              value={form.nome}
              onChange={(e) => setForm({ ...form, nome: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              E-mail
            </label>
            <input
              type="email"
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-50 outline-none focus:ring-2 focus:ring-emerald-500"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Telefone / WhatsApp
            </label>
            <input
              type="text"
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-50 outline-none focus:ring-2 focus:ring-emerald-500"
              value={form.telefone}
              onChange={(e) => setForm({ ...form, telefone: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Nível
            </label>
            <select
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-50 outline-none focus:ring-2 focus:ring-emerald-500"
              value={form.nivel}
              onChange={(e) => setForm({ ...form, nivel: e.target.value })}
            >
              {NIVEL_OPTIONS.map((n) => (
                <option key={n.value} value={n.value}>
                  {n.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Status
            </label>
            <select
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-50 outline-none focus:ring-2 focus:ring-emerald-500"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Data de entrada
            </label>
            <input
              type="date"
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-50 outline-none focus:ring-2 focus:ring-emerald-500"
              value={form.dataEntrada}
              onChange={(e) =>
                setForm({ ...form, dataEntrada: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Casa anterior
            </label>
            <input
              type="text"
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-50 outline-none focus:ring-2 focus:ring-emerald-500"
              value={form.casaAnterior}
              onChange={(e) =>
                setForm({ ...form, casaAnterior: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Orixá(s) de cabeça
            </label>
            <input
              type="text"
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-50 outline-none focus:ring-2 focus:ring-emerald-500"
              value={form.orixasCabeca}
              onChange={(e) =>
                setForm({ ...form, orixasCabeca: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Nome do guia chefe
            </label>
            <input
              type="text"
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-50 outline-none focus:ring-2 focus:ring-emerald-500"
              value={form.nomeGuiaChefe}
              onChange={(e) =>
                setForm({ ...form, nomeGuiaChefe: e.target.value })
              }
            />
          </div>

          <div className="md:col-span-2 lg:col-span-3 flex justify-end mt-2">
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-emerald-500 text-emerald-950 font-semibold px-4 py-2 text-sm hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed transition"
            >
              {saving ? 'Salvando...' : 'Salvar médium'}
            </button>
          </div>
        </form>

        {error && (
          <div className="mt-3 text-sm text-red-400 bg-red-950/40 border border-red-800 rounded-lg px-3 py-2">
            {error}
          </div>
        )}
      </div>

      {/* Lista de médiuns */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
        <h3 className="text-sm font-semibold text-slate-100 mb-3">
          Médiuns cadastrados
        </h3>

        {loading ? (
          <p className="text-xs text-slate-400">Carregando...</p>
        ) : mediums.length === 0 ? (
          <p className="text-xs text-slate-400">
            Nenhum médium cadastrado ainda.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="text-left py-2 pr-3">Nome</th>
                  <th className="text-left py-2 pr-3">E-mail</th>
                  <th className="text-left py-2 pr-3">Telefone</th>
                  <th className="text-left py-2 pr-3">Nível</th>
                  <th className="text-left py-2 pr-3">Status</th>
                  <th className="text-left py-2 pr-3">Entrada</th>
                  <th className="text-left py-2 pr-3"></th>
                </tr>
              </thead>
              <tbody>
                {mediums.map((m) => (
                  <tr
                    key={m.id}
                    className="border-b border-slate-800/60 last:border-0"
                  >
                    <td className="py-1.5 pr-3 text-slate-50">{m.nome}</td>
                    <td className="py-1.5 pr-3 text-slate-300">
                      {m.email || '-'}
                    </td>
                    <td className="py-1.5 pr-3 text-slate-300">
                      {m.telefone || '-'}
                    </td>
                    <td className="py-1.5 pr-3 text-slate-300">
                      {nivelLabel(m.nivel)}
                    </td>
                    <td className="py-1.5 pr-3 text-slate-300">
                      {statusLabel(m.status)}
                    </td>
                    <td className="py-1.5 pr-3 text-slate-300">
                      {m.dataEntrada
                        ? new Date(m.dataEntrada).toLocaleDateString('pt-BR')
                        : '-'}
                    </td>
                    <td className="py-1.5 pr-3 text-right">
                      <Link
                        href={`/erp/mediums/${m.id}`}
                        className="inline-flex items-center rounded-full border border-slate-700 px-3 py-1 text-[11px] text-slate-100 hover:bg-slate-800"
                      >
                        Ver ficha
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

