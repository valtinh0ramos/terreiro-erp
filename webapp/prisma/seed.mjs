// prisma/seed.mjs
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const email = 'direcao@tenda.com.br'
  const senha = 'SenhaAdmin123!' // você pode trocar depois, mas lembre!

  const senhaHash = await bcrypt.hash(senha, 10)

  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      nome: 'Direção Geral',
      email,
      senhaHash,
      role: 'DIRECAO',
    },
  })

  console.log('Usuário DIREÇÃO criado/atualizado com sucesso:')
  console.log(`  Email: ${email}`)
  console.log(`  Senha: ${senha}`)
}

main()
  .catch((e) => {
    console.error('Erro ao rodar seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
