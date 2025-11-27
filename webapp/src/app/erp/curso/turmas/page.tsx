'use client'

import { useEffect, useState } from 'react'

type Turma = {
  id: number
  codigo: string | null
  nome: string
  cursoNome: string
  dataInicio: string | null
  dataPrevistaFim: string | null
  dataRealFim: string | null
  diaDaSemana: string | null
  observacoes: string | null
}

type Pretendente = {
  id: number
  codigo: string | null
  nome: string
  dataNascimento: string | null
}

type Matricula = {
  id: number
  pretendenteId: number
  turmaId: number
  dataInicio: string | null
  statusCurso: string
  etapaParou: string | null
  observacoes: string | null
  resultadoFinal: string | null
  pretendente: {
    id: number
    codigo: string | null
    nome: string
  }
}

type TurmaForm = {
  nome: string
  cursoNome: string
  dataInicio: string
  dataPrevistaFim: string
  diaDaSemana: string
  observacoes: string
}

type MatriculaForm = {
  pretendenteId: string
}

function formatDate(date: string | null) {
  if (!date) return '-'
  const d = new Date(date)
  if (Number.isNaN(d.getTime())) return '-'
  return d.toLocaleDateString('pt-BR')
}

export default function TurmasCursoPage() {
  const [turmas, setTurmas] = useState<Turma[]>([])
  const [turmaSelecionada, setTurmaSelecionada] = useState<Turma | null>(
    null,
  )
  const [alunosElegiveis, setAlunosElegiveis] = useState<Pretendente[]>([])
  const [matriculas, setMatriculas] = useState<Matricula[]>([])

  const [loadingTurmas, setLoadingTurmas] = useState(true)
  const [loadingDetalhes, setLoadingDetalhes] = useState(false)
  const [savingTurma, setSavingTurma] = useState(false)
  const [savingMatricula, setSavingMatricula] = useState(false)

  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const [turmaForm, setTurmaForm] = useState<TurmaForm>({
    nome: '',
    cursoNome: 'Curso Básico de Umbanda',
    dataInicio: '',
    dataPrevistaFim: '',
    diaDaSemana: 'Sábado',
    observacoes: '',
  })

  const [matriculaForm, setMatriculaForm] = useState<MatriculaForm>({
    pretendenteId: '',
  })

  async function loadTurmas() {
    setLoadingTurmas(true)
    setError(null)
    try {
      const res = await fetch('/api/curso/turmas')
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Erro ao carregar turmas.')
        setLoadingTurmas(false)
        return
      }
      setTurmas(data)
      if (data.length > 0 && !turmaSelecionada) {
        setTurmaSelecionada(data[0])
      }
    } catch (e: any) {
      console.error(e)
      setError(e.message || 'Erro ao carregar turmas.')
    } finally {
      setLoadingTurmas(false)
    }
  }

  async function loadDetalhesTurma(turma: Turma) {
    if (!turma) return
    setLoadingDetalhes(true)
    setError(null)
    setSuccess(null)
    try {
      // Alunos elegíveis (não em curso e nem concluído)
      const resAlunos = await fetch(
        `/api/curso/turmas/${turma.id}/alunos-elegiveis`,
      )
      const dataAlunos = await resAlunos.json()
      if (!resAlunos.ok) {
        setError(dataAlunos.error || 'Erro ao carregar alunos elegíveis.')
        setLoadingDetalhes(false)
        return
      }
      setAlunosElegiveis(dataAlunos)

      // Matrículas existentes da turma
      const resMatriculas = await fetch(
        `/api/curso/turmas/${turma.id}/matriculas`,
      )
      const dataMatriculas = await resMatriculas.json()
      if (!resMatriculas.ok) {
        setError(
          dataMatriculas.error || 'Erro ao carregar matrículas da turma.',
        )
        setLoadingDetalhes(false)
        return
      }
      setMatriculas(dataMatriculas)

      // Ajusta formulário de matrícula para primeiro elegível
      if (dataAlunos.length > 0) {
        setMatriculaForm({
          pretendenteId: String(dataAlunos[0].id),
        })
      } else {
        setMatriculaForm({
          pretendenteId: '',
        })
      }
    } catch (e: any) {
      console.error(e)
      setError(e.message || 'Erro ao carregar detalhes da turma.')
    } finally {
      setLoadingDetalhes(false)
    }
  }

  useEffect(() => {
    loadTurmas()
  }, [])

  useEffect(() => {
    if (turmaSelecionada) {
      loadDetalhesTurma(turmaSelecionada)
    }
  }, [turmaSelecionada?.id])

  async function handleSubmitTurma(e: React.FormEvent) {
    e.preventDefault()
    if (!turmaForm.nome.trim() || !turmaForm.cursoNome.trim()) {
      setError('Nome da turma e nome do curso são obrigatórios.')
      return
    }

    setSavingTurma(true)
    setError(null)
    setSuccess(null)

    try {
      const res = await fetch('/api/curso/turmas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(turmaForm),
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Erro ao criar turma.')
        setSavingTurma(false)
        return
      }

      setSuccess('Turma criada com sucesso.')
      setTurmaForm((prev) => ({
        ...prev,
        nome: '',
        dataInicio: '',
        dataPrevistaFim: '',
        observacoes: '',
      }))
      await loadTurmas()
      setTurmaSelecionada(data)
    } catch (e: any) {
      console.error(e)
      setError(e.message || 'Erro ao criar turma.')
    } finally {
      setSavingTurma(false)
    }
  }

  async function handleSubmitMatricula(e: React.FormEvent) {
    e.preventDefault()
    if (!turmaSelecionada) return
    if (!matriculaForm.pretendenteId) {
      setError('Selecione um aluno para matricular.')
      return
    }

    setSavingMatricula(true)
    setError(null)
    setSuccess(null)

    try {
      const res = await fetch(
        `/api/curso/turmas/${turmaSelecionada.id}/matriculas`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            pretendenteId: Number(matriculaForm.pretendenteId),
          }),
        },
      )

      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Erro ao matricular aluno.')
        setSavingMatricula(false)
        return
      }

      setSuccess('Aluno matriculado com sucesso.')
      await loadDetalhesTurma(turmaSelecionada)
    } catch (e: any) {
      console.error(e)
      setError(e.message || 'Erro ao matricular aluno.')
    } finally {
      setSavingMatricula(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-50">
          Turmas do Curso de Umbanda
        </h2>
        <p className="text-sm text-slate-400 mt-1 max-w-3xl">
          Crie turmas com códigos T001, T002... e matricule alunos elegíveis.
          Alunos em curso ou já concluídos não aparecem no dropdown de
          matrícula.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[360px,minmax(0,1fr)]">
        {/* Formulário de nova turma */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
          <h3 className="text-sm font-semibold text-slate-100 mb-3">
            Nova turma
          </h3>

          <form
            onSubmit={handleSubmitTurma}
            className="space-y-3 text-xs"
          >
            <div>
              <label className="block text-[11px] text-slate-300 mb-1">
                Nome da turma *
              </label>
              <input
                type="text"
                value={turmaForm.nome}
                onChange={(e) =>
                  setTurmaForm((prev) => ({
                    ...prev,
                    nome: e.target.value,
                  }))
                }
                placeholder="Ex.: Curso 2025.1"
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-50"
              />
            </div>

            <div>
              <label className="block text-[11px] text-slate-300 mb-1">
                Nome do curso *
              </label>
              <input
                type="text"
                value={turmaForm.cursoNome}
                onChange={(e) =>
                  setTurmaForm((prev) => ({
                    ...prev,
                    cursoNome: e.target.value,
                  }))
                }
                placeholder="Ex.: Curso Básico de Umbanda"
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-50"
              />
            </div>

            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block text-[11px] text-slate-300 mb-1">
                  Data de início
                </label>
                <input
                  type="date"
                  value={turmaForm.dataInicio}
                  onChange={(e) =>
                    setTurmaForm((prev) => ({
                      ...prev,
                      dataInicio: e.target.value,
                    }))
                  }
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-50"
                />
              </div>

              <div className="flex-1">
                <label className="block text-[11px] text-slate-300 mb-1">
                  Data prevista de fim
                </label>
                <input
                  type="date"
                  value={turmaForm.dataPrevistaFim}
                  onChange={(e) =>
                    setTurmaForm((prev) => ({
                      ...prev,
                      dataPrevistaFim: e.target.value,
                    }))
                  }
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-50"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] text-slate-300 mb-1">
                Dia da semana
              </label>
              <input
                type="text"
                value={turmaForm.diaDaSemana}
                onChange={(e) =>
                  setTurmaForm((prev) => ({
                    ...prev,
                    diaDaSemana: e.target.value,
                  }))
                }
                placeholder="Ex.: Sábado"
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-50"
              />
            </div>

            <div>
              <label className="block text-[11px] text-slate-300 mb-1">
                Observações
              </label>
              <textarea
                rows={3}
                value={turmaForm.observacoes}
                onChange={(e) =>
                  setTurmaForm((prev) => ({
                    ...prev,
                    observacoes: e.target.value,
                  }))
                }
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-50"
              />
            </div>

            <button
              type="submit"
              disabled={savingTurma}
              className="w-full rounded-lg bg-emerald-500 text-emerald-950 font-semibold py-1.5 text-xs hover:brightness-110 disabled:opacity-60"
            >
              {savingTurma ? 'Salvando...' : 'Cadastrar turma'}
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

        {/* Lista de turmas + detalhe da turma selecionada */}
        <div className="space-y-4">
          {/* Lista de turmas */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
            <h3 className="text-sm font-semibold text-slate-100 mb-3">
              Turmas existentes
            </h3>
            {loadingTurmas ? (
              <p className="text-xs text-slate-400">Carregando...</p>
            ) : turmas.length === 0 ? (
              <p className="text-xs text-slate-400">
                Nenhuma turma cadastrada ainda.
              </p>
            ) : (
              <ul className="space-y-1 text-xs">
                {turmas.map((t) => (
                  <li key={t.id}>
                    <button
                      type="button"
                      onClick={() => setTurmaSelecionada(t)}
                      className={`w-full text-left rounded-lg border px-2 py-1.5 ${
                        turmaSelecionada?.id === t.id
                          ? 'border-emerald-500 bg-emerald-500/10 text-emerald-200'
                          : 'border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800'
                      }`}
                    >
                      <div className="font-semibold">
                        {t.codigo ? `${t.codigo} – ` : ''}
                        {t.nome}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {t.cursoNome}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Início: {formatDate(t.dataInicio)} • Prev. fim:{' '}
                        {formatDate(t.dataPrevistaFim)} • {t.diaDaSemana || ''}
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Detalhe da turma selecionada */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
            {turmaSelecionada ? (
              <>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-100">
                      Detalhes da turma
                    </h3>
                    <div className="text-xs text-slate-300 mt-1">
                      <div>
                        <span className="font-semibold text-slate-200">
                          Turma:{' '}
                        </span>
                        {turmaSelecionada.codigo
                          ? `${turmaSelecionada.codigo} – ${turmaSelecionada.nome}`
                          : turmaSelecionada.nome}
                      </div>
                      <div>
                        <span className="font-semibold text-slate-200">
                          Curso:{' '}
                        </span>
                        {turmaSelecionada.cursoNome}
                      </div>
                      <div>
                        <span className="font-semibold text-slate-200">
                          Período:{' '}
                        </span>
                        {formatDate(turmaSelecionada.dataInicio)}{' '}
                        {' → '}
                        {formatDate(turmaSelecionada.dataPrevistaFim)}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  {/* Matricular aluno */}
                  <div>
                    <h4 className="text-xs font-semibold text-slate-200 mb-2">
                      Matricular aluno
                    </h4>
                    {loadingDetalhes ? (
                      <p className="text-[11px] text-slate-400">
                        Carregando alunos elegíveis...
                      </p>
                    ) : alunosElegiveis.length === 0 ? (
                      <p className="text-[11px] text-slate-400">
                        Não há alunos elegíveis (ou todos já estão em curso /
                        concluíram).
                      </p>
                    ) : (
                      <form
                        onSubmit={handleSubmitMatricula}
                        className="space-y-2 text-xs"
                      >
                        <div>
                          <label className="block text-[11px] text-slate-300 mb-1">
                            Aluno
                          </label>
                          <select
                            value={matriculaForm.pretendenteId}
                            onChange={(e) =>
                              setMatriculaForm({
                                pretendenteId: e.target.value,
                              })
                            }
                            className="w-full rounded-lg border border-slate-700 bg-slate-900 px-2 py-1.5 text-slate-50"
                          >
                            {alunosElegiveis.map((a) => (
                              <option key={a.id} value={a.id}>
                                {a.codigo
                                  ? `${a.codigo} – ${a.nome}`
                                  : a.nome}{' '}
                                ({formatDate(a.dataNascimento)})
                              </option>
                            ))}
                          </select>
                        </div>

                        <button
                          type="submit"
                          disabled={savingMatricula}
                          className="w-full rounded-lg bg-emerald-500 text-emerald-950 font-semibold py-1.5 text-xs hover:brightness-110 disabled:opacity-60"
                        >
                          {savingMatricula
                            ? 'Matriculando...'
                            : 'Matricular aluno'}
                        </button>
                      </form>
                    )}
                  </div>

                  {/* Lista de matriculados */}
                  <div>
                    <h4 className="text-xs font-semibold text-slate-200 mb-2">
                      Alunos desta turma
                    </h4>
                    {matriculas.length === 0 ? (
                      <p className="text-[11px] text-slate-400">
                        Nenhum aluno matriculado nesta turma ainda.
                      </p>
                    ) : (
                      <div className="max-h-56 overflow-y-auto text-xs text-slate-300">
                        <table className="min-w-full">
                          <thead>
                            <tr className="border-b border-slate-800 text-slate-400">
                              <th className="text-left py-1 pr-2">Aluno</th>
                              <th className="text-left py-1 pr-2">Início</th>
                              <th className="text-left py-1 pr-2">Status</th>
                              <th className="text-left py-1 pr-2">
                                Resultado
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {matriculas.map((m) => (
                              <tr
                                key={m.id}
                                className="border-b border-slate-800/50 last:border-0"
                              >
                                <td className="py-1 pr-2">
                                  {m.pretendente.codigo
                                    ? `${m.pretendente.codigo} – ${m.pretendente.nome}`
                                    : m.pretendente.nome}
                                </td>
                                <td className="py-1 pr-2">
                                  {formatDate(m.dataInicio)}
                                </td>
                                <td className="py-1 pr-2">
                                  {m.statusCurso}
                                </td>
                                <td className="py-1 pr-2">
                                  {m.resultadoFinal || '-'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <p className="text-xs text-slate-400">
                Selecione uma turma na lista ao lado para ver detalhes e
                matricular alunos.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

