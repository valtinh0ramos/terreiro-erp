import { listarEmprestimos } from "../actions";

export default async function EmprestimosPage() {
  const emprestimos = await listarEmprestimos();

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">📖 Empréstimos</h1>

      <table className="w-full border-collapse border border-border text-sm">
        <thead className="bg-muted">
          <tr>
            <th className="p-2 text-left">Livro</th>
            <th className="p-2 text-left">Médium</th>
            <th className="p-2 text-left">Saída</th>
            <th className="p-2 text-left">Devolução</th>
          </tr>
        </thead>
        <tbody>
          {emprestimos.map((emp) => (
            <tr key={emp.id} className="border-t border-border">
              <td className="p-2">{emp.exemplar.livro.titulo}</td>
              <td className="p-2">{emp.medium.nome}</td>
              <td className="p-2">
                {new Date(emp.dataSaida).toLocaleDateString()}
              </td>
              <td className="p-2">
                {emp.dataDevolucao
                  ? new Date(emp.dataDevolucao).toLocaleDateString()
                  : "Em aberto"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

