import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const exemplares = await prisma.exemplarLivro.findMany({
      include: { livro: true },
      orderBy: { id: "desc" },
    });
    return NextResponse.json(exemplares);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    if (!data.livroId || !data.codigoTombo) {
      return NextResponse.json(
        { error: "Livro e código de tombo são obrigatórios." },
        { status: 400 }
      );
    }
    const exemplar = await prisma.exemplarLivro.create({
      data: {
        livroId: Number(data.livroId),
        codigoTombo: data.codigoTombo,
        estado: data.estado || "bom",
      },
    });
    return NextResponse.json(exemplar);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

