import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'

type PageProps = {
  params: Promise<{ id: string }>
}

function nivelLabel(value: string | null) {
  if (!value) return '-'
  switch (value) {
    case 'NIVEL_1_INICIANTE':
      return '1 – Iniciante'
    case 'NIVEL_2_DESENVOLVIMENTO':
      return '2 – Desenvolvimento'
    case 'NIVEL_3_TRABALHO_SEM_CONSULTA':
      return '3 – Trabalho sem consulta'
    case 'NIVEL_4_TRABALHO_COMPLETO':
      return '4 – Trabalho completo'
    case 'NIVEL_5_LIDER_SESSAO':
      return '5 – Líder de sessão'
    case 'NIVEL_6_PAI_MAE_PEQUENA':
      return '6 – Pai/Mãe Pequena'
    case 'NIVEL_7_DIRIGENTE_INTERNO':
      return '7 – Dirigente interno'
    case 'NIVEL_8_DIRIGENTE_GERAL':
      return '8 – Dirigente geral'
    default:
      return value
  }
}

function statusLabel(value: string | null) {
  if (!value) return '-'
  switch (value) {
    case 'ATIVO':
      return 'Ativo'
    case 'AFASTADO':
      return 'Afastado'
    case 'SUSPENSO':
      return 'Suspenso'
    case 'DESLIGADO':
      return 'Desligado'
    default:
      return value
  }
}

function formatDate(date: string | Date | null | undefined) {
  if (!date) return '-'
  const d = typeof date === 'string' ? new Date(date) : date
  if (Number.isNaN(d.getTime())) return '-'
  return d.toLocaleDateString('pt-BR')
}

