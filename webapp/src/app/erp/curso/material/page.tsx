'use client'

import { useEffect, useState } from 'react'

type Material = {
  id: number
  titulo: string
  descricao: string | null
  url: string
  turma?: {
    id: number
    codigo: string | null
    nome: string
  } | null
  createdAt: string
}

export default function MaterialDidaticoPage() {
  const [materiais, setMateriais] = useState<Material[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch('/api/curso/material')
        const data = await res.json()
        if (!res.ok) {
          setError(data.error || 'Erro ao carregar material didático.')
          setLoading(false)
          return
        }
        setMateriais(data)
      } catch (e: any) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-50">
          Material Didático – Curso de Umbanda
        </h2>
        <p className="text-sm text-slate-400 mt-1 max-w-3xl">
          Área com PDFs, apostilas e materiais de apoio para os alunos do Curso
          de Umbanda. Clique em um item para baixar.
        </p>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
        {error && (
          <div className="text-xs text-red-400 bg-red-950/40 border border-red-800 rounded-lg px-3 py-2 mb-3">
            {error}
          </div>
        )}
        {loading ? (
          <p className="text-xs text-slate-400">Carregando...</p>
        ) : materiais.length === 0 ? (
          <p className="text-xs text-slate-400">
            Nenhum material cadastrado ainda.
          </p>
        ) : (
          <ul className="space-y-2 text-xs text-slate-300">
            {materiais.map((m) => (
              <li
                key={m.id}
                className="flex items-start justify-between border-b border-slate-800/60 last:border-0 pb-2"
              >
                <div>
                  <div className="font-semibold text-slate-100">
                    {m.titulo}
                  </div>
                  {m.descricao && (
                    <div className="text-[11px] text-slate-400">
                      {m.descricao}
                    </div>
                  )}
                  {m.turma && (
                    <div className="text-[11px] text-slate-500">
                      Turma:{' '}
                      {m.turma.codigo
                        ? `${m.turma.codigo} – ${m.turma.nome}`
                        : m.turma.nome}
                    </div>
                  )}
                </div>
                <a
                  href={m.url}
                  target="_blank"
                  className="ml-3 rounded-full border border-emerald-600 bg-emerald-500/10 px-3 py-1 text-[11px] text-emerald-200 hover:bg-emerald-500/30"
                >
                  Baixar PDF
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

