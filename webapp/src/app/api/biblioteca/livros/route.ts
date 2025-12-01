import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Listar livros (GET)
export async function GET() {
  try {
    const livros = await prisma.livro.findMany({
      include: { exemplares: true },
      orderBy: { titulo: "asc" },
    });

    return NextResponse.json(livros);
  } catch (error: any) {
    console.error("Erro ao listar livros:", error);
    return NextResponse.json(
      { error: "Erro ao listar livros." },
      { status: 500 }
    );
  }
}

// Criar livro (POST)
export async function POST(request: Request) {
  try {
    const data = await request.json();
    if (!data.titulo) {
      return NextResponse.json(
        { error: "Título é obrigatório." },
        { status: 400 }
      );
    }

    // Gerar código automático (L001, L002, etc.)
    const ultimo = await prisma.livro.findFirst({
      orderBy: { id: "desc" },
      select: { codigo: true },
    });

    let novoCodigo = "L001";
    if (ultimo?.codigo) {
      const numero = parseInt(ultimo.codigo.replace("L", "")) + 1;
      novoCodigo = `L${String(numero).padStart(3, "0")}`;
    }

    // Criar livro principal
    const livro = await prisma.livro.create({
      data: {
        codigo: novoCodigo,
        titulo: data.titulo,
        autor: data.autor || null,
        tema: data.tema || null,
        genero: data.genero || null,
        sinopse: data.sinopse || null,
      },
    });

    // Criar exemplares automáticos
    const quantidade = Number(data.quantidade || 1);
    const exemplaresData = Array.from({ length: quantidade }).map((_, i) => ({
      livroId: livro.id,
      codigoTombo: `${livro.codigo}-${String(i + 1).padStart(2, "0")}`,
      estado: "Bom",
    }));

    await prisma.exemplarLivro.createMany({ data: exemplaresData });

    return NextResponse.json({
      ...livro,
      exemplaresCriados: quantidade,
    });
  } catch (error: any) {
    console.error("Erro ao cadastrar livro:", error);
    return NextResponse.json(
      { error: "Erro ao cadastrar livro." },
      { status: 500 }
    );
  }
}

// Remover livro (DELETE)
export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();
    await prisma.exemplarLivro.deleteMany({ where: { livroId: Number(id) } });
    await prisma.livro.delete({ where: { id: Number(id) } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Erro ao remover livro:", error);
    return NextResponse.json(
      { error: "Erro ao remover livro." },
      { status: 500 }
    );
  }
}

