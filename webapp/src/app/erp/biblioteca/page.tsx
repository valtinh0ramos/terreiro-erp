"use client";

import { useEffect, useState } from "react";

type Livro = {
  id: number;
  titulo: string;
  autor: string | null;
  tema: string | null;
  sinopse: string | null;
  genero: string | null;
  exemplares: Exemplar[];
};

type Exemplar = {
  id: number;
  codigoTombo: string;
  estado: string | null;
};

type Emprestimo = {
  id: number;
  usuarioNome: string;
  livroTitulo: string;
  dataSaida: string;
  dataPrevista: string | null;
  dataDevolucao: string | null;
  devolvido: boolean;
};

type Usuario = {
  id: number;
  nome: string;
  tipo: "Medium" | "Voluntario" | "Aluno";
};

export default function BibliotecaPage() {
  const [livros, setLivros] = useState<Livro[]>([]);
  const [emprestimos, setEmprestimos] = useState<Emprestimo[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [form, setForm] = useState({
    titulo: "",
    autor: "",
    tema: "",
    genero: "",
    sinopse: "",
    quantidade: 1,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function loadLivros() {
    setLoading(true);
    try {
      const res = await fetch("/api/biblioteca/livros");
      const data = await res.json();
      setLivros(data);
    } catch {
      setError("Erro ao carregar livros.");
    } finally {
      setLoading(false);
    }
  }

  async function loadEmprestimos() {
    try {
      const res = await fetch("/api/biblioteca/emprestimos");
      const data = await res.json();
      setEmprestimos(data);
    } catch {
      setError("Erro ao carregar empréstimos.");
    }
  }

  async function loadUsuarios() {
    try {
      const res = await fetch("/api/usuarios");
      if (res.ok) {
        const data = await res.json();
        setUsuarios(data);
      }
    } catch {
      setError("Erro ao carregar usuários.");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch("/api/biblioteca/livros", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Erro ao cadastrar livro.");
      setSuccess("Livro cadastrado com sucesso!");
      setForm({
        titulo: "",
        autor: "",
        tema: "",
        genero: "",
        sinopse: "",
        quantidade: 1,
      });
      await loadLivros();
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function handleRemoverLivro(id: number, titulo: string) {
    if (!confirm(`Remover o livro "${titulo}"?`)) return;
    try {
      await fetch("/api/biblioteca/livros", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      await loadLivros();
    } catch {
      setError("Erro ao remover livro.");
    }
  }

  async function handleDevolucao(id: number) {
    try {
      await fetch("/api/biblioteca/emprestimos", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      await loadEmprestimos();
    } catch {
      setError("Erro ao registrar devolução.");
    }
  }

  async function handleEmprestimo(e: React.FormEvent) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const exemplarId = formData.get("exemplarId");
    const usuarioId = formData.get("usuarioId");
    const dataSaida = formData.get("dataSaida");
    const dataPrevista = formData.get("dataPrevista");
    if (!exemplarId || !usuarioId) return;

    try {
      await fetch("/api/biblioteca/emprestimos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          exemplarId,
          mediumId: usuarioId,
          dataSaida,
          dataPrevista,
        }),
      });
      await loadEmprestimos();
    } catch {
      setError("Erro ao registrar empréstimo.");
    }
  }

  const emprestimosAtrasados = emprestimos.filter(
    (e) =>
      !e.devolvido &&
      e.dataPrevista &&
      new Date(e.dataPrevista) < new Date()
  );

  useEffect(() => {
    loadLivros();
    loadEmprestimos();
    loadUsuarios();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-50">📚 Biblioteca</h2>
        <p className="text-sm text-slate-400 mt-1">
          Cadastre livros, controle exemplares e empréstimos de médiuns,
          voluntários e alunos.
        </p>
      </div>

      {emprestimosAtrasados.length > 0 && (
        <div className="bg-red-950/60 border border-red-700 rounded-xl p-4">
          <h3 className="text-red-400 font-semibold text-sm mb-2">
            ⚠ Livros com devolução atrasada
          </h3>
          <ul className="text-xs text-red-300 space-y-1">
            {emprestimosAtrasados.map((a) => (
              <li key={a.id}>
                <b>{a.livroTitulo}</b> — emprestado para{" "}
                <b>{a.usuarioNome}</b> (previsão:{" "}
                {new Date(a.dataPrevista!).toLocaleDateString("pt-BR")})
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-[320px,minmax(0,1fr)]">
        {/* Formulário de cadastro */}
        <div className="space-y-4">
          {/* Cadastro de livro */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
            <h3 className="text-sm font-semibold text-slate-100 mb-3">
              Novo livro
            </h3>
          
	    <form onSubmit={handleSubmit} className="space-y-3 text-xs">
  {/* Título */}
  <input
    type="text"
    placeholder="Título *"
    value={form.titulo}
    onChange={(e) => setForm({ ...form, titulo: e.target.value })}
    className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-50"
    required
  />

  {/* Autor */}
  <input
    type="text"
    placeholder="Autor"
    value={form.autor}
    onChange={(e) => setForm({ ...form, autor: e.target.value })}
    className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-50"
  />

  {/* Tema — dropdown com opções fixas */}
  <label className="block text-[11px] text-slate-300 mb-1">Tema</label>
  <select
    value={form.tema}
    onChange={(e) => setForm({ ...form, tema: e.target.value })}
    className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-50"
  >
    {[
      "Umbanda",
      "Espiritismo",
      "Espiritualismo",
      "Catimbó",
      "Candomblé",
      "Cristão",
      "Orixás-África",
      "Religiões Orientais",
      "Magia",
      "Mediunidade",
      "Diversos",
    ].map((tema) => (
      <option key={tema} value={tema}>
        {tema}
      </option>
    ))}
  </select>

  {/* Gênero — dropdown com opções fixas */}
  <label className="block text-[11px] text-slate-300 mb-1">Gênero</label>
  <select
    value={form.genero}
    onChange={(e) => setForm({ ...form, genero: e.target.value })}
    className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-50"
  >
    {[
      "Romance",
      "Suspense",
      "Terror",
      "Biografia",
      "História",
      "Técnico",
      "Variados",
    ].map((genero) => (
      <option key={genero} value={genero}>
        {genero}
      </option>
    ))}
  </select>

  {/* Sinopse */}
  <textarea
    rows={3}
    placeholder="Sinopse"
    value={form.sinopse}
    onChange={(e) => setForm({ ...form, sinopse: e.target.value })}
    className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-50"
  />

  {/* Quantidade de exemplares */}
  <input
    type="number"
    min="1"
    placeholder="Qtd. Exemplares"
    value={form.quantidade}
    onChange={(e) =>
      setForm({ ...form, quantidade: Number(e.target.value) })
    }
    className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-50"
  />

  {/* Botão de envio */}
  <button
    type="submit"
    className="w-full rounded-lg bg-emerald-500 text-emerald-950 font-semibold py-1.5 text-xs hover:brightness-110 disabled:opacity-60"
  >
    Cadastrar livro
  </button>
</form>

	    </div>

          {/* Registrar empréstimo */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
            <h3 className="text-sm font-semibold text-slate-100 mb-3">
              Registrar empréstimo
            </h3>
            <form onSubmit={handleEmprestimo} className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] text-slate-300 mb-1">
                  Emprestado para:
                </label>
                <select
                  name="usuarioId"
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-2 py-1.5 text-slate-50"
                >
                  {usuarios.map((u) => (
                    <option key={`${u.tipo}-${u.id}`} value={u.id}>
                      {u.nome} ({u.tipo})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[11px] text-slate-300 mb-1">
                  Exemplar:
                </label>
                <select
                  name="exemplarId"
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-2 py-1.5 text-slate-50"
                >
                  {livros.flatMap((l) =>
                    l.exemplares.map((ex) => (
                      <option key={ex.id} value={ex.id}>
                        {l.titulo} — {ex.codigoTombo}
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block text-[11px] text-slate-300 mb-1">
                    Emprestado dia:
                  </label>
                  <input
                    type="date"
                    name="dataSaida"
                    className="w-full rounded-lg border border-slate-700 bg-slate-900 px-2 py-1.5 text-slate-50"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-[11px] text-slate-300 mb-1">
                    Entregar até o dia:
                  </label>
                  <input
                    type="date"
                    name="dataPrevista"
                    className="w-full rounded-lg border border-slate-700 bg-slate-900 px-2 py-1.5 text-slate-50"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full rounded-lg bg-emerald-500 text-emerald-950 font-semibold py-1.5 text-xs hover:brightness-110 disabled:opacity-60"
              >
                Registrar
              </button>
            </form>
          </div>
        </div>

        {/* Listagens */}
        <div className="space-y-4">
          {/* Livros */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
            <h3 className="text-sm font-semibold text-slate-100 mb-3">
              Livros cadastrados
            </h3>
            {loading ? (
              <p className="text-xs text-slate-400">Carregando...</p>
            ) : livros.length === 0 ? (
              <p className="text-xs text-slate-400">Nenhum livro cadastrado.</p>
            ) : (
              <div className="overflow-x-auto max-h-[260px] text-xs">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400">
                      <th className="text-left py-2 pr-3">Título</th>
                      <th className="text-left py-2 pr-3">Autor</th>
                      <th className="text-left py-2 pr-3">Gênero</th>
                      <th className="text-right py-2 pr-3">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {livros.map((l) => (
                      <tr
                        key={l.id}
                        className="border-b border-slate-800/60 last:border-0"
                      >
                        <td className="py-1.5 pr-3 text-slate-50">
                          {l.titulo}
                        </td>
                        <td className="py-1.5 pr-3 text-slate-300">
                          {l.autor || "-"}
                        </td>
                        <td className="py-1.5 pr-3 text-slate-300">
                          {l.genero || "-"}
                        </td>
                        <td className="py-1.5 pr-3 text-right">
                          <button
                            onClick={() => handleRemoverLivro(l.id, l.titulo)}
                            className="text-red-400 hover:text-red-300 text-xs"
                          >
                            Remover
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Empréstimos */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
            <h3 className="text-sm font-semibold text-slate-100 mb-3">
              Empréstimos recentes
            </h3>
            {emprestimos.length === 0 ? (
              <p className="text-xs text-slate-400">
                Nenhum empréstimo registrado.
              </p>
            ) : (
              <div className="overflow-x-auto max-h-[260px] text-xs text-slate-300">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400">
                      <th className="text-left py-2 pr-3">Usuário</th>
                      <th className="text-left py-2 pr-3">Livro</th>
                      <th className="text-left py-2 pr-3">Devolução</th>
                      <th className="text-right py-2 pr-3">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {emprestimos.map((e) => (
                      <tr
                        key={e.id}
                        className="border-b border-slate-800/60 last:border-0"
                      >
                        <td className="py-1.5 pr-3">{e.usuarioNome}</td>
                        <td className="py-1.5 pr-3">{e.livroTitulo}</td>
                        <td className="py-1.5 pr-3">
                          {e.dataPrevista
                            ? new Date(e.dataPrevista).toLocaleDateString(
                                "pt-BR"
                              )
                            : "-"}
                        </td>
                        <td className="py-1.5 pr-3 text-right">
                          {!e.devolvido ? (
                            <button
                              onClick={() => handleDevolucao(e.id)}
                              className="text-xs text-emerald-400 hover:text-emerald-300"
                            >
                              Devolver
                            </button>
                          ) : (
                            <span className="text-slate-500 text-xs">
                              Devolvido
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

