// scripts/lembrar_sessoes.cjs
// Envia e-mails de lembrete 3 dias antes de cada sessão (Gira)
// para todos os médiuns ATIVOS com e-mail cadastrado.

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const nodemailer = require('nodemailer')

const {
  SMTP_HOST,
  SMTP_PORT,
  SMTP_USER,
  SMTP_PASS,
  SMTP_FROM,
} = process.env

const mailer = nodemailer.createTransport({
  host: SMTP_HOST,
  port: Number(SMTP_PORT || 587),
  secure: false,
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS,
  },
})

async function enviarEmail(para, assunto, html) {
  if (!SMTP_FROM) {
    console.error('SMTP_FROM não definido. E-mail não enviado.')
    return
  }

  await mailer.sendMail({
    from: SMTP_FROM,
    to: para,
    subject: assunto,
    html,
  })
}

function startOfDay(date) {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

function endOfDay(date) {
  const d = new Date(date)
  d.setHours(23, 59, 59, 999)
  return d
}

async function main() {
  console.log('Iniciando envio de lembretes de sessões (D+3)...')

  const hoje = new Date()
  const alvo = new Date(hoje)
  alvo.setDate(hoje.getDate() + 3)

  const inicio = startOfDay(alvo)
  const fim = endOfDay(alvo)

  const giras = await prisma.gira.findMany({
    where: {
      ativa: true,
      data: {
        gte: inicio,
        lte: fim,
      },
    },
    include: {
      dirigente: true,
      guiaChefe: true,
    },
  })

  if (giras.length === 0) {
    console.log('Não há sessões para daqui a 3 dias.')
    return
  }

  // médiuns ativos com e-mail
  const mediums = await prisma.medium.findMany({
    where: {
      status: 'ATIVO',
      email: { not: null },
    },
  })

  if (mediums.length === 0) {
    console.log('Não há médiuns ativos com e-mail cadastrado.')
    return
  }

  for (const gira of giras) {
    const dataStr = gira.data.toLocaleDateString('pt-BR')
    const tipoStr = gira.tipo

    const blocoDirigente = gira.dirigente
      ? `<p>Dirigente espiritual: <strong>${gira.dirigente.nome}</strong></p>`
      : ''

    const blocoGuia = gira.guiaChefe
      ? `<p>Guia chefe: <strong>${gira.guiaChefe.nome}</strong> (${gira.guiaChefe.linha})</p>`
      : ''

    for (const m of mediums) {
      const email = m.email
      if (!email) continue

      const assunto = `Lembrete de sessão – ${dataStr} (${tipoStr})`

      const html = `
        <p>Olá, ${m.nome}.</p>
        <p>
          Este é um lembrete fraterno da <strong>Tenda Espírita Nossa Senhora da Glória</strong>.
        </p>
        <p>
          Daqui a <strong>3 dias</strong>, em <strong>${dataStr}</strong>, teremos
          uma sessão de <strong>${tipoStr}</strong>.
        </p>
        ${blocoDirigente}
        ${blocoGuia}
        <p>
          A sua presença na corrente é parte essencial do trabalho espiritual da Casa e
          do compromisso assumido com seus Guias e Orixás.
        </p>
        <p>
          Caso você já saiba que não poderá comparecer a esta sessão, pedimos que, sempre
          que possível, avise a Direção com antecedência, para que possamos nos organizar
          melhor e preservar o equilíbrio da corrente.
        </p>
        <p>
          Que a espiritualidade amiga te acompanhe e fortaleça suas decisões.<br/>
          <em>Tenda Espírita Nossa Senhora da Glória</em>
        </p>
      `

      await enviarEmail(email, assunto, html)
      console.log(
        `Lembrete enviado para ${m.nome} (${email}) sobre sessão em ${dataStr}.`,
      )
    }
  }

  console.log('Envio de lembretes concluído.')
}

main()
  .catch((e) => {
    console.error('Erro ao enviar lembretes de sessões:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

