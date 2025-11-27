'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

type Pretendente = {
  id: number
  codigo: string | null
  nome: string
  dataNascimento: string | null
  email: string | null
  telefone: string | null
  indicacao: string | null
}

type AlunoForm = {
  nome: string
  dataNascimento: string
  email: string
  telefone: string
  escolaridade: string
  profissao: string
  endereco: string
  indicacao: string
  observacoes: string
}

const cardClass =
  'rounded-xl border border-[#E4E4E7] bg-white shadow-sm p-4'

function formatDate(date: string | null) {
  if (!date) return '-'
  const d = new Date(date)
  if (Number.isNaN(d.getTime())) return '-'
  return d.toLocaleDateString('pt-BR')
}

export default function CursoPage() {
  const [alunos, setAlunos] = useState<Pretendente[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const [form, setForm] = useState<AlunoForm>({
    nome: '',
    dataNascimento: '',
    email: '',
    telefone: '',
    escolaridade: '',
    profissao: '',
    endereco: '',
    indicacao: '',
    observacoes: '',
  })

  async function loadAlunos() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/curso/pretendentes')
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Erro ao carregar alunos.')
        setLoading(false)
        return
      }
      setAlunos(data)
    } catch (e: any) {
      console.error(e)
      setError(e.message || 'Erro ao carregar alunos.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAlunos()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.nome.trim()) {
      setError('Nome do aluno é obrigatório.')
      return
    }

    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      const res = await fetch('/api/curso/pretendentes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Erro ao criar aluno.')
        setSaving(false)
        return
      }

      setSuccess('Aluno cadastrado com sucesso.')
      setForm({
        nome: '',
        dataNascimento: '',
        email: '',
        telefone: '',
        escolaridade: '',
        profissao: '',
        endereco: '',
        indicacao: '',
        observacoes: '',
      })
      await loadAlunos()
    } catch (e: any) {
      console.error(e)
      setError(e.message || 'Erro ao criar aluno.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className={cardClass}>
        <h2 className="text-xl font-semibold text-slate-900">
          Curso de Umbanda – Alunos (Pretendentes)
        </h2>
        <p className="text-sm text-slate-500 mt-1 max-w-3xl">
          Cadastre os alunos do Curso de Umbanda, acompanhe seus dados e acesse
          suas fichas individuais para avaliar desenvolvimento, presenças e
          resultado final (apto à corrente, voluntário, etc.).
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[360px,minmax(0,1fr)]">
        {/* FORMULÁRIO DE NOVO ALUNO */}
        <div className={cardClass}>
          <h3 className="text-sm font-semibold text-slate-900 mb-3">
            Novo aluno (pretendente)
          </h3>

          <form
            onSubmit={handleSubmit}
            className="space-y-3 text-xs text-slate-700"
          >
            <div>
              <label className="block text-[11px] text-slate-500 mb-1">
                Nome completo *
              </label>
              <input
                type="text"
                value={form.nome}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, nome: e.target.value }))
                }
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900"
              />
            </div>

            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block text-[11px] text-slate-500 mb-1">
                  Data de nascimento
                </label>
                <input
                  type="date"
                  value={form.dataNascimento}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      dataNascimento: e.target.value,
                    }))
                  }
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900"
                />
              </div>

              <div className="flex-1">
                <label className="block text-[11px] text-slate-500 mb-1">
                  Telefone
                </label>
                <input
                  type="text"
                  value={form.telefone}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      telefone: e.target.value,
                    }))
                  }
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] text-slate-500 mb-1">
                E-mail
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, email: e.target.value }))
                }
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900"
              />
            </div>

            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block text-[11px] text-slate-500 mb-1">
                  Escolaridade
                </label>
                <input
                  type="text"
                  value={form.escolaridade}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      escolaridade: e.target.value,
                    }))
                  }
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900"
                />
              </div>

              <div className="flex-1">
                <label className="block text-[11px] text-slate-500 mb-1">
                  Profissão
                </label>
                <input
                  type="text"
                  value={form.profissao}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      profissao: e.target.value,
                    }))
                  }
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] text-slate-500 mb-1">
                Endereço
              </label>
              <input
                type="text"
                value={form.endereco}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    endereco: e.target.value,
                  }))
                }
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900"
              />
            </div>

            <div>
              <label className="block text-[11px] text-slate-500 mb-1">
                Indicação (quem trouxe)
              </label>
              <input
                type="text"
                value={form.indicacao}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    indicacao: e.target.value,
                  }))
                }
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900"
              />
            </div>

            <div>
              <label className="block text-[11px] text-slate-500 mb-1">
                Observações
              </label>
              <textarea
                rows={3}
                value={form.observacoes}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    observacoes: e.target.value,
                  }))
                }
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-lg bg-emerald-500 text-emerald-950 font-semibold py-1.5 text-xs hover:brightness-110 disabled:opacity-60"
            >
              {saving ? 'Salvando...' : 'Cadastrar aluno'}
            </button>

            {error && (
              <div className="mt-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {error}
              </div>
            )}
            {success && (
              <div className="mt-2 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
                {success}
              </div>
            )}
          </form>
        </div>

        {/* LISTA DE ALUNOS */}
        <div className={cardClass}>
          <h3 className="text-sm font-semibold text-slate-900 mb-3">
            Alunos cadastrados
          </h3>

          {loading ? (
            <p className="text-xs text-slate-500">Carregando...</p>
          ) : alunos.length === 0 ? (
            <p className="text-xs text-slate-500">
              Nenhum aluno cadastrado ainda.
            </p>
          ) : (
            <div className="overflow-x-auto max-h-[480px] text-xs">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500">
                    <th className="text-left py-2 pr-3">Código</th>
                    <th className="text-left py-2 pr-3">Nome</th>
                    <th className="text-left py-2 pr-3">Nascimento</th>
                    <th className="text-left py-2 pr-3">Telefone</th>
                    <th className="text-left py-2 pr-3">Indicação</th>
                    <th className="text-left py-2 pr-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {alunos.map((a) => (
                    <tr
                      key={a.id}
                      className="border-b border-slate-100 last:border-0"
                    >
                      <td className="py-1.5 pr-3 text-slate-900">
                        {a.codigo || '-'}
                      </td>
                      <td className="py-1.5 pr-3 text-slate-900">
                        {a.nome}
                      </td>
                      <td className="py-1.5 pr-3 text-slate-600">
                        {formatDate(a.dataNascimento)}
                      </td>
                      <td className="py-1.5 pr-3 text-slate-600">
                        {a.telefone || '-'}
                      </td>
                      <td className="py-1.5 pr-3 text-slate-600">
                        {a.indicacao || '-'}
                      </td>
                      <td className="py-1.5 pr-3 text-right">
                        <Link
                          href={`/erp/curso/pretendentes/${a.id}`}
                          className="inline-flex items-center rounded-full border border-slate-300 px-3 py-1 text-[11px] text-slate-700 hover:bg-slate-100"
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
    </div>
  )
}

