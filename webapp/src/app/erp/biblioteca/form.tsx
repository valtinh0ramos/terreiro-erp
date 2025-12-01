"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { criarLivro } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

export default function LivroForm() {
  const [form, setForm] = useState({ titulo: "", autor: "", tema: "" });
  const router = useRouter();

  async function handleSubmit(e) {
    e.preventDefault();
    await criarLivro(form);
    router.push("/erp/biblioteca");
  }

  return (
    <Card className="max-w-lg mx-auto mt-10">
      <CardContent className="space-y-4">
        <h2 className="text-xl font-semibold">Cadastrar Livro</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <Input
            placeholder="Título"
            value={form.titulo}
            onChange={(e) => setForm({ ...form, titulo: e.target.value })}
          />
          <Input
            placeholder="Autor"
            value={form.autor}
            onChange={(e) => setForm({ ...form, autor: e.target.value })}
          />
          <Input
            placeholder="Tema"
            value={form.tema}
            onChange={(e) => setForm({ ...form, tema: e.target.value })}
          />
          <Button type="submit" className="w-full">Salvar</Button>
        </form>
      </CardContent>
    </Card>
  );
}

