// src/lib/codigos.ts
import { prisma } from './prisma'

async function gerarProximoCodigoGenerico(
  tabela: 'medium' | 'voluntario' | 'pretendente' | 'produtoEstoque' | 'livro',
  prefixo: string,
): Promise<string> {
  // Busca o maior código existente nessa tabela, ordenando pela string.
  const ultimo = await (async () => {
    switch (tabela) {
      case 'medium':
        return prisma.medium.findFirst({
          orderBy: { codigo: 'desc' },
        })
      case 'voluntario':
        return prisma.voluntario.findFirst({
          orderBy: { codigo: 'desc' },
        })
      case 'pretendente':
        return prisma.pretendente.findFirst({
          orderBy: { codigo: 'desc' },
        })
      case 'produtoEstoque':
        return prisma.produtoEstoque.findFirst({
          orderBy: { codigo: 'desc' },
        })
      case 'livro':
        return prisma.livro.findFirst({
          orderBy: { codigo: 'desc' },
	})
      case 'turma':
        return prisma.turmaCursoUmbanda.findFirst({
          orderBy: { codigo: 'desc' },
        })
      default:
        return null
    }
  })()

  let numero = 1
  if (ultimo && (ultimo as any).codigo) {
    const cod = String((ultimo as any).codigo)
    const numPart = cod.replace(prefixo, '')
    const parsed = Number(numPart)
    if (!Number.isNaN(parsed) && parsed >= 1) {
      numero = parsed + 1
    }
  }

  const numeroStr = String(numero).padStart(3, '0')
  return `${prefixo}${numeroStr}`
}

export async function gerarCodigoMedium() {
  return gerarProximoCodigoGenerico('medium', 'M')
}

export async function gerarCodigoVoluntario() {
  return gerarProximoCodigoGenerico('voluntario', 'V')
}

export async function gerarCodigoAluno() {
  return gerarProximoCodigoGenerico('pretendente', 'A')
}

export async function gerarCodigoProduto() {
  return gerarProximoCodigoGenerico('produtoEstoque', 'P')
}

export async function gerarCodigoLivro() {
  return gerarProximoCodigoGenerico('livro', 'L')
}
export async function gerarCodigoTurma() {
  return gerarProximoCodigoGenerico('turma', 'T')
}
