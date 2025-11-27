'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'

type MediumForm = {
  nome: string
  email: string
  telefone: string
  profissao: string
  escolaridade: string
  estadoCivil: string
  filiacao: string
  dataNascimento: string
  dataEntrada: string
  casaAnterior: string
  orixasCabeca: string
  nomeGuiaChefe: string
  padrinhoMadrinha: string
  doencas: string
  medicacoes: string
  alergias: string
  observacoesSaude: string
  observacoesDirecao: string
  nivel: string
  status: string
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

export default function EditarMediumPage() {
  const params = useParams()
  const router = useRouter()
  const id = (params?.id as string) || ''
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const [form, setForm] = useState<MediumForm>({
    nome: '',
    email: '',
    telefone: '',
    profissao: '',
    escolaridade: '',
    estadoCivil: '',
    filiacao: '',
    dataNascimento: '',
    dataEntrada: '',
    casaAnterior: '',
    orixasCabeca: '',
    nomeGuiaChefe: '',
    padrinhoMadrinha: '',
    doencas: '',
    medicacoes: '',
    alergias: '',
    observacoesSaude: '',
    observacoesDirecao: '',
    nivel: 'NIVEL_1_INICIANTE',
    status: 'ATIVO',
  })

  useEffect(() => {
    async function load() {
      if (!id) return
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`/api/mediums/${id}`)
        const data = await res.json()
        if (!res.ok) {
          setError(data.error || 'Erro ao carregar médium.')
          return
        }

        const dateToInput = (d: string | null) => {
          if (!d) return ''
          const dt = new Date(d)
          if (Number.isNaN(dt.getTime())) return ''
          return dt.toISOString().slice(0, 10)
        }

        setForm({
          nome: data.nome || '',
          email: data.email || '',
          telefone: data.telefone || '',
          profissao: data.profissao || '',
          escolaridade: data.escolaridade || '',
          estadoCivil: data.estadoCivil || '',
          filiacao: data.filiacao || '',
          dataNascimento: dateToInput(data.dataNascimento),
          dataEntrada: dateToInput(data.dataEntrada),
          casaAnterior: data.casaAnterior || '',
          orixasCabeca: data.orixasCabeca || '',
          nomeGuiaChefe: data.nomeGuiaChefe || '',
          padrinhoMadrinha: data.padrinhoMadrinha || '',
          doencas: data.doencas || '',
          medicacoes: data.medicacoes || '',
          alergias: data.alergias || '',
          observacoesSaude: data.observacoesSaude || '',
          observacoesDirecao: data.observacoesDirecao || '',
          nivel: data.nivel || 'NIVEL_1_INICIANTE',
          status: data.status || 'ATIVO',
        })
      } catch (e: any) {
        console.error(e)
        setError(e.message || 'Erro ao carregar médium.')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [id])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!id) return

    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      const res = await fetch(`/api/mediums/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Erro ao salvar alterações.')
        return
      }

      setSuccess('Ficha atualizada com sucesso.')
      // Após salvar, volta para a ficha
      setTimeout(() => {
        router.push(`/erp/mediums/${id}`)
      }, 800)
    } catch (e: any) {
      console.error(e)
      setError(e.message || 'Erro ao salvar alterações.')
    } finally {
      setSaving(false)
    }
  }

  function handleChange(
    field: keyof MediumForm,
    value: string,
  ) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  if (!id) {
    return (
      <div className="text-xs text-slate-400">
        ID de médium inválido.
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-50">
            Editar ficha do médium
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Atualize os dados pessoais, espirituais e de saúde deste médium.
          </p>
        </div>
        <button
          type="button"
          onClick={() => router.push(`/erp/mediums/${id}`)}
          className="rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-100 hover:bg-slate-800"
        >
          Voltar para ficha
        </button>
      </div>

      {loading ? (
        <p className="text-xs text-slate-400">Carregando dados...</p>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 text-xs"
        >
          {/* Dados pessoais */}
          <div className="md:col-span-2 lg:col-span-3">
            <h3 className="text-sm font-semibold text-slate-100 mb-2">
              Dados pessoais
            </h3>
          </div>

          <div className="md:col-span-2 lg:col-span-3">
            <label className="block mb-1 text-slate-300 text-[11px]">
              Nome completo
            </label>
            <input
              type="text"
              value={form.nome}
              onChange={(e) => handleChange('nome', e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-50"
            />
          </div>

          <div>
            <label className="block mb-1 text-slate-300 text-[11px]">
              E-mail
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => handleChange('email', e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-50"
            />
          </div>

          <div>
            <label className="block mb-1 text-slate-300 text-[11px]">
              Telefone / WhatsApp
            </label>
            <input
              type="text"
              value={form.telefone}
              onChange={(e) => handleChange('telefone', e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-50"
            />
          </div>

          <div>
            <label className="block mb-1 text-slate-300 text-[11px]">
              Data de nascimento
            </label>
            <input
              type="date"
              value={form.dataNascimento}
              onChange={(e) =>
                handleChange('dataNascimento', e.target.value)
              }
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-50"
            />
          </div>

          <div>
            <label className="block mb-1 text-slate-300 text-[11px]">
              Profissão
            </label>
            <input
              type="text"
              value={form.profissao}
              onChange={(e) => handleChange('profissao', e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-50"
            />
          </div>

          <div>
            <label className="block mb-1 text-slate-300 text-[11px]">
              Escolaridade
            </label>
            <input
              type="text"
              value={form.escolaridade}
              onChange={(e) =>
                handleChange('escolaridade', e.target.value)
              }
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-50"
            />
          </div>

          <div>
            <label className="block mb-1 text-slate-300 text-[11px]">
              Estado civil
            </label>
            <input
              type="text"
              value={form.estadoCivil}
              onChange={(e) =>
                handleChange('estadoCivil', e.target.value)
              }
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-50"
            />
          </div>

          <div className="md:col-span-2 lg:col-span-3">
            <label className="block mb-1 text-slate-300 text-[11px]">
              Filiação
            </label>
            <input
              type="text"
              value={form.filiacao}
              onChange={(e) => handleChange('filiacao', e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-50"
            />
          </div>

          {/* Espiritual */}
          <div className="md:col-span-2 lg:col-span-3 mt-2">
            <h3 className="text-sm font-semibold text-slate-100 mb-2">
              Dados espirituais
            </h3>
          </div>

          <div>
            <label className="block mb-1 text-slate-300 text-[11px]">
              Data de entrada na casa
            </label>
            <input
              type="date"
              value={form.dataEntrada}
              onChange={(e) =>
                handleChange('dataEntrada', e.target.value)
              }
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-50"
            />
          </div>

          <div>
            <label className="block mb-1 text-slate-300 text-[11px]">
              Casa anterior
            </label>
            <input
              type="text"
              value={form.casaAnterior}
              onChange={(e) =>
                handleChange('casaAnterior', e.target.value)
              }
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-50"
            />
          </div>

          <div className="md:col-span-2 lg:col-span-3">
            <label className="block mb-1 text-slate-300 text-[11px]">
              Orixá(s) de cabeça
            </label>
            <input
              type="text"
              value={form.orixasCabeca}
              onChange={(e) =>
                handleChange('orixasCabeca', e.target.value)
              }
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-50"
            />
          </div>

          <div>
            <label className="block mb-1 text-slate-300 text-[11px]">
              Nome do guia chefe
            </label>
            <input
              type="text"
              value={form.nomeGuiaChefe}
              onChange={(e) =>
                handleChange('nomeGuiaChefe', e.target.value)
              }
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-50"
            />
          </div>

          <div className="md:col-span-2 lg:col-span-3">
            <label className="block mb-1 text-slate-300 text-[11px]">
              Padrinho/Madrinha
            </label>
            <input
              type="text"
              value={form.padrinhoMadrinha}
              onChange={(e) =>
                handleChange('padrinhoMadrinha', e.target.value)
              }
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-50"
            />
          </div>

          <div className="md:col-span-2 lg:col-span-3">
            <label className="block mb-1 text-slate-300 text-[11px]">
              Observações da direção
            </label>
            <textarea
              rows={3}
              value={form.observacoesDirecao}
              onChange={(e) =>
                handleChange('observacoesDirecao', e.target.value)
              }
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-50"
            />
          </div>

          {/* Saúde */}
          <div className="md:col-span-2 lg:col-span-3 mt-2">
            <h3 className="text-sm font-semibold text-slate-100 mb-2">
              Saúde
            </h3>
          </div>

          <div className="md:col-span-2 lg:col-span-3">
            <label className="block mb-1 text-slate-300 text-[11px]">
              Doenças importantes
            </label>
            <textarea
              rows={2}
              value={form.doencas}
              onChange={(e) => handleChange('doencas', e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-50"
            />
          </div>

          <div>
            <label className="block mb-1 text-slate-300 text-[11px]">
              Medicações
            </label>
            <textarea
              rows={2}
              value={form.medicacoes}
              onChange={(e) =>
                handleChange('medicacoes', e.target.value)
              }
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-50"
            />
          </div>

          <div>
            <label className="block mb-1 text-slate-300 text-[11px]">
              Alergias
            </label>
            <textarea
              rows={2}
              value={form.alergias}
              onChange={(e) =>
                handleChange('alergias', e.target.value)
              }
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-50"
            />
          </div>

          <div className="md:col-span-2 lg:col-span-3">
            <label className="block mb-1 text-slate-300 text-[11px]">
              Observações de saúde
            </label>
            <textarea
              rows={2}
              value={form.observacoesSaude}
              onChange={(e) =>
                handleChange('observacoesSaude', e.target.value)
              }
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-50"
            />
          </div>

          {/* Nível e Status */}
          <div className="md:col-span-2 lg:col-span-3 mt-2">
            <h3 className="text-sm font-semibold text-slate-100 mb-2">
              Nível & Status
            </h3>
          </div>

          <div>
            <label className="block mb-1 text-slate-300 text-[11px]">
              Nível
            </label>
            <select
              value={form.nivel}
              onChange={(e) => handleChange('nivel', e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-50"
            >
              {NIVEL_OPTIONS.map((n) => (
                <option key={n.value} value={n.value}>
                  {n.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-1 text-slate-300 text-[11px]">
              Status
            </label>
            <select
              value={form.status}
              onChange={(e) => handleChange('status', e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-50"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          {/* Botão salvar */}
          <div className="md:col-span-2 lg:col-span-3 flex justify-end mt-4">
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-emerald-500 text-emerald-950 font-semibold px-4 py-2 text-sm hover:brightness-110 disabled:opacity-60"
            >
              {saving ? 'Salvando...' : 'Salvar alterações'}
            </button>
          </div>

          {error && (
            <div className="md:col-span-2 lg:col-span-3 text-xs text-red-400 bg-red-950/40 border border-red-800 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          {success && (
            <div className="md:col-span-2 lg:col-span-3 text-xs text-emerald-400 bg-emerald-950/40 border border-emerald-800 rounded-lg px-3 py-2">
              {success}
            </div>
          )}
        </form>
      )}
    </div>
  )
}

