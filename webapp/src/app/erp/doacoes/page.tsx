'use client'

import { useEffect, useState } from 'react'

type Medium = {
  id: number
  nome: string
}

type ProdutoEstoque = {
  id: number
  nome: string
  unidade: string
}

type DoacaoItemView = {
  id: number
  produtoEstoqueId: number
  quantidade: string
  produtoEstoque: {
    id: number
    nome: string
    unidade: string
  }
}

type DoacaoView = {
  id: number
  tipo: 'FINANCEIRA' | 'MATERIAL'
  mediumId: number | null
  doadorExterno: string | null
  valor: string | null
  data: string
  formaPagamento: string | null
  observacoes: string | null
  medium: {
    id: number
    nome: string
  } | null
  itens: DoacaoItemView[]
}

type DoacaoFinanceiraForm = {
  tipo: 'FINANCEIRA'
  mediumId: string
  doadorExterno: string
  valor: string
  formaPagamento: string
  observacoes: string
}

type DoacaoMaterialItemForm = {
  produtoEstoqueId: string
  quantidade: string
}

type DoacaoMaterialForm = {
  tipo: 'MATERIAL'
  mediumId: string
  doadorExterno: string
  itens: DoacaoMaterialItemForm[]
  observacoes: string
}

const FORMA_PAGAMENTO = [
  { value: 'DINHEIRO', label: 'Dinheiro' },
  { value: 'PIX', label: 'Pix' },
  { value: 'CARTAO', label: 'Cartão' },
  { value: 'OUTRO', label: 'Outro' },
]

function formatDateTime(date: string) {
  const d = new Date(date)
  if (Number.isNaN(d.getTime())) return '-'
  return d.toLocaleString('pt-BR')
}

