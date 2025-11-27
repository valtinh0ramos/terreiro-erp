'use client'

import { useEffect, useState } from 'react'

type Produto = {
  id: number
  nome: string
  categoria: string | null
  unidade: string
  estoqueMinimo: string | null
  quantidadeAtual: string
}

type Movimentacao = {
  id: number
  produtoEstoqueId: number
  tipo: 'ENTRADA' | 'SAIDA' | 'AJUSTE'
  quantidade: string
  data: string
  origem: string | null
  observacao: string | null
  produtoEstoque: {
    id: number
    nome: string
    unidade: string
  }
}

type ProdutoForm = {
  nome: string
  categoria: string
  unidade: string
  estoqueMinimo: string
}

type MovimentacaoForm = {
  produtoEstoqueId: string
  tipo: 'ENTRADA' | 'SAIDA' | 'AJUSTE'
  quantidade: string
  origem: string
  observacao: string
}

const CATEGORIA_OPTIONS = [
  'Consumo ritual',
  'Limpeza',
  'Cantina',
  'Manutenção',
  'Biblioteca',
  'Outros',
]

const UNIDADE_OPTIONS = [
  'un',
  'maço',
  'caixa',
  'pacote',
  'kg',
  'g',
  'L',
  'ml',
]

function formatDate(date: string) {
  const d = new Date(date)
  if (Number.isNaN(d.getTime())) return '-'
  return d.toLocaleString('pt-BR')
}

