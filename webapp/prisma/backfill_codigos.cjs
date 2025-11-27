// prisma/backfill_codigos.cjs
// Preenche códigos para médiums (Mxxx), voluntários (Vxxx) e alunos (Axxx)
// que ainda não possuem código.

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

function formatCodigo(prefixo, numero) {
  return `${prefixo}${String(numero).padStart(3, '0')}`
}

async function backfillMediums() {
  const todos = await prisma.medium.findMany({
    orderBy: { id: 'asc' },
  })

  const semCodigo = todos.filter((m) => !m.codigo || m.codigo === '')

  if (semCodigo.length === 0) {
    console.log('Nenhum médium sem código.')
    return
  }

  console.log(`Encontrados ${semCodigo.length} médiuns sem código.`)

  // Descobre o maior código já existente
  const comCodigo = todos.filter((m) => m.codigo && m.codigo !== '')
  let numeroInicial = 1

  if (comCodigo.length > 0) {
    const ultimo = comCodigo.sort((a, b) =>
      String(a.codigo).localeCompare(String(b.codigo)),
    )[comCodigo.length - 1]
    const numPart = String(ultimo.codigo).replace('M', '')
    const parsed = Number(numPart)
    if (!Number.isNaN(parsed) && parsed >= 1) {
      numeroInicial = parsed + 1
    }
  }

  let count = 0
  for (const m of semCodigo) {
    const codigo = formatCodigo('M', numeroInicial++)
    await prisma.medium.update({
      where: { id: m.id },
      data: { codigo },
    })
    count++
    console.log(`Médium ID ${m.id} atualizado com código ${codigo}`)
  }

  console.log(`Total de médiuns atualizados: ${count}`)
}

async function backfillVoluntarios() {
  const todos = await prisma.voluntario.findMany({
    orderBy: { id: 'asc' },
  })

  const semCodigo = todos.filter((v) => !v.codigo || v.codigo === '')

  if (semCodigo.length === 0) {
    console.log('Nenhum voluntário sem código.')
    return
  }

  console.log(`Encontrados ${semCodigo.length} voluntários sem código.`)

  const comCodigo = todos.filter((v) => v.codigo && v.codigo !== '')
  let numeroInicial = 1

  if (comCodigo.length > 0) {
    const ultimo = comCodigo.sort((a, b) =>
      String(a.codigo).localeCompare(String(b.codigo)),
    )[comCodigo.length - 1]
    const numPart = String(ultimo.codigo).replace('V', '')
    const parsed = Number(numPart)
    if (!Number.isNaN(parsed) && parsed >= 1) {
      numeroInicial = parsed + 1
    }
  }

  let count = 0
  for (const v of semCodigo) {
    const codigo = formatCodigo('V', numeroInicial++)
    await prisma.voluntario.update({
      where: { id: v.id },
      data: { codigo },
    })
    count++
    console.log(`Voluntário ID ${v.id} atualizado com código ${codigo}`)
  }

  console.log(`Total de voluntários atualizados: ${count}`)
}

async function backfillAlunos() {
  const todos = await prisma.pretendente.findMany({
    orderBy: { id: 'asc' },
  })

  const semCodigo = todos.filter((a) => !a.codigo || a.codigo === '')

  if (semCodigo.length === 0) {
    console.log('Nenhum aluno (pretendente) sem código.')
    return
  }

  console.log(`Encontrados ${semCodigo.length} alunos sem código.`)

  const comCodigo = todos.filter((a) => a.codigo && a.codigo !== '')
  let numeroInicial = 1

  if (comCodigo.length > 0) {
    const ultimo = comCodigo.sort((a, b) =>
      String(a.codigo).localeCompare(String(b.codigo)),
    )[comCodigo.length - 1]
    const numPart = String(ultimo.codigo).replace('A', '')
    const parsed = Number(numPart)
    if (!Number.isNaN(parsed) && parsed >= 1) {
      numeroInicial = parsed + 1
    }
  }

  let count = 0
  for (const a of semCodigo) {
    const codigo = formatCodigo('A', numeroInicial++)
    await prisma.pretendente.update({
      where: { id: a.id },
      data: { codigo },
    })
    count++
    console.log(`Aluno ID ${a.id} atualizado com código ${codigo}`)
  }

  console.log(`Total de alunos atualizados: ${count}`)
}

async function main() {
  console.log('Iniciando backfill de códigos...')
  await backfillMediums()
  await backfillVoluntarios()
  await backfillAlunos()
  console.log('Backfill concluído.')
}

main()
  .catch((e) => {
    console.error('Erro no backfill:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

