'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

type Voluntario = {
  id: number
  codigo: string | null
  nome: string
  email: string | null
  telefone: string | null
  tipo: string
  ativo: boolean
  areasAtuacao: string | null
}

type VoluntarioForm = {
  nome: string
  email: string
  telefone: string
  areasAtuacao: string
  observacoes: string
}

export default function VoluntariosPage() {
  const [voluntarios, setVoluntarios] = useState<Voluntario[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const [form, setForm] = useState<VoluntarioForm>({
    nome: '',
    email: '',
    telefone: '',
    areasAtuacao: '',
    observacoes: '',
  })

  async function loadVoluntarios() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/voluntarios')
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Erro ao carregar voluntários.')
        setLoading(false)
        return
      }
      setVoluntarios(data)
    } catch (e: any) {
      console.error(e)
      setError(e.message || 'Erro ao carregar voluntários.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadVoluntarios()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.nome.trim()) {
      setError('Nome do voluntário é obrigatório.')
      return
    }

    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      const res = await fetch('/api/voluntarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Erro ao criar voluntário.')
        setSaving(false)
        return
      }

      setSuccess('Voluntário cadastrado com sucesso.')
      setForm({
        nome: '',
        email: '',
        telefone: '',
        areasAtuacao: '',
        observacoes: '',
      })
      await loadVoluntarios()
    } catch (e: any) {
      console.error(e)
      setError(e.message || 'Erro ao criar voluntário.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-50">
          Voluntários da Casa
        </h2>
        <p className="text-sm text-slate-400 mt-1 max-w-3xl">
          Cadastre voluntários que atuam em diferentes frentes (biblioteca,
          cantina, limpeza, ações sociais, etc.). Voluntários também podem
          ser promovidos a médium.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[360px,minmax(0,1fr)]">
        {/* Formulário */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
          <h3 className="text-sm font-semibold text-slate-100 mb-3">
            Novo voluntário
          </h3>

          <form onSubmit={handleSubmit} className="space-y-3 text-xs">
            <div>
              <label className="block text-[11px] text-slate-300 mb-1">
                Nome completo *
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
                E-mail
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, email: e.target.value }))
                }
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-50"
              />
            </div>

            <div>
              <label className="block text-[11px] text-slate-300 mb-1">
                Telefone
              </label>
              <input
                type="text"
                value={form.telefone}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, telefone: e.target.value }))
                }
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-50"
              />
            </div>

            <div>
              <label className="block text-[11px] text-slate-300 mb-1">
                Áreas de atuação (texto livre)
              </label>
              <textarea
                rows={2}
                value={form.areasAtuacao}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    areasAtuacao: e.target.value,
                  }))
                }
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-50"
              />
            </div>

            <div>
              <label className="block text-[11px] text-slate-300 mb-1">
                Observações
              </label>
              <textarea
                rows={2}
                value={form.observacoes}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    observacoes: e.target.value,
                  }))
                }
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-50"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-lg bg-emerald-500 text-emerald-950 font-semibold py-1.5 text-xs hover:brightness-110 disabled:opacity-60"
            >
              {saving ? 'Salvando...' : 'Cadastrar voluntário'}
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

        {/* Lista de voluntários */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
          <h3 className="text-sm font-semibold text-slate-100 mb-3">
            Voluntários cadastrados
          </h3>

          {loading ? (
            <p className="text-xs text-slate-400">Carregando...</p>
          ) : voluntarios.length === 0 ? (
            <p className="text-xs text-slate-400">
              Nenhum voluntário cadastrado ainda.
            </p>
          ) : (
            <div className="overflow-x-auto max-h-[480px] text-xs">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="text-left py-2 pr-3">Código</th>
                    <th className="text-left py-2 pr-3">Nome</th>
                    <th className="text-left py-2 pr-3">Telefone</th>
                    <th className="text-left py-2 pr-3">Ativo</th>
                    <th className="text-left py-2 pr-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {voluntarios.map((v) => (
                    <tr
                      key={v.id}
                      className="border-b border-slate-800/60 last:border-0"
                    >
                      <td className="py-1.5 pr-3 text-slate-200">
                        {v.codigo || '-'}
                      </td>
                      <td className="py-1.5 pr-3 text-slate-50">
                        {v.nome}
                      </td>
                      <td className="py-1.5 pr-3 text-slate-300">
                        {v.telefone || '-'}
                      </td>
                      <td className="py-1.5 pr-3 text-slate-300">
                        {v.ativo ? 'Sim' : 'Não'}
                      </td>
                      <td className="py-1.5 pr-3 text-right">
                        <Link
                          href={`/erp/voluntarios/${v.id}`}
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
    </div>
  )
}

