// scripts/reset_admin_password.cjs
// Reseta a senha do usuário administrativo para um valor conhecido,
// usando o MESMO hash (SHA256) que o login usa.

const { PrismaClient } = require('@prisma/client')
const crypto = require('crypto')

const prisma = new PrismaClient()

function hashSenha(senha) {
  return crypto.createHash('sha256').update(senha).digest('hex')
}

async function main() {
  const emailAdmin = 'direcao@tenda.com.br' // e-mail do usuário admin
  const novaSenha = 'NovaSenha123!'        // você pode trocar por outra

  console.log(`Atualizando senha do usuário ${emailAdmin}...`)

  const user = await prisma.user.findUnique({
    where: { email: emailAdmin.toLowerCase() },
  })

  if (!user) {
    console.error('Usuário admin não encontrado no banco.')
    process.exit(1)
  }

  const novoHash = hashSenha(novaSenha)

  await prisma.user.update({
    where: { id: user.id },
    data: {
      senhaHash: novoHash,
      nivelAcesso: 'SUPERUSER',
    },
  })

  console.log('Senha atualizada com sucesso.')
  console.log('Use as seguintes credenciais para login:')
  console.log(`  E-mail: ${emailAdmin}`)
  console.log(`  Senha:  ${novaSenha}`)
}

main()
  .catch((e) => {
    console.error('Erro ao resetar senha do admin:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

