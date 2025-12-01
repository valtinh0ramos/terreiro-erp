import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const mediums = await prisma.medium.findMany({
      select: { id: true, nome: true },
      where: { status: "ATIVO" },
    });

    const voluntarios = await prisma.voluntario.findMany({
      select: { id: true, nome: true },
      where: { ativo: true },
    });

    const pretendentes = await prisma.pretendente.findMany({
      select: { id: true, nome: true },
    });

    const usuarios = [
      ...mediums.map((m) => ({ id: m.id, nome: m.nome, tipo: "Medium" })),
      ...voluntarios.map((v) => ({
        id: v.id,
        nome: v.nome,
        tipo: "Voluntario",
      })),
      ...pretendentes.map((p) => ({
        id: p.id,
        nome: p.nome,
        tipo: "Aluno",
      })),
    ];

    return NextResponse.json(usuarios);
  } catch (error: any) {
    console.error("Erro ao buscar usuários:", error);
    return NextResponse.json(
      { error: "Erro ao buscar usuários no banco de dados" },
      { status: 500 }
    );
  }
}

