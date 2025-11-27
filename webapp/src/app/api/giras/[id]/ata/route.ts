// src/app/api/giras/[id]/ata/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import PDFDocument from 'pdfkit'
import { Readable } from 'stream'

type ParamsType = {
  params: { id: string }
}

// Util simples para converter stream em Buffer
function streamToBuffer(stream: NodeJS.ReadableStream): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    stream.on('data', (chunk) => chunks.push(chunk))
    stream.on('end', () => resolve(Buffer.from(Buffer.concat(chunks))))
    stream.on('error', (err) => reject(err))
  })
}

// GET /api/giras/[id]/ata
export async function GET(_request: Request, { params }: ParamsType) {
  const id = Number(params.id)
  if (Number.isNaN(id)) {
    return NextResponse.json(
      { error: 'ID de sessão inválido.' },
      { status: 400 },
    )
  }

  const gira = await prisma.gira.findUnique({
    where: { id },
    include: {
      dirigente: true,
      guiaChefe: true,
    },
  })

  if (!gira) {
    return NextResponse.json(
      { error: 'Sessão não encontrada.' },
      { status: 404 },
    )
  }

  // Cria PDF em memória
  const doc = new PDFDocument({ margin: 50 })
  const stream = doc as unknown as Readable

  doc.fontSize(14).text('Ata de Sessão de Umbanda', { align: 'center' })
  doc.moveDown()

  doc.fontSize(10)
  doc.text(`Data da sessão: ${gira.data.toLocaleDateString('pt-BR')}`)
  doc.text(`Tipo de sessão: ${gira.tipo}`)
  doc.text(
    `Dirigente espiritual: ${
      gira.dirigente
        ? `${gira.dirigente.codigo ?? ''} ${gira.dirigente.nome}`
        : '-'
    }`,
  )
  doc.text(
    `Guia chefe: ${
      gira.guiaChefe
        ? `${gira.guiaChefe.nome} (${gira.guiaChefe.linha})`
        : '-'
    }`,
  )
  doc.text(
    `Horário de início: ${
      gira.horarioInicio
        ? gira.horarioInicio.toLocaleTimeString('pt-BR')
        : '-'
    }`,
  )
  doc.text(
    `Horário de término: ${
      gira.horarioFim ? gira.horarioFim.toLocaleTimeString('pt-BR') : '-'
    }`,
  )
  doc.moveDown()

  doc.fontSize(12).text('Ata da Sessão:', { underline: true })
  doc.moveDown(0.5)
  doc.fontSize(10)
  doc.text(gira.ata || '(Ata ainda não registrada)', {
    align: 'justify',
  })

  doc.end()

  const buffer = await streamToBuffer(stream)

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="ata-sessao-${id}.pdf"`,
    },
  })
}

