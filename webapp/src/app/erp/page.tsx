import { prisma } from '@/lib/prisma'

function formatCurrency(v: number) {
  return `R$ ${v.toFixed(2).replace('.', ',')}`
}

export default async function ErpHomePage() {
  const now = new Date()
  const ano = now.getFullYear()
  const mesIndex = now.getMonth() // 0-based
  const mesNumero = String(mesIndex + 1).padStart(2, '0')
  const competenciaAtual = `${ano}-${mesNumero}`

  const startOfMonth = new Date(ano, mesIndex, 1)
  const startOfNextMonth = new Date(ano, mesIndex + 1, 1)
  const hoje = new Date()

  const [
    mediums,
    presencas,
    mensalidadesMes,
    doacoesFinanceiras,
    totalMedios,
    ativos,
    suspensos,
    desligados,
    totalGiras,
    medidasDisciplina,
    produtosEstoque,
    pretendentesCount,
    voluntariosCount,
    turmasCount,
    girasMes,
  
    livrosEmprestados,
    livrosDevolvidos,
    livrosAtrasados,
    livrosPopulares,
] = await Promise.all([
  prisma.medium.findMany({ select: { id: true, nivel: true, status: true } }),
  prisma.presenca.findMany(),
  prisma.mensalidade.findMany({ where: { competencia: competenciaAtual } }),
  prisma.doacao.findMany({ where: { tipo: "FINANCEIRA" } }),
  prisma.medium.count(),
  prisma.medium.count({ where: { status: "ATIVO" } }),
  prisma.medium.count({ where: { status: "SUSPENSO" } }),
  prisma.medium.count({ where: { status: "DESLIGADO" } }),
  prisma.gira.count(),
  prisma.medidaDisciplina.findMany(),
  prisma.produtoEstoque.findMany(),
  prisma.pretendente.count(),
  prisma.voluntario.count(),
  prisma.turmaCursoUmbanda.count(),
  prisma.gira.findMany({
    where: {
      ativa: true,
      data: { gte: startOfMonth, lt: startOfNextMonth },
    },
    orderBy: { data: "asc" },
  }),


  prisma.emprestimoLivro.count({ where: { dataDevolucao: null } }),
  prisma.emprestimoLivro.count({ where: { dataDevolucao: { not: null } } }),
  prisma.emprestimoLivro.count({
    where: { dataDevolucao: null, dataPrevista: { lt: new Date() } },
  }),

  prisma.livro.findMany({
  take: 5,
  orderBy: {
    exemplares: {
      _count: "desc",
    },
  },
  select: {
    id: true,
    titulo: true,
    _count: {
      select: {
        exemplares: true,
      },
    },
  },
}),

]) 
  // Presenças
  const presencasConsideradas = presencas.filter(
    (p) => p.status !== 'AFASTADO',
  )
  const totalSessoesConsideradas = presencasConsideradas.length
  const totalPresencas = presencasConsideradas.filter(
    (p) => p.status === 'PRESENTE',
  ).length
  const totalFaltas = presencasConsideradas.filter(
    (p) =>
      p.status === 'FALTA' || p.status === 'FALTA_JUSTIFICADA',
  ).length

  const taxaPresencaGeral =
    totalSessoesConsideradas > 0
      ? Math.round((totalPresencas / totalSessoesConsideradas) * 100)
      : 0
  const taxaFaltasGeral = 100 - taxaPresencaGeral

  // Financeiro
  const receitaMensalidadesMes = mensalidadesMes
    .filter((m) => m.status === 'Pago')
    .reduce((acc, m) => acc + (Number(m.valor) || 0), 0)

  const receitaDoacoesFinanceiras = doacoesFinanceiras.reduce(
    (acc, d) => acc + (Number(d.valor) || 0),
    0,
  )

  const totalReceitas = receitaMensalidadesMes + receitaDoacoesFinanceiras
  const totalDespesas = 0
  const totalDoadoFinanceiro = receitaDoacoesFinanceiras

  // Níveis de médium
  const niveis = [
    'NIVEL_1_INICIANTE',
    'NIVEL_2_DESENVOLVIMENTO',
    'NIVEL_3_TRABALHO_SEM_CONSULTA',
    'NIVEL_4_TRABALHO_COMPLETO',
    'NIVEL_5_LIDER_SESSAO',
    'NIVEL_6_PAI_MAE_PEQUENA',
    'NIVEL_7_DIRIGENTE_INTERNO',
    'NIVEL_8_DIRIGENTE_GERAL',
  ] as const

  const nivelLabels: Record<(typeof niveis)[number], string> = {
    NIVEL_1_INICIANTE: 'N1 – Iniciante',
    NIVEL_2_DESENVOLVIMENTO: 'N2 – Desenvolvimento',
    NIVEL_3_TRABALHO_SEM_CONSULTA: 'N3 – Sem consulta',
    NIVEL_4_TRABALHO_COMPLETO: 'N4 – Completo',
    NIVEL_5_LIDER_SESSAO: 'N5 – Líder de sessão',
    NIVEL_6_PAI_MAE_PEQUENA: 'N6 – Pai/Mãe Pequena',
    NIVEL_7_DIRIGENTE_INTERNO: 'N7 – Dirigente interno',
    NIVEL_8_DIRIGENTE_GERAL: 'N8 – Dirigente geral',
  }

  const nivelCounts: Record<string, number> = {}
  for (const n of niveis) nivelCounts[n] = 0
  for (const m of mediums) {
    if (m.nivel && nivelCounts[m.nivel] !== undefined) {
      nivelCounts[m.nivel] += 1
    }
  }
  const maxNivelCount =
    Math.max(...Object.values(nivelCounts), 1) || 1

  // Disciplina
  const advertencias = medidasDisciplina.filter(
    (m) => m.tipo === 'ADVERTENCIA',
  ).length
  const suspensoesCount = medidasDisciplina.filter(
    (m) => m.tipo === 'SUSPENSAO',
  ).length
  const expulsoes = medidasDisciplina.filter(
    (m) => m.tipo === 'EXPULSAO',
  ).length

  // Estoque abaixo do mínimo
  const produtosAbaixoMinimo = produtosEstoque.filter((p) => {
    const min =
      p.estoqueMinimo !== null ? Number(p.estoqueMinimo) : null
    const atual = Number(p.quantidadeAtual || 0)
    if (min === null || Number.isNaN(min)) return false
    return atual < min
  }).length

  // Lista de médiuns advertidos
  const advertenciasPorMedium = new Map<
    number,
    { mediumId: number; nome: string; quantidade: number }
  >()

  for (const m of medidasDisciplina.filter(
    (d) => d.tipo === 'ADVERTENCIA',
  )) {
    if (!m.mediumId) continue
    const key = m.mediumId
    if (!advertenciasPorMedium.has(key)) {
      const med = mediums.find((mm) => mm.id === key)
      advertenciasPorMedium.set(key, {
        mediumId: key,
        nome: med?.id ? med.id + ' – ' + (med as any).nome : `Médium ID ${key}`,
        quantidade: 1,
      })
    } else {
      const item = advertenciasPorMedium.get(key)!
      item.quantidade += 1
    }
  }

  const listaAdvertidos = Array.from(advertenciasPorMedium.values()).sort(
    (a, b) => b.quantidade - a.quantidade,
  )

  const mediumsSuspensos = mediums.filter((m) => m.status === 'SUSPENSO')

  // Próximas sessões do mês (a partir de hoje)
  const proximasSessoes = girasMes.filter((g) => g.data >= hoje)

  const cardClass =
    'rounded-xl border border-[#E4E4E7] bg-white shadow-sm p-4'

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold text-slate-900">
          Painel geral da Casa
        </h1>
        <p className="text-sm text-slate-500 max-w-4xl">
          Visão consolidada de médiuns, sessões, disciplina, financeiro,
          doações, estoque, curso de Umbanda e voluntariado.
        </p>
      </div>

      {/* Linha 1: Médiuns / Disciplina / Sessões */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className={cardClass}>
          <h2 className="text-sm font-semibold text-slate-900 mb-2">
            Médiuns
          </h2>
          <p className="text-3xl font-semibold text-slate-900">
            {totalMedios}
          </p>
          <div className="mt-3 text-xs text-slate-500 space-y-1">
            <div>Ativos: {ativos}</div>
            <div>Suspensos: {suspensos}</div>
            <div>Desligados: {desligados}</div>
          </div>
        </div>

        <div className={cardClass}>
          <h2 className="text-sm font-semibold text-slate-900 mb-2">
            Disciplina
          </h2>
          <p className="text-3xl font-semibold text-slate-900">
            {advertencias + suspensoesCount + expulsoes}
          </p>
          <div className="mt-3 text-xs text-slate-500 space-y-1">
            <div>Advertências: {advertencias}</div>
            <div>Suspensões: {suspensoesCount}</div>
            <div>Expulsões: {expulsoes}</div>
          </div>
        </div>

        <div className={cardClass}>
          <h2 className="text-sm font-semibold text-slate-900 mb-2">
            Sessões (giras) & presenças
          </h2>
          <p className="text-3xl font-semibold text-slate-900">
            {totalGiras}
          </p>
          <div className="mt-3 text-xs text-slate-500 space-y-1">
            <div>
              Sessões com presença registrada: {totalSessoesConsideradas}
            </div>
            <div>
              Presenças: {totalPresencas} | Faltas (incl. justificadas):{' '}
              {totalFaltas}
            </div>
          </div>
        </div>
      </div>

      {/* Linha 2: Gráficos principais */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Presenças gerais */}
        <div className={cardClass}>
          <h2 className="text-sm font-semibold text-slate-900 mb-2">
            Presenças gerais
          </h2>
          <p className="text-xs text-slate-500 mb-3">
            Considerando todas as sessões lançadas (excluindo status
            &quot;Afastado&quot;).
          </p>

          <div className="space-y-2">
            <div>
              <div className="flex justify-between text-[11px] text-slate-600 mb-1">
                <span>Presenças: {totalPresencas}</span>
                <span>{taxaPresencaGeral}%</span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500"
                  style={{ width: `${taxaPresencaGeral}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[11px] text-slate-600 mb-1">
                <span>
                  Faltas (incl. justificadas): {totalFaltas}
                </span>
                <span>{taxaFaltasGeral}%</span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-400"
                  style={{ width: `${taxaFaltasGeral}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Financeiro */}
        <div className={cardClass}>
          <h2 className="text-sm font-semibold text-slate-900 mb-2">
            Financeiro – Receitas x Despesas
          </h2>
          <p className="text-xs text-slate-500 mb-3">
            Receitas do mês ({competenciaAtual}): mensalidades pagas +
            doações financeiras. Despesas ainda não estão cadastradas.
          </p>

          <div className="space-y-3 text-xs text-slate-600">
            <div>
              <div className="flex justify-between mb-1">
                <span>Receitas (mês)</span>
                <span>{formatCurrency(totalReceitas)}</span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500"
                  style={{
                    width: totalReceitas > 0 ? '100%' : '0%',
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span>Despesas (mês)</span>
                <span>{formatCurrency(totalDespesas)}</span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-red-500"
                  style={{
                    width: totalDespesas > 0 ? '100%' : '0%',
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Distribuição de níveis */}
        <div className={cardClass}>
          <h2 className="text-sm font-semibold text-slate-900 mb-2">
            Distribuição por nível de médium
          </h2>
          <p className="text-xs text-slate-500 mb-3">
            Quantos médiuns existem em cada nível (1 a 8).
          </p>

          <div className="space-y-1 text-xs text-slate-600">
            {Object.entries(nivelCounts).map(([nivel, count]) => {
              const label = (nivelLabels as any)[nivel] ?? nivel
              const porcent =
                maxNivelCount > 0
                  ? Math.round((Number(count) / maxNivelCount) * 100)
                  : 0

              return (
                <div key={nivel}>
                  <div className="flex justify-between mb-0.5">
                    <span>{label}</span>
                    <span>{count}</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden mb-1">
                    <div
                      className="h-full bg-sky-500"
                      style={{ width: `${porcent}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Linha 3: Curso, Voluntariado, Estoque, Doações */}
      <div className="grid gap-4 lg:grid-cols-4">
        <div className={cardClass}>
          <h2 className="text-sm font-semibold text-slate-900 mb-2">
            Curso de Umbanda
          </h2>
          <p className="text-3xl font-semibold text-slate-900">
            {pretendentesCount}
          </p>
          <p className="mt-2 text-xs text-slate-500">
            Alunos cadastrados. Turmas: {turmasCount}.
          </p>
        </div>

        <div className={cardClass}>
          <h2 className="text-sm font-semibold text-slate-900 mb-2">
            Voluntariado
          </h2>
          <p className="text-3xl font-semibold text-slate-900">
            {voluntariosCount}
          </p>
          <p className="mt-2 text-xs text-slate-500">
            Voluntários atuando em diferentes frentes.
          </p>
        </div>

        <div className={cardClass}>
          <h2 className="text-sm font-semibold text-slate-900 mb-2">
            Estoque
          </h2>
          <p className="text-3xl font-semibold text-slate-900">
            {produtosEstoque.length}
          </p>
          <div className="mt-2 text-xs text-slate-500 space-y-1">
            <div>Itens com controle de estoque.</div>
            <div>
              Abaixo do mínimo:{' '}
              <span className="font-medium text-amber-600">
                {produtosAbaixoMinimo}
              </span>
            </div>
          </div>
        </div>

        <div className={cardClass}>
          <h2 className="text-sm font-semibold text-slate-900 mb-2">
            Doações financeiras
          </h2>
          <p className="text-3xl font-semibold text-slate-900">
            {doacoesFinanceiras.length}
          </p>
          <p className="mt-2 text-xs text-slate-500">
            Total doado: {formatCurrency(totalDoadoFinanceiro)}
          </p>
          <p className="mt-1 text-[11px] text-slate-400">
            Consulte o módulo &quot;Doações&quot; para detalhes.
          </p>
        </div>
      </div>


{/* Linha 3.5: Biblioteca */}
      <div className="grid gap-4 lg:grid-cols-1">
        <div className={cardClass}>
          <h2 className="text-sm font-semibold text-slate-900 mb-2">
            Biblioteca – Estatísticas Gerais
          </h2>

          <div className="grid grid-cols-3 gap-4 text-center text-xs text-slate-600">
            <div>
              <p className="text-2xl font-bold text-emerald-600">
                {livrosEmprestados ?? 0}
              </p>
              <p className="mt-1 text-slate-500">Livros emprestados</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-sky-600">
                {livrosDevolvidos ?? 0}
              </p>
              <p className="mt-1 text-slate-500">Livros devolvidos</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-red-600">
                {livrosAtrasados ?? 0}
              </p>
              <p className="mt-1 text-slate-500">Livros atrasados</p>
            </div>
          </div>

          {livrosPopulares && livrosPopulares.length > 0 && (
            <div className="mt-6 border-t border-slate-200 pt-3">
              <h3 className="text-xs text-slate-500 uppercase mb-2 tracking-wide">
                Livros mais emprestados
              </h3>
              <ul className="text-sm text-slate-700 space-y-1">
                {livrosPopulares.map((l) => (
                  <li
                    key={l.id}
                    className="flex justify-between border-b border-slate-100 last:border-0 py-1"
                  >
                    <span className="truncate max-w-[180px]">{l.titulo}</span>
                    <span className="text-slate-400 text-[11px]">
                      {l._count.emprestimos}x
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Linha 4: Médiuns advertidos e suspensos */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className={cardClass}>
          <h2 className="text-sm font-semibold text-slate-900 mb-2">
            Médiuns com advertências
          </h2>
          {listaAdvertidos.length === 0 ? (
            <p className="text-xs text-slate-500">
              Nenhuma advertência registrada até o momento.
            </p>
          ) : (
            <ul className="space-y-1 text-xs text-slate-600">
              {listaAdvertidos.map((m) => (
                <li
                  key={m.mediumId}
                  className="flex items-center justify-between border-b border-slate-100 last:border-0 py-1"
                >
                  <div>
                    <div className="font-semibold text-slate-900">
                      {m.nome}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {m.quantidade} advertência(s)
                    </div>
                  </div>
                  <a
                    href={`/erp/mediums/${m.mediumId}`}
                    className="rounded-full border border-slate-300 px-3 py-1 text-[11px] text-slate-700 hover:bg-slate-100"
                  >
                    Ver ficha
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className={cardClass}>
          <h2 className="text-sm font-semibold text-slate-900 mb-2">
            Médiuns suspensos
          </h2>
          {mediumsSuspensos.length === 0 ? (
            <p className="text-xs text-slate-500">
              Nenhum médium suspenso no momento.
            </p>
          ) : (
            <ul className="space-y-1 text-xs text-slate-600">
              {mediumsSuspensos.map((m) => (
                <li
                  key={m.id}
                  className="flex items-center justify-between border-b border-slate-100 last:border-0 py-1"
                >
                  <div>
                    <div className="font-semibold text-slate-900">
                      {(m as any).codigo
                        ? `${(m as any).codigo} – ${(m as any).nome}`
                        : (m as any).nome}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Status: Suspenso
                    </div>
                  </div>
                  <a
                    href={`/erp/mediums/${m.id}`}
                    className="rounded-full border border-slate-300 px-3 py-1 text-[11px] text-slate-700 hover:bg-slate-100"
                  >
                    Ver ficha
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Linha 5: Próximas sessões do mês */}
      <div className={cardClass}>
        <h2 className="text-sm font-semibold text-slate-900 mb-2">
          Próximas sessões deste mês
        </h2>
        {proximasSessoes.length === 0 ? (
          <p className="text-xs text-slate-500">
            Não há sessões futuras cadastradas para este mês.
          </p>
        ) : (
          <div className="text-xs text-slate-600 space-y-1">
            {proximasSessoes.map((g) => (
              <div
                key={g.id}
                className="flex items-center justify-between border-b border-slate-100 last:border-0 py-1"
              >
                <div>
                  <div className="font-semibold text-slate-900">
                    {g.data.toLocaleDateString('pt-BR')} – {g.tipo}
                  </div>
                </div>
                <a
                  href={`/erp/sessoes/${g.id}`}
                  className="rounded-full border border-slate-300 px-3 py-1 text-[11px] text-slate-700 hover:bg-slate-100"
                >
                  Ver sessão
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