export default function EstoquePage() {
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [movimentacoes, setMovimentacoes] = useState<Movimentacao[]>([])
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [savingProduto, setSavingProduto] = useState(false)
  const [savingMov, setSavingMov] = useState(false)

  const [produtoForm, setProdutoForm] = useState<ProdutoForm>({
    nome: '',
    categoria: 'Consumo ritual',
    unidade: 'un',
    estoqueMinimo: '',
  })

  const [movForm, setMovForm] = useState<MovimentacaoForm>({
    produtoEstoqueId: '',
    tipo: 'ENTRADA',
    quantidade: '',
    origem: '',
    observacao: '',
  })

  async function loadProdutos() {
    try {
      const res = await fetch('/api/estoque/produtos')
      if (!res.ok) throw new Error('Erro ao carregar produtos de estoque.')
      const data = await res.json()
      setProdutos(data)
      if (data.length > 0 && !movForm.produtoEstoqueId) {
        setMovForm((prev) => ({
          ...prev,
          produtoEstoqueId: String(data[0].id),
        }))
      }
    } catch (e: any) {
      console.error(e)
      setError(e.message)
    }
  }

  async function loadMovimentacoes() {
    setLoading(true)
    try {
      const res = await fetch('/api/estoque/movimentacoes')
      if (!res.ok) throw new Error('Erro ao carregar movimentações.')
      const data = await res.json()
      setMovimentacoes(data)
    } catch (e: any) {
      console.error(e)
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProdutos()
    loadMovimentacoes()
  }, [])

  async function handleSubmitProduto(e: React.FormEvent) {
    e.preventDefault()
    setSavingProduto(true)
    setError(null)
    setSuccess(null)

    try {
      const payload = {
        nome: produtoForm.nome,
        categoria: produtoForm.categoria,
        unidade: produtoForm.unidade,
        estoqueMinimo: produtoForm.estoqueMinimo
          ? Number(produtoForm.estoqueMinimo)
          : undefined,
      }

      const res = await fetch('/api/estoque/produtos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Erro ao salvar produto.')
        setSavingProduto(false)
        return
      }

      setSuccess('Produto cadastrado com sucesso.')
      setProdutoForm({
        nome: '',
        categoria: 'Consumo ritual',
        unidade: 'un',
        estoqueMinimo: '',
      })
      await loadProdutos()
    } catch (e: any) {
      console.error(e)
      setError(e.message || 'Erro ao salvar produto.')
    } finally {
      setSavingProduto(false)
    }
  }

  async function handleSubmitMov(e: React.FormEvent) {
    e.preventDefault()
    setSavingMov(true)
    setError(null)
    setSuccess(null)

    try {
      const payload = {
        produtoEstoqueId: Number(movForm.produtoEstoqueId),
        tipo: movForm.tipo,
        quantidade: Number(movForm.quantidade),
        origem: movForm.origem || undefined,
        observacao: movForm.observacao || undefined,
      }

      const res = await fetch('/api/estoque/movimentacoes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Erro ao registrar movimentação.')
        setSavingMov(false)
        return
      }

      setSuccess('Movimentação registrada com sucesso.')
      setMovForm((prev) => ({
        ...prev,
        quantidade: '',
        origem: '',
        observacao: '',
      }))
      await loadProdutos()
      await loadMovimentacoes()
    } catch (e: any) {
      console.error(e)
      setError(e.message || 'Erro ao registrar movimentação.')
    } finally {
      setSavingMov(false)
    }
  }

  function abaixoDoMinimo(produto: Produto) {
    const min = produto.estoqueMinimo ? Number(produto.estoqueMinimo) : null
    const atual = produto.quantidadeAtual
      ? Number(produto.quantidadeAtual)
      : 0
    if (min === null || Number.isNaN(min)) return false
    return atual < min
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-50">
          Estoque – Produtos & Movimentações
        </h2>
        <p className="text-sm text-slate-400 mt-1 max-w-3xl">
          Cadastre itens de consumo da casa, defina estoque mínimo e controle
          entradas, saídas e ajustes.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[320px,minmax(0,1fr)]">
        {/* Form de produto + movimentação */}
        <div className="space-y-4">
          {/* Form produto */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
            <h3 className="text-sm font-semibold text-slate-100 mb-3">
              Novo produto de estoque
            </h3>

            <form
              onSubmit={handleSubmitProduto}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="block text-[11px] text-slate-300 mb-1">
                  Nome do produto *
                </label>
                <input
                  type="text"
                  value={produtoForm.nome}
                  onChange={(e) =>
                    setProdutoForm((prev) => ({
                      ...prev,
                      nome: e.target.value,
                    }))
                  }
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-50"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-300 mb-1">
                  Categoria
                </label>
                <select
                  value={produtoForm.categoria}
                  onChange={(e) =>
                    setProdutoForm((prev) => ({
                      ...prev,
                      categoria: e.target.value,
                    }))
                  }
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-50"
                >
                  {CATEGORIA_OPTIONS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-slate-300 mb-1">
                  Unidade
                </label>
                <select
                  value={produtoForm.unidade}
                  onChange={(e) =>
                    setProdutoForm((prev) => ({
                      ...prev,
                      unidade: e.target.value,
                    }))
                  }
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-50"
                >
                  {UNIDADE_OPTIONS.map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-slate-300 mb-1">
                  Estoque mínimo (opcional)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={produtoForm.estoqueMinimo}
                  onChange={(e) =>
                    setProdutoForm((prev) => ({
                      ...prev,
                      estoqueMinimo: e.target.value,
                    }))
                  }
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-50"
                />
              </div>

              <button
                type="submit"
                disabled={savingProduto}
                className="w-full rounded-lg bg-emerald-500 text-emerald-950 font-semibold py-1.5 text-xs hover:brightness-110 disabled:opacity-60"
              >
                {savingProduto ? 'Salvando...' : 'Cadastrar produto'}
              </button>
            </form>
          </div>

          {/* Form movimentação */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
            <h3 className="text-sm font-semibold text-slate-100 mb-3">
              Registrar movimentação
            </h3>

            <form
              onSubmit={handleSubmitMov}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="block text-[11px] text-slate-300 mb-1">
                  Produto
                </label>
                <select
                  value={movForm.produtoEstoqueId}
                  onChange={(e) =>
                    setMovForm((prev) => ({
                      ...prev,
                      produtoEstoqueId: e.target.value,
                    }))
                  }
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-2 py-1.5 text-slate-50"
                >
                  {produtos.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block text-[11px] text-slate-300 mb-1">
                    Tipo
                  </label>
                  <select
                    value={movForm.tipo}
                    onChange={(e) =>
                      setMovForm((prev) => ({
                        ...prev,
                        tipo: e.target.value as MovimentacaoForm['tipo'],
                      }))
                    }
                    className="w-full rounded-lg border border-slate-700 bg-slate-900 px-2 py-1.5 text-slate-50"
                  >
                    <option value="ENTRADA">Entrada</option>
                    <option value="SAIDA">Saída</option>
                    <option value="AJUSTE">Ajuste</option>
                  </select>
                </div>

                <div className="flex-1">
                  <label className="block text-[11px] text-slate-300 mb-1">
                    Quantidade
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={movForm.quantidade}
                    onChange={(e) =>
                      setMovForm((prev) => ({
                        ...prev,
                        quantidade: e.target.value,
                      }))
                    }
                    className="w-full rounded-lg border border-slate-700 bg-slate-900 px-2 py-1.5 text-slate-50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-slate-300 mb-1">
                  Origem (opcional)
                </label>
                <input
                  type="text"
                  value={movForm.origem}
                  onChange={(e) =>
                    setMovForm((prev) => ({
                      ...prev,
                      origem: e.target.value,
                    }))
                  }
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-2 py-1.5 text-slate-50"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-300 mb-1">
                  Observação
                </label>
                <textarea
                  rows={2}
                  value={movForm.observacao}
                  onChange={(e) =>
                    setMovForm((prev) => ({
                      ...prev,
                      observacao: e.target.value,
                    }))
                  }
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-2 py-1.5 text-slate-50"
                />
              </div>

              <button
                type="submit"
                disabled={savingMov}
                className="w-full rounded-lg bg-emerald-500 text-emerald-950 font-semibold py-1.5 text-xs hover:brightness-110 disabled:opacity-60"
              >
                {savingMov ? 'Salvando...' : 'Registrar movimentação'}
              </button>
            </form>

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
          </div>
        </div>

        {/* Tabelas */}
        <div className="space-y-4">
          {/* Produtos */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
            <h3 className="text-sm font-semibold text-slate-100 mb-3">
              Produtos de estoque
            </h3>
            {produtos.length === 0 ? (
              <p className="text-xs text-slate-400">
                Nenhum produto cadastrado.
              </p>
            ) : (
              <div className="overflow-x-auto max-h-[260px] text-xs">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400">
                      <th className="text-left py-2 pr-3">Produto</th>
                      <th className="text-left py-2 pr-3">Categoria</th>
                      <th className="text-left py-2 pr-3">Unidade</th>
                      <th className="text-left py-2 pr-3">Qtd. Atual</th>
                      <th className="text-left py-2 pr-3">Mínimo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {produtos.map((p) => {
                      const atual = p.quantidadeAtual
                        ? Number(p.quantidadeAtual)
                        : 0
                      const min = p.estoqueMinimo
                        ? Number(p.estoqueMinimo)
                        : null
                      const baixo = abaixoDoMinimo(p)
                      return (
                        <tr
                          key={p.id}
                          className="border-b border-slate-800/60 last:border-0"
                        >
                          <td className="py-1.5 pr-3 text-slate-50">
                            {p.nome}
                          </td>
                          <td className="py-1.5 pr-3 text-slate-300">
                            {p.categoria || '-'}
                          </td>
                          <td className="py-1.5 pr-3 text-slate-300">
                            {p.unidade}
                          </td>
                          <td className="py-1.5 pr-3 text-slate-300">
                            {atual}
                            {baixo && (
                              <span className="ml-1 text-[10px] text-red-400">
                                (baixo)
                              </span>
                            )}
                          </td>
                          <td className="py-1.5 pr-3 text-slate-300">
                            {min !== null ? min : '-'}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Movimentações */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
            <h3 className="text-sm font-semibold text-slate-100 mb-3">
              Últimas movimentações
            </h3>
            {loading ? (
              <p className="text-xs text-slate-400">Carregando...</p>
            ) : movimentacoes.length === 0 ? (
              <p className="text-xs text-slate-400">
                Nenhuma movimentação registrada.
              </p>
            ) : (
              <div className="overflow-x-auto max-h-[260px] text-xs text-slate-300">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400">
                      <th className="text-left py-2 pr-3">Data</th>
                      <th className="text-left py-2 pr-3">Produto</th>
                      <th className="text-left py-2 pr-3">Tipo</th>
                      <th className="text-left py-2 pr-3">Quantidade</th>
                      <th className="text-left py-2 pr-3">Origem</th>
                    </tr>
                  </thead>
                  <tbody>
                    {movimentacoes.map((m) => (
                      <tr
                        key={m.id}
                        className="border-b border-slate-800/60 last:border-0"
                      >
                        <td className="py-1.5 pr-3">
                          {formatDate(m.data)}
                        </td>
                        <td className="py-1.5 pr-3">
                          {m.produtoEstoque?.nome || '-'}
                        </td>
                        <td className="py-1.5 pr-3">{m.tipo}</td>
                        <td className="py-1.5 pr-3">
                          {Number(m.quantidade)}{' '}
                          {m.produtoEstoque?.unidade}
                        </td>
                        <td className="py-1.5 pr-3">
                          {m.origem || m.observacao || '-'}
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
    </div>
  )
}

