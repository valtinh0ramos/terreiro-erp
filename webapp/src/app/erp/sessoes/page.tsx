'use client'

import { useEffect, useState } from 'react'

type Gira = {
  id: number
  data: string
  tipo: string
  observacoes: string | null
  dirigente?: {
    id: number
    nome: string
    codigo: string | null
  } | null
  guiaChefe?: {
    id: number
    nome: string
    linha: string
  } | null
}

export default function SessoesListPage() {
  const [giras, setGiras] = useState<Gira[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function loadGiras() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/giras')
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Erro ao carregar sessões.')
        setLoading(false)
        return
      }
      setGiras(data)
    } catch (e: any) {
      console.error(e)
      setError(e.message || 'Erro ao carregar sessões.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadGiras()
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-50">
          Listagem de sessões (giras)
        </h2>
        <p className="text-sm text-slate-400 mt-1 max-w-3xl">
          Listagem das últimas sessões ativas registradas no sistema. Para
          editar dados detalhados ou ATA, clique em &quot;Ver sessão&quot;.
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
        ) : giras.length === 0 ? (
          <p className="text-xs text-slate-400">
            Nenhuma sessão ativa cadastrada.
          </p>
        ) : (
          <div className="overflow-x-auto max-h-[480px] text-xs">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="text-left py-2 pr-3">Data</th>
                  <th className="text-left py-2 pr-3">Tipo</th>
                  <th className="text-left py-2 pr-3">Dirigente</th>
                  <th className="text-left py-2 pr-3">Guia chefe</th>
                  <th className="text-left py-2 pr-3"></th>
                </tr>
              </thead>
              <tbody>
                {giras.map((g) => (
                  <tr
                    key={g.id}
                    className="border-b border-slate-800/60 last:border-0"
                  >
                    <td className="py-1.5 pr-3 text-slate-50">
                      {new Date(g.data).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="py-1.5 pr-3 text-slate-300">
                      {g.tipo}
                    </td>
                    <td className="py-1.5 pr-3 text-slate-300">
                      {g.dirigente
                        ? g.dirigente.codigo
                          ? `${g.dirigente.codigo} – ${g.dirigente.nome}`
                          : g.dirigente.nome
                        : '-'}
                    </td>
                    <td className="py-1.5 pr-3 text-slate-300">
                      {g.guiaChefe
                        ? `${g.guiaChefe.nome} (${g.guiaChefe.linha})`
                        : '-'}
                    </td>
                    <td className="py-1.5 pr-3 text-right">
                      <a
                        href={`/erp/sessoes/${g.id}`}
                        className="inline-flex items-center rounded-full border border-slate-700 px-3 py-1 text-[11px] text-slate-100 hover:bg-slate-800"
                      >
                        Ver sessão
                      </a>
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