export default async function MediumFichaPage(props: PageProps) {
  const { id: idStr } = await props.params
  const id = Number(idStr)
  if (Number.isNaN(id)) notFound()

  const medium = await prisma.medium.findUnique({
    where: { id },
    include: {
      presencas: {
        include: { gira: true },
      },
      iniciacoes: true,
      medidasDisciplina: {
        orderBy: { dataCriacao: 'desc' },
      },
      mensalidades: true,
      doacoes: true,
      emprestimos: {
        include: {
          exemplar: {
            include: {
              livro: true,
            },
          },
        },
      },
      voluntarios: true,
      palestranteTemas: true,
      palestrasMinistradas: true,
    },
  })

  if (!medium) notFound()

  // Presenças / faltas para alertas
  const presencasConsideradas = medium.presencas.filter(
    (p) => p.status !== 'AFASTADO',
  )
  const totalConsiderado = presencasConsideradas.length
  const presencasValidas = presencasConsideradas.filter(
    (p) => p.status === 'PRESENTE',
  )
  const faltas = presencasConsideradas.filter(
    (p) =>
      p.status === 'FALTA' || p.status === 'FALTA_JUSTIFICADA',
  )

  const taxaPresenca =
    totalConsiderado > 0
      ? Math.round((presencasValidas.length / totalConsiderado) * 100)
      : 0

  let faixaFalta: 'nenhuma' | '25' | '50' = 'nenhuma'
  if (totalConsiderado >= 10) {
    const proporcaoFaltas = faltas.length / totalConsiderado
    if (proporcaoFaltas >= 0.5) faixaFalta = '50'
    else if (proporcaoFaltas >= 0.25) faixaFalta = '25'
  }

  const cardClass =
    'rounded-xl border border-[#E4E4E7] bg-white shadow-sm p-4'

  const temDisciplina = medium.medidasDisciplina.length > 0

  return (
    <div className="space-y-6">
      {/* CABEÇALHO */}
      <div className={cardClass}>
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold text-slate-900">
              {medium.codigo
                ? `${medium.codigo} – ${medium.nome}`
                : medium.nome}
            </h1>

            {/* ALERTAS DE FALTAS */}
            {faixaFalta === '25' && (
              <div className="rounded-md border border-yellow-400 bg-yellow-50 px-3 py-2 text-xs text-yellow-900">
                Atenção, você está com 25% de faltas.
              </div>
            )}
            {faixaFalta === '50' && (
              <div className="rounded-md border border-red-500 bg-red-50 px-3 py-2 text-xs text-red-900">
                Atenção – Você está prestes a ser removido da corrente.
                Procure a Direção urgente.
              </div>
            )}

            {/* ALERTA DISCIPLINAR RESUMO */}
            {temDisciplina && (
              <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-[11px] text-slate-700">
                <div className="font-semibold text-slate-900 mb-1">
                  Histórico disciplinar
                </div>
                <div className="space-y-1">
                  {medium.medidasDisciplina.slice(0, 3).map((m) => (
                    <div
                      key={m.id}
                      className="flex justify-between gap-3"
                    >
                      <span>
                        {formatDate(m.dataCriacao)} –{' '}
                        {m.tipo === 'ADVERTENCIA'
                          ? 'Advertência'
                          : m.tipo === 'SUSPENSAO'
                          ? 'Suspensão'
                          : 'Expulsão'}
                      </span>
                      <span className="text-slate-500">{m.status}</span>
                    </div>
                  ))}
                  {medium.medidasDisciplina.length > 3 && (
                    <div className="text-[10px] text-slate-500">
                      (+{' '}
                      {medium.medidasDisciplina.length - 3}
                      {' '}registro(s) na tabela de Disciplina abaixo)
                    </div>
                  )}
                </div>
              </div>
            )}

            <p className="text-sm text-slate-500 max-w-2xl">
              Ficha completa do médium – visão pessoal, espiritual, de
              presenças, disciplina, financeiro, biblioteca e atuação na casa.
            </p>
          </div>

          <div className="flex flex-col items-start md:items-end gap-2 text-xs text-slate-600">
            <div className="space-y-1 text-right">
              <div>
                <span className="font-semibold text-slate-900">
                  Nível:{' '}
                </span>
                {nivelLabel(medium.nivel || null)}
              </div>
              <div>
                <span className="font-semibold text-slate-900">
                  Status:{' '}
                </span>
                {statusLabel(medium.status || null)}
              </div>
              <div>
                <span className="font-semibold text-slate-900">
                  Entrada:{' '}
                </span>
                {formatDate(medium.dataEntrada)}
              </div>
            </div>

            <div className="flex gap-2">
              <a
                href={`/erp/mediums/${medium.id}/editar`}
                className="rounded-full border border-slate-300 bg-white px-3 py-1 text-[11px] text-slate-700 hover:bg-slate-100"
              >
                Editar ficha
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* CARDS RESUMO */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className={cardClass}>
          <div className="text-xs text-slate-500">
            Presença em gira
          </div>
          <div className="text-2xl font-semibold text-slate-900 mt-1">
            {taxaPresenca}%
          </div>
          <div className="mt-2 text-[11px] text-slate-500">
            {presencasValidas.length} presenças / {totalConsiderado}{' '}
            sessões consideradas
          </div>
        </div>

        <div className={cardClass}>
          <div className="text-xs text-slate-500">Disciplina</div>
          <div className="text-2xl font-semibold text-slate-900 mt-1">
            {medium.medidasDisciplina.length}
          </div>
          <div className="mt-2 text-[11px] text-slate-500">
            Advertências, suspensões e expulsões registradas.
          </div>
        </div>

        <div className={cardClass}>
          <div className="text-xs text-slate-500">Mensalidades</div>
          <div className="text-2xl font-semibold text-slate-900 mt-1">
            {medium.mensalidades.length}
          </div>
          <div className="mt-2 text-[11px] text-slate-500">
            Lançamentos financeiros vinculados ao médium.
          </div>
        </div>

        <div className={cardClass}>
          <div className="text-xs text-slate-500">Biblioteca</div>
          <div className="text-2xl font-semibold text-slate-900 mt-1">
            {medium.emprestimos.length}
          </div>
          <div className="mt-2 text-[11px] text-slate-500">
            Empréstimos de livros feitos na casa.
          </div>
        </div>
      </div>

      {/* GRID PRINCIPAL */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* COLUNA 1 – Dados pessoais, saúde, espiritual */}
        <div className="space-y-4 lg:col-span-1">
          {/* Dados pessoais */}
          <div className={cardClass}>
            <h2 className="text-sm font-semibold text-slate-900 mb-3">
              Dados pessoais
            </h2>
            <div className="space-y-1 text-xs text-slate-600">
              <div>
                <span className="font-semibold text-slate-900">
                  Nascimento:{' '}
                </span>
                {formatDate(medium.dataNascimento)}
              </div>
              <div>
                <span className="font-semibold text-slate-900">
                  E-mail:{' '}
                </span>
                {medium.email || '-'}
              </div>
              <div>
                <span className="font-semibold text-slate-900">
                  Telefone:{' '}
                </span>
                {medium.telefone || '-'}
              </div>
              <div>
                <span className="font-semibold text-slate-900">
                  Profissão:{' '}
                </span>
                {medium.profissao || '-'}
              </div>
              <div>
                <span className="font-semibold text-slate-900">
                  Escolaridade:{' '}
                </span>
                {medium.escolaridade || '-'}
              </div>
              <div>
                <span className="font-semibold text-slate-900">
                  Estado civil:{' '}
                </span>
                {medium.estadoCivil || '-'}
              </div>
              <div>
                <span className="font-semibold text-slate-900">
                  Filiação:{' '}
                </span>
                {medium.filiacao || '-'}
              </div>
            </div>
          </div>

          {/* Saúde */}
          <div className={cardClass}>
            <h2 className="text-sm font-semibold text-slate-900 mb-3">
              Saúde
            </h2>
            <div className="space-y-1 text-xs text-slate-600">
              <div>
                <span className="font-semibold text-slate-900">
                  Doenças:{' '}
                </span>
                {medium.doencas || '-'}
              </div>
              <div>
                <span className="font-semibold text-slate-900">
                  Medicações:{' '}
                </span>
                {medium.medicacoes || '-'}
              </div>
              <div>
                <span className="font-semibold text-slate-900">
                  Alergias:{' '}
                </span>
                {medium.alergias || '-'}
              </div>
              <div>
                <span className="font-semibold text-slate-900">
                  Obs. saúde:{' '}
                </span>
                {medium.observacoesSaude || '-'}
              </div>
            </div>
          </div>

          {/* Caminho espiritual */}
          <div className={cardClass}>
            <h2 className="text-sm font-semibold text-slate-900 mb-3">
              Caminho espiritual
            </h2>
            <div className="space-y-1 text-xs text-slate-600">
              <div>
                <span className="font-semibold text-slate-900">
                  Casa anterior:{' '}
                </span>
                {medium.casaAnterior || '-'}
              </div>
              <div>
                <span className="font-semibold text-slate-900">
                  Orixá(s) de cabeça:{' '}
                </span>
                {medium.orixasCabeca || '-'}
              </div>
              <div>
                <span className="font-semibold text-slate-900">
                  Guia chefe:{' '}
                </span>
                {medium.nomeGuiaChefe || '-'}
              </div>
              <div>
                <span className="font-semibold text-slate-900">
                  Padrinho/Madrinha:{' '}
                </span>
                {medium.padrinhoMadrinha || '-'}
              </div>
              <div>
                <span className="font-semibold text-slate-900">
                  Obs. direção:{' '}
                </span>
                {medium.observacoesDirecao || '-'}
              </div>
            </div>
          </div>
        </div>

        {/* COLUNA 2 – Presenças & Iniciações */}
        <div className="space-y-4 lg:col-span-1">
          {/* Presenças */}
          <div className={cardClass}>
            <h2 className="text-sm font-semibold text-slate-900 mb-3">
              Presenças em gira
            </h2>
            {medium.presencas.length === 0 ? (
              <p className="text-xs text-slate-500">
                Nenhum registro de presença em gira.
              </p>
            ) : (
              <div className="max-h-64 overflow-y-auto text-xs text-slate-600">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-500">
                      <th className="text-left py-1 pr-2">Data</th>
                      <th className="text-left py-1 pr-2">Tipo</th>
                      <th className="text-left py-1 pr-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {medium.presencas.map((p) => (
                      <tr
                        key={p.id}
                        className="border-b border-slate-100 last:border-0"
                      >
                        <td className="py-1 pr-2">
                          {p.gira ? formatDate(p.gira.data) : '-'}
                        </td>
                        <td className="py-1 pr-2">
                          {p.gira ? p.gira.tipo : '-'}
                        </td>
                        <td className="py-1 pr-2">{p.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Iniciações */}
          <div className={cardClass}>
            <h2 className="text-sm font-semibold text-slate-900 mb-3">
              Iniciações
            </h2>
            {medium.iniciacoes.length === 0 ? (
              <p className="text-xs text-slate-500">
                Nenhuma iniciação registrada.
              </p>
            ) : (
              <div className="max-h-64 overflow-y-auto text-xs text-slate-600">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-500">
                      <th className="text-left py-1 pr-2">Data</th>
                      <th className="text-left py-1 pr-2">Tipo</th>
                      <th className="text-left py-1 pr-2">Observações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {medium.iniciacoes.map((i) => (
                      <tr
                        key={i.id}
                        className="border-b border-slate-100 last:border-0"
                      >
                        <td className="py-1 pr-2">
                          {formatDate(i.data)}
                        </td>
                        <td className="py-1 pr-2">{i.tipo}</td>
                        <td className="py-1 pr-2">
                          {i.observacoes || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* COLUNA 3 – Disciplina, financeiro, biblioteca, voluntariado & palestras */}
        <div className="space-y-4 lg:col-span-1">
          {/* Disciplina */}
          <div className={cardClass}>
            <h2 className="text-sm font-semibold text-slate-900 mb-3">
              Disciplina
            </h2>
            {medium.medidasDisciplina.length === 0 ? (
              <p className="text-xs text-slate-500">
                Nenhuma medida disciplinar registrada.
              </p>
            ) : (
              <div className="max-h-48 overflow-y-auto text-xs text-slate-600">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-500">
                      <th className="text-left py-1 pr-2">Data</th>
                      <th className="text-left py-1 pr-2">Tipo</th>
                      <th className="text-left py-1 pr-2">Status</th>
                      <th className="text-left py-1 pr-2">Motivo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {medium.medidasDisciplina.map((m) => (
                      <tr
                        key={m.id}
                        className="border-b border-slate-100 last:border-0"
                      >
                        <td className="py-1 pr-2">
                          {formatDate(m.dataCriacao)}
                        </td>
                        <td className="py-1 pr-2">
                          {m.tipo === 'ADVERTENCIA'
                            ? 'Advertência'
                            : m.tipo === 'SUSPENSAO'
                            ? 'Suspensão'
                            : 'Expulsão'}
                        </td>
                        <td className="py-1 pr-2">{m.status}</td>
                        <td className="py-1 pr-2 max-w-xs">
                          <span className="line-clamp-2">
                            {m.motivo || '-'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Financeiro */}
          <div className={cardClass}>
            <h2 className="text-sm font-semibold text-slate-900 mb-3">
              Financeiro (resumo)
            </h2>
            <div className="text-xs text-slate-600 space-y-1">
              <div>
                <span className="font-semibold text-slate-900">
                  Mensalidades:{' '}
                </span>
                {medium.mensalidades.length}
              </div>
              <div>
                <span className="font-semibold text-slate-900">
                  Doações:{' '}
                </span>
                {medium.doacoes.length}
              </div>
            </div>
          </div>

          {/* Biblioteca */}
          <div className={cardClass}>
            <h2 className="text-sm font-semibold text-slate-900 mb-3">
              Biblioteca
            </h2>
            {medium.emprestimos.length === 0 ? (
              <p className="text-xs text-slate-500">
                Nenhum empréstimo registrado.
              </p>
            ) : (
              <div className="max-h-40 overflow-y-auto text-xs text-slate-600">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-500">
                      <th className="text-left py-1 pr-2">Livro</th>
                      <th className="text-left py-1 pr-2">Saída</th>
                      <th className="text-left py-1 pr-2">Devolução</th>
                    </tr>
                  </thead>
                  <tbody>
                    {medium.emprestimos.map((e) => (
                      <tr
                        key={e.id}
                        className="border-b border-slate-100 last:border-0"
                      >
                        <td className="py-1 pr-2">
                          {e.exemplar?.livro?.titulo || '-'}
                        </td>
                        <td className="py-1 pr-2">
                          {formatDate(e.dataSaida)}
                        </td>
                        <td className="py-1 pr-2">
                          {formatDate(e.dataDevolucao)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Voluntariado & Palestras */}
          <div className={cardClass}>
            <h2 className="text-sm font-semibold text-slate-900 mb-3">
              Voluntariado & Palestras
            </h2>
            <div className="text-xs text-slate-600 space-y-1">
              <div>
                <span className="font-semibold text-slate-900">
                  Registros de voluntariado:{' '}
                </span>
                {medium.voluntarios.length}
              </div>
              <div>
                <span className="font-semibold text-slate-900">
                  Temas de palestrante:{' '}
                </span>
                {medium.palestranteTemas.length}
              </div>
              <div>
                <span className="font-semibold text-slate-900">
                  Palestras ministradas:{' '}
                </span>
                {medium.palestrasMinistradas.length}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

