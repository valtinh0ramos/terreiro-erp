"use client";

import { useEffect, useState } from "react";

type Doacao = {
  id: number;
  valor: number;
  formaPagamento: string | null;
  doadorExterno: string | null;
  observacoes: string | null;
  data: string;
};

export default function DoacoesPage() {
  const [doacoes, setDoacoes] = useState<Doacao[]>([]);
  const [form, setForm] = useState({
    valor: "",
    formaPagamento: "DINHEIRO",
    doadorExterno: "",
    observacoes: "",
  });
  const [mensagem, setMensagem] = useState<string | null>(null);

  async function carregar() {
    const res = await fetch("/api/financeiro/doacoes");
    const data = await res.json();
    setDoacoes(data);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/financeiro/doacoes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setMensagem("Doação registrada com sucesso!");
      setForm({
        valor: "",
        formaPagamento: "DINHEIRO",
        doadorExterno: "",
        observacoes: "",
      });
      carregar();
    } else {
      setMensagem("Erro ao registrar doação.");
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-50">
          💰 Doações Financeiras
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          Registre e acompanhe as doações financeiras feitas para a Tenda.
        </p>
      </div>

      {/* Formulário */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <input
            type="number"
            step="0.01"
            placeholder="Valor (R$)"
            value={form.valor}
            onChange={(e) => setForm({ ...form, valor: e.target.value })}
            className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-50"
            required
          />
          <select
            value={form.formaPagamento}
            onChange={(e) =>
              setForm({ ...form, formaPagamento: e.target.value })
            }
            className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-50"
          >
            <option value="DINHEIRO">Dinheiro</option>
            <option value="PIX">Pix</option>
            <option value="CARTAO">Cartão</option>
            <option value="OUTRO">Outro</option>
          </select>
          <input
            type="text"
            placeholder="Doador externo (opcional)"
            value={form.doadorExterno}
            onChange={(e) => setForm({ ...form, doadorExterno: e.target.value })}
            className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-50"
          />
          <textarea
            rows={2}
            placeholder="Observações (opcional)"
            value={form.observacoes}
            onChange={(e) => setForm({ ...form, observacoes: e.target.value })}
            className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-50"
          />
          <button
            type="submit"
            className="w-full rounded-lg bg-emerald-500 text-emerald-950 font-semibold py-1.5 text-xs hover:brightness-110 disabled:opacity-60"
          >
            Registrar Doação
          </button>
          {mensagem && (
            <p className="text-xs text-center text-slate-400 mt-2">{mensagem}</p>
          )}
        </form>
      </div>

      {/* Listagem */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
        <h3 className="text-sm font-semibold text-slate-100 mb-3">
          Histórico de Doações
        </h3>
        {doacoes.length === 0 ? (
          <p className="text-xs text-slate-400">Nenhuma doação registrada.</p>
        ) : (
          <table className="w-full text-xs border-collapse">
            <thead className="bg-slate-800 text-slate-400">
              <tr>
                <th className="text-left p-2">Data</th>
                <th className="text-left p-2">Valor</th>
                <th className="text-left p-2">Forma</th>
                <th className="text-left p-2">Doador</th>
                <th className="text-left p-2">Observações</th>
              </tr>
            </thead>
            <tbody>
              {doacoes.map((d) => (
                <tr key={d.id} className="border-b border-slate-800">
                  <td className="p-2">
                    {new Date(d.data).toLocaleDateString("pt-BR")}
                  </td>
                  <td className="p-2 text-emerald-400">
                    R$ {Number(d.valor).toFixed(2).replace(".", ",")}
                  </td>
                  <td className="p-2">{d.formaPagamento}</td>
                  <td className="p-2">{d.doadorExterno || "-"}</td>
                  <td className="p-2">{d.observacoes || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

