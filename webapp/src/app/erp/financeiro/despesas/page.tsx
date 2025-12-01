"use client";
import { useEffect, useState } from "react";

export default function DespesasPage() {
  const [despesas, setDespesas] = useState([]);
  const [form, setForm] = useState({
    descricao: "",
    categoria: "",
    valor: "",
    formaPagamento: "DINHEIRO",
    observacoes: "",
  });

  async function carregar() {
    const res = await fetch("/api/financeiro/despesas");
    const data = await res.json();
    setDespesas(data);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    await fetch("/api/financeiro/despesas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setForm({
      descricao: "",
      categoria: "",
      valor: "",
      formaPagamento: "DINHEIRO",
      observacoes: "",
    });
    carregar();
  }

  async function remover(id) {
    await fetch("/api/financeiro/despesas", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    carregar();
  }

  useEffect(() => {
    carregar();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-50">💸 Despesas</h2>
        <p className="text-sm text-slate-400 mt-1">
          Registre e acompanhe todas as despesas da casa.
        </p>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
        <form onSubmit={handleSubmit} className="grid gap-2 text-xs">
          <input
            type="text"
            placeholder="Descrição"
            value={form.descricao}
            onChange={(e) => setForm({ ...form, descricao: e.target.value })}
            className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-50"
            required
          />
          <input
            type="text"
            placeholder="Categoria (opcional)"
            value={form.categoria}
            onChange={(e) => setForm({ ...form, categoria: e.target.value })}
            className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-50"
          />
          <input
            type="number"
            step="0.01"
            placeholder="Valor (R$)"
            value={form.valor}
            onChange={(e) => setForm({ ...form, valor: e.target.value })}
            className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-50"
            required
          />
          <textarea
            placeholder="Observações"
            value={form.observacoes}
            onChange={(e) => setForm({ ...form, observacoes: e.target.value })}
            className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-50"
          />
          <button
            type="submit"
            className="rounded-lg bg-emerald-500 text-emerald-950 font-semibold py-1.5 text-xs hover:brightness-110"
          >
            Registrar Despesa
          </button>
        </form>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
        <h3 className="text-sm font-semibold text-slate-100 mb-3">
          Histórico de Despesas
        </h3>
        {despesas.length === 0 ? (
          <p className="text-xs text-slate-400">Nenhuma despesa registrada.</p>
        ) : (
          <table className="w-full text-xs">
            <thead className="bg-slate-800 text-slate-400">
              <tr>
                <th className="text-left py-2 px-2">Data</th>
                <th className="text-left py-2 px-2">Descrição</th>
                <th className="text-left py-2 px-2">Valor</th>
                <th className="text-left py-2 px-2">Ações</th>
              </tr>
            </thead>
            <tbody>
              {despesas.map((d) => (
                <tr
                  key={d.id}
                  className="border-b border-slate-800 hover:bg-slate-800/50"
                >
                  <td className="py-2 px-2">
                    {new Date(d.data).toLocaleDateString("pt-BR")}
                  </td>
                  <td className="py-2 px-2">{d.descricao}</td>
                  <td className="py-2 px-2 text-red-400">
                    R$ {Number(d.valor).toFixed(2).replace(".", ",")}
                  </td>
                  <td className="py-2 px-2 text-right">
                    <button
                      onClick={() => remover(d.id)}
                      className="text-xs text-red-400 hover:text-red-300"
                    >
                      Excluir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