export default function DoacoesPage() {
  const [mediums, setMediums] = useState<Medium[]>([])
  const [produtos, setProdutos] = useState<ProdutoEstoque[]>([])
  const [doacoes, setDoacoes] = useState<DoacaoView[]>([])
  const [tab, setTab] = useState<'FINANCEIRA' | 'MATERIAL'>('FINANCEIRA')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(false)

  const [financeiraForm, setFinanceiraForm] =
    useState<DoacaoFinanceiraForm>({
      tipo: 'FINANCEIRA',
      mediumId: '',
      doadorExterno: '',
      valor: '',
      formaPagamento: 'PIX',
      observacoes: '',
    })

  const [materialForm, setMaterialForm] = useState<DoacaoMaterialForm>({
    tipo: 'MATERIAL',
    mediumId: '',
    doadorExterno: '',
    itens: [{ produtoEstoqueId: '', quantidade: '' }],
    observacoes: '',
  })

  async function loadMediums() {
    try {
      const res = await fetch('/api/mediums')
      if (!res.ok) throw new Error('Erro ao carregar médiuns.')
      const data = await res.json()
      setMediums(data)
      if (data.length > 0) {
        setFinanceiraForm((prev) => ({
          ...prev,
          mediumId: prev.mediumId || String(data[0].id),
        }))
        setMaterialForm((prev) => ({
          ...prev,
          mediumId: prev.mediumId || String(data[0].id),
        }))
      }
    } catch (e: any) {
      console.error(e)
      setError(e.message)
    }
  }

  async function loadProdutos() {
    try {
      const res = await fetch('/api/estoque/produtos')
      if (!res.ok) return
      const data = await res.json()
      setProdutos(data)
    } catch (e) {
      console.error(e)
    }
  }

  async function loadDoacoes() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/doacoes')
      if (!res.ok) throw new Error('Erro ao carregar doações.')
      const data = await res.json()
      setDoacoes(data)
    } catch (e: any) {
      console.error(e)
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadMediums()
    loadProdutos()
    loadDoacoes()
  }, [])

  async function handleSubmitFinanceira(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      const payload = {
        tipo: 'FINANCEIRA',
        mediumId: financeiraForm.mediumId
          ? Number(financeiraForm.mediumId)
          : undefined,
        doadorExterno: financeiraForm.doadorExterno || undefined,
        valor: Number(financeiraForm.valor),
        formaPagamento: financeiraForm.formaPagamento,
        observacoes: financeiraForm.observacoes || undefined,
      }

      const res = await fetch('/api/doacoes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Erro ao registrar doação financeira.')
        setSaving(false)
        return
      }

      setSuccess('Doação financeira registrada com sucesso.')
      setFinanceiraForm((prev) => ({
        ...prev,
        doadorExterno: '',
        valor: '',
        observacoes: '',
      }))
      await loadDoacoes()
    } catch (e: any) {
      console.error(e)
      setError(e.message || 'Erro ao registrar doação financeira.')
    } finally {
      setSaving(false)
    }
  }

  function addMaterialItem() {
    setMaterialForm((prev) => ({
      ...prev,
      itens: [...prev.itens, { produtoEstoqueId: '', quantidade: '' }],
    }))
  }

  function updateMaterialItem(
    index: number,
    field: keyof DoacaoMaterialItemForm,
    value: string,
  ) {
    setMaterialForm((prev) => {
      const itens = [...prev.itens]
      itens[index] = { ...itens[index], [field]: value }
      return { ...prev, itens }
    })
  }

  function removeMaterialItem(index: number) {
    setMaterialForm((prev) => {
      const itens = prev.itens.filter((_, i) => i !== index)
      return {
        ...prev,
        itens: itens.length ? itens : [{ produtoEstoqueId: '', quantidade: '' }],
      }
    })
  }

  async function handleSubmitMaterial(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      const payload = {
        tipo: 'MATERIAL',
        mediumId: materialForm.mediumId
          ? Number(materialForm.mediumId)
          : undefined,
        doadorExterno: materialForm.doadorExterno || undefined,
        itens: materialForm.itens.map((i) => ({
          produtoEstoqueId: Number(i.produtoEstoqueId),
          quantidade: Number(i.quantidade),
        })),
        observacoes: materialForm.observacoes || undefined,
      }

      const res = await fetch('/api/doacoes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Erro ao registrar doação material.')
        setSaving(false)
        return
      }

      setSuccess('Doação material registrado com sucesso.')
      setMaterialForm((prev) => ({
        ...prev,
        doadorExterno: '',
        itens: [{ produtoEstoqueId: '', quantidade: '' }],
        observacoes: '',
      }))
      await loadDoacoes()
    } catch (e: any) {
      console.error(e)
      setError(e.message || 'Erro ao registrar doação material.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-50">
          Doações – Financeiras & Materiais
        </h2>
        <p className="text-sm text-slate-400 mt-1 max-w-3xl">
          Registre contribuições financeiras ou materiais para a casa. Doações
          materiais alimentam o estoque automaticamente.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 text-xs">
        <button
          type="button"
          onClick={() => {
            setTab('FINANCEIRA')
            setError(null)
            setSuccess(null)
          }}
          className={`rounded-full px-3 py-1 border ${
            tab === 'FINANCEIRA'
              ? 'border-emerald-500 bg-emerald-500/10 text-emerald-200'
              : 'border-slate-700 bg-slate-900 text-slate-300 hover:bg-slate-800'
          }`}
        >
          Doação financeira
        </button>
        <button
          type="button"
          onClick={() => {
            setTab('MATERIAL')
            setError(null)
            setSuccess(null)
          }}
          className={`rounded-full px-3 py-1 border ${
            tab === 'MATERIAL'
              ? 'border-emerald-500 bg-emerald-500/10 text-emerald-200'
              : 'border-slate-700 bg-slate-900 text-slate-300 hover:bg-slate-800'
          }`}
        >
          Doação material
        </button>
      </div>

      <div className="grid gap-4 lg:grid-cols-[360px,minmax(0,1fr)]">
        {/* Formulário */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
          {tab === 'FINANCEIRA' ? (
            <>
              <h3 className="text-sm font-semibold text-slate-100 mb-3">
                Doação financeira
              </h3>
              <form
                onSubmit={handleSubmitFinanceira}
                className="space-y-3 text-xs"
              >
                <div>
                  <label className="block text-[11px] text-slate-300 mb-1">
                    Médium (opcional)
                  </label>
                  <select
                    value={financeiraForm.mediumId}
                    onChange={(e) =>
                      setFinanceiraForm((prev) => ({
                        ...prev,
                        mediumId: e.target.value,
                      }))
                    }
                    className="w-full rounded-lg border border-slate-700 bg-slate-900 px-2 py-1.5 text-slate-50"
                  >
                    <option value="">(usar doador externo)</option>
                    {mediums.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.nome}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] text-slate-300 mb-1">
                    Doador externo (se não for médium)
                  </label>
                  <input
                    type="text"
                    value={financeiraForm.doadorExterno}
                    onChange={(e) =>
                      setFinanceiraForm((prev) => ({
                        ...prev,
                        doadorExterno: e.target.value,
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
                    value={financeiraForm.valor}
                    onChange={(e) =>
                      setFinanceiraForm((prev) => ({
                        ...prev,
                        valor: e.target.value,
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
                    value={financeiraForm.formaPagamento}
                    onChange={(e) =>
                      setFinanceiraForm((prev) => ({
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

                <div>
                  <label className="block text-[11px] text-slate-300 mb-1">
                    Observações
                  </label>
                  <textarea
                    rows={3}
                    value={financeiraForm.observacoes}
                    onChange={(e) =>
                      setFinanceiraForm((prev) => ({
                        ...prev,
                        observacoes: e.target.value,
                      }))
                    }
                    className="w-full rounded-lg border border-slate-700 bg-slate-900 px-2 py-1.5 text-slate-50"
                  />
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full rounded-lg bg-emerald-500 text-emerald-950 font-semibold py-1.5 text-xs hover:brightness-110 disabled:opacity-60"
                >
                  {saving ? 'Salvando...' : 'Registrar doação financeira'}
                </button>
              </form>
            </>
          ) : (
            <>
              <h3 className="text-sm font-semibold text-slate-100 mb-3">
                Doação material
              </h3>
              <form
                onSubmit={handleSubmitMaterial}
                className="space-y-3 text-xs"
              >
                <div>
                  <label className="block text-[11px] text-slate-300 mb-1">
                    Médium (opcional)
                  </label>
                  <select
                    value={materialForm.mediumId}
                    onChange={(e) =>
                      setMaterialForm((prev) => ({
                        ...prev,
                        mediumId: e.target.value,
                      }))
                    }
                    className="w-full rounded-lg border border-slate-700 bg-slate-900 px-2 py-1.5 text-slate-50"
                  >
                    <option value="">(usar doador externo)</option>
                    {mediums.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.nome}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] text-slate-300 mb-1">
                    Doador externo (se não for médium)
                  </label>
                  <input
                    type="text"
                    value={materialForm.doadorExterno}
                    onChange={(e) =>
                      setMaterialForm((prev) => ({
                        ...prev,
                        doadorExterno: e.target.value,
                      }))
                    }
                    className="w-full rounded-lg border border-slate-700 bg-slate-900 px-2 py-1.5 text-slate-50"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-[11px] text-slate-300 mb-1">
                    Itens da doação
                  </label>
                  {materialForm.itens.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 mb-1"
                    >
                      <select
                        value={item.produtoEstoqueId}
                        onChange={(e) =>
                          updateMaterialItem(
                            index,
                            'produtoEstoqueId',
                            e.target.value,
                          )
                        }
                        className="w-40 rounded-lg border border-slate-700 bg-slate-900 px-2 py-1.5 text-slate-50"
                      >
                        <option value="">Selecione produto...</option>
                        {produtos.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.nome} ({p.unidade})
                          </option>
                        ))}
                      </select>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="Quantidade"
                        value={item.quantidade}
                        onChange={(e) =>
                          updateMaterialItem(
                            index,
                            'quantidade',
                            e.target.value,
                          )
                        }
                        className="w-24 rounded-lg border border-slate-700 bg-slate-900 px-2 py-1.5 text-slate-50"
                      />
                      <button
                        type="button"
                        onClick={() => removeMaterialItem(index)}
                        className="rounded-md border border-red-700 bg-red-900/30 px-2 py-1 text-[10px] text-red-300 hover:bg-red-900/60"
                      >
                        X
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addMaterialItem}
                    className="rounded-full border border-slate-700 px-3 py-1 text-[11px] text-slate-100 hover:bg-slate-800"
                  >
                    + adicionar item
                  </button>
                </div>

                <div>
                  <label className="block text-[11px] text-slate-300 mb-1">
                    Observações
                  </label>
                  <textarea
                    rows={3}
                    value={materialForm.observacoes}
                    onChange={(e) =>
                      setMaterialForm((prev) => ({
                        ...prev,
                        observacoes: e.target.value,
                      }))
                    }
                    className="w-full rounded-lg border border-slate-700 bg-slate-900 px-2 py-1.5 text-slate-50"
                  />
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full rounded-lg bg-emerald-500 text-emerald-950 font-semibold py-1.5 text-xs hover:brightness-110 disabled:opacity-60"
                >
                  {saving ? 'Salvando...' : 'Registrar doação material'}
                </button>
              </form>
            </>
          )}

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

        {/* Lista de doações */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
          <h3 className="text-sm font-semibold text-slate-100 mb-3">
            Últimas doações
          </h3>

          {loading ? (
            <p className="text-xs text-slate-400">Carregando...</p>
          ) : doacoes.length === 0 ? (
            <p className="text-xs text-slate-400">
              Nenhuma doação registrada.
            </p>
          ) : (
            <div className="overflow-x-auto max-h-[480px] text-xs text-slate-300">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="text-left py-2 pr-3">Data</th>
                    <th className="text-left py-2 pr-3">Tipo</th>
                    <th className="text-left py-2 pr-3">Doador</th>
                    <th className="text-left py-2 pr-3">Valor/Itens</th>
                    <th className="text-left py-2 pr-3">Obs.</th>
                  </tr>
                </thead>
                <tbody>
                  {doacoes.map((d) => (
                    <tr
                      key={d.id}
                      className="border-b border-slate-800/60 last:border-0"
                    >
                      <td className="py-1.5 pr-3">
                        {formatDateTime(d.data)}
                      </td>
                      <td className="py-1.5 pr-3">
                        {d.tipo === 'FINANCEIRA'
                          ? 'Financeira'
                          : 'Material'}
                      </td>
                      <td className="py-1.5 pr-3">
                        {d.medium?.nome ||
                          d.doadorExterno ||
                          '-'}
                      </td>
                      <td className="py-1.5 pr-3">
                        {d.tipo === 'FINANCEIRA' ? (
                          <>
                            R${' '}
                            {Number(d.valor || 0)
                              .toFixed(2)
                              .replace('.', ',')}{' '}
                            {d.formaPagamento
                              ? `(${d.formaPagamento})`
                              : ''}
                          </>
                        ) : d.itens.length === 0 ? (
                          '-'
                        ) : (
                          <ul className="list-disc pl-4">
                            {d.itens.map((i) => (
                              <li key={i.id}>
                                {Number(i.quantidade)}{' '}
                                {i.produtoEstoque.unidade}{' '}
                                de {i.produtoEstoque.nome}
                              </li>
                            ))}
                          </ul>
                        )}
                      </td>
                      <td className="py-1.5 pr-3">
                        {d.observacoes || '-'}
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

