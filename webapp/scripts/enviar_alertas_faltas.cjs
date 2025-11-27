// scripts/enviar_alertas_faltas.cjs
// Envia e-mails para médiuns com 25% e 50% de faltas (incluindo justificadas),
// somente a partir de 10 sessões registradas (não conta "AFASTADO").
// Linguagem alinhada com a Tenda Espírita Nossa Senhora da Glória.

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

async function calcularFaltasMedium(mediumId) {
  const presencas = await prisma.presenca.findMany({
    where: {
      mediumId,
    },
  })

  // ignora "AFASTADO" da conta
  const consideradas = presencas.filter(
    (p) => p.status !== 'AFASTADO',
  )

  const total = consideradas.length
  if (total < 10) {
    return { total, faltas: 0, proporcao: 0 }
  }

  // faltas + justificadas entram na conta
  const faltas = consideradas.filter(
    (p) =>
      p.status === 'FALTA' || p.status === 'FALTA_JUSTIFICADA',
  ).length

  const proporcao = faltas / total

  return { total, faltas, proporcao }
}

async function main() {
  console.log('Iniciando verificação de alertas de faltas...')

  const mediums = await prisma.medium.findMany({
    where: {
      status: 'ATIVO',
      email: { not: null },
    },
  })

  for (const m of mediums) {
    const { total, faltas, proporcao } = await calcularFaltasMedium(
      m.id,
    )

    if (total < 10) {
      continue
    }

    const email = m.email
    if (!email) continue

    const percentual = (proporcao * 100).toFixed(0)

    // ALERTA 50% – Faixa vermelha
    if (proporcao >= 0.5 && !m.alertaFaltas50Enviado) {
      const assunto =
        'Atenção – Seu compromisso com a corrente está em risco'

      const html = `
        <p>Olá, ${m.nome}.</p>
        <p>
          Aqui é a Direção da <strong>Tenda Espírita Nossa Senhora da Glória</strong>.
        </p>
        <p>
          Ao avaliarmos a sua caminhada junto à corrente mediúnica, verificamos que você alcançou
          aproximadamente <strong>${percentual}% de faltas</strong> nas sessões,
          considerando tanto faltas quanto faltas justificadas.
        </p>
        <p>
          Sabemos que a vida física traz desafios, imprevistos e responsabilidades.
          Ao mesmo tempo, sua presença na corrente é parte do compromisso assumido
          com a espiritualidade, com a Casa e com aqueles que buscam amparo através
          do seu trabalho mediúnico.
        </p>
        <p>
          <strong>
            Este é um alerta importante: você está muito acima do limite saudável de faltas
            e corre risco de afastamento da corrente.
          </strong>
        </p>
        <p>
          Pedimos, com respeito e carinho, que você procure a Direção espiritual da Casa
          com urgência, para conversarmos pessoalmente sobre o momento, as dificuldades
          e os melhores encaminhamentos.
        </p>
        <p>
          Que os Guias de Luz possam te orientar e fortalecer suas escolhas.<br/>
          <em>Tenda Espírita Nossa Senhora da Glória</em>
        </p>
      `

      await enviarEmail(email, assunto, html)
      await prisma.medium.update({
        where: { id: m.id },
        data: { alertaFaltas50Enviado: true },
      })
      console.log(
        `Alerta 50% enviado para médium ID ${m.id} (${m.nome}).`,
      )
      continue
    }

    // ALERTA 25% – Faixa amarela
    if (
      proporcao >= 0.25 &&
      proporcao < 0.5 &&
      !m.alertaFaltas25Enviado
    ) {
      const assunto = 'Atenção – Você está com 25% de faltas nas sessões'

      const html = `
        <p>Olá, ${m.nome}.</p>
        <p>
          Aqui é a Direção da <strong>Tenda Espírita Nossa Senhora da Glória</strong>.
        </p>
        <p>
          Ao acompanharmos suas presenças na corrente, identificamos que você está com
          aproximadamente <strong>${percentual}% de faltas</strong> nas sessões,
          considerando tanto faltas quanto faltas justificadas.
        </p>
        <p>
          Entendemos que nem sempre é possível estar presente em todas as giras.
          Justificativas existem e são compreendidas. Porém, mesmo as faltas justificadas
          impactam o trabalho da Casa e o equilíbrio da corrente.
        </p>
        <p>
          <strong>
            Este e-mail é um sinal de alerta, não de punição.
          </strong><br/>
          É o momento ideal para você refletir com carinho sobre sua disponibilidade,
          seu compromisso e a importância da sua presença regular nas sessões.
        </p>
        <p>
          Se estiver passando por alguma dificuldade pessoal, de saúde ou estrutura,
          pedimos que nos procure. A Direção está à disposição para ouvir, orientar
          e ajustar o que for possível.
        </p>
        <p>
          Que a espiritualidade amiga fortaleça seu caminho e suas decisões.<br/>
          <em>Tenda Espírita Nossa Senhora da Glória</em>
        </p>
      `

      await enviarEmail(email, assunto, html)
      await prisma.medium.update({
        where: { id: m.id },
        data: { alertaFaltas25Enviado: true },
      })
      console.log(
        `Alerta 25% enviado para médium ID ${m.id} (${m.nome}).`,
      )
    }
  }

  console.log('Verificação de alertas de faltas concluída.')
}

main()
  .catch((e) => {
    console.error('Erro ao enviar alertas de faltas:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

