'use client'

import { useEffect, useState } from 'react'

type NivelAcesso = 'COMUM' | 'AVANCADO' | 'SUPERUSER'

type UserView = {
  id: number
  nome: string
  email: string
  role?: string | null
  nivelAcesso: NivelAcesso
  createdAt?: string
}

type NovoUsuarioForm = {
  nome: string
  email: string
  senha: string
  nivelAcesso: NivelAcesso
}

type TemaVisual = 'VERDE' | 'AZUL' | 'ROXO' | 'CLARO'

const NIVEL_LABEL: Record<NivelAcesso, string> = {
  COMUM: 'Comum',
  AVANCADO: 'Avançado',
  SUPERUSER: 'Superusuário',
}

const TEMA_LABEL: Record<TemaVisual, string> = {
  VERDE: 'Verde (padrão)',
  AZUL: 'Azul',
  ROXO: 'Roxo',
  CLARO: 'Claro (estilo Chatgpt)',
}

export default function PainelControlePage() {
  const [users, setUsers] = useState<UserView[]>([])
  const [loadingUsers, setLoadingUsers] = useState(true)
  const [savingUserId, setSavingUserId] = useState<number | null>(null)
  const [creating, setCreating] = useState(false)

  const [temaAtual, setTemaAtual] = useState<TemaVisual>('VERDE')
  const [loadingTema, setLoadingTema] = useState(true)
  const [savingTema, setSavingTema] = useState(false)

  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const [novoUsuario, setNovoUsuario] = useState<NovoUsuarioForm>({
    nome: '',
    email: '',
    senha: '',
    nivelAcesso: 'COMUM',
  })

  async function loadUsers() {
    setLoadingUsers(true)
    setError(null)
    setSuccess(null)
    try {
      const res = await fetch('/api/users')
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Erro ao carregar usuários.')
        setLoadingUsers(false)
        return
      }
      setUsers(data)
    } catch (e: any) {
      console.error(e)
      setError(e.message || 'Erro ao carregar usuários.')
    } finally {
      setLoadingUsers(false)
    }
  }

  async function loadTema() {
    setLoadingTema(true)
    try {
      const res = await fetch('/api/config-visual')
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Erro ao carregar tema visual.')
        setLoadingTema(false)
        return
      }
      setTemaAtual(data.tema as TemaVisual)
    } catch (e: any) {
      console.error(e)
      setError(e.message || 'Erro ao carregar tema visual.')
    } finally {
      setLoadingTema(false)
    }
  }

  useEffect(() => {
    loadUsers()
    loadTema()
  }, [])

  async function handleTemaChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const novoTema = e.target.value as TemaVisual
    setSavingTema(true)
    setError(null)
    setSuccess(null)
    try {
      const res = await fetch('/api/config-visual', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tema: novoTema }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Erro ao atualizar tema visual.')
        setSavingTema(false)
        return
      }
      setTemaAtual(data.tema as TemaVisual)
      setSuccess('Tema visual atualizado com sucesso.')
    } catch (e: any) {
      console.error(e)
      setError(e.message || 'Erro ao atualizar tema visual.')
    } finally {
      setSavingTema(false)
    }
  }

  async function handleNivelChange(id: number, nivel: NivelAcesso) {
    setSavingUserId(id)
    setError(null)
    setSuccess(null)

    try {
      const res = await fetch(`/api/users/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nivelAcesso: nivel }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Erro ao atualizar nível de acesso.')
        setSavingUserId(null)
        return
      }
      setUsers((prev) =>
        prev.map((u) =>
          u.id === id ? { ...u, nivelAcesso: nivel } : u,
        ),
      )
      setSuccess('Nível de acesso atualizado com sucesso.')
    } catch (e: any) {
      console.error(e)
      setError(e.message || 'Erro ao atualizar nível de acesso.')
    } finally {
      setSavingUserId(null)
    }
  }

  async function handleCreateUser(e: React.FormEvent) {
    e.preventDefault()
    if (
      !novoUsuario.nome.trim() ||
      !novoUsuario.email.trim() ||
      !novoUsuario.senha.trim()
    ) {
      setError('Nome, e-mail e senha são obrigatórios para criar um usuário.')
      return
    }

    setCreating(true)
    setError(null)
    setSuccess(null)

    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(novoUsuario),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Erro ao criar usuário.')
        setCreating(false)
        return
      }

      setSuccess('Usuário criado com sucesso.')
      setNovoUsuario({
        nome: '',
        email: '',
        senha: '',
        nivelAcesso: 'COMUM',
      })
      await loadUsers()
    } catch (e: any) {
      console.error(e)
      setError(e.message || 'Erro ao criar usuário.')
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* CABEÇALHO */}
      <div>
        <h2 className="text-xl font-semibold text-slate-50">
          Painel de Controle
        </h2>
        <p className="text-sm text-slate-400 max-w-3xl mt-1">
          Área de administração do ERP. Aqui você gerencia usuários, níveis de
          acesso e o esquema de cores do sistema.
        </p>
      </div>

      {/* ALERTAS GERAIS */}
      {error && (
        <div className="text-xs text-red-400 bg-red-950/40 border border-red-800 rounded-lg px-3 py-2">
          {error}
        </div>
      )}
      {success && (
        <div className="text-xs text-emerald-400 bg-emerald-950/40 border border-emerald-800 rounded-lg px-3 py-2">
          {success}
        </div>
      )}

      {/* LINHA 1: ESQUEMA DE CORES */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
        <h3 className="text-sm font-semibold text-slate-100 mb-2">
          Esquema de cores do ERP
        </h3>
        <p className="text-xs text-slate-400 mb-3 max-w-2xl">
          Aqui você escolhe a base de cores do sistema (verde, azul ou roxo).
          Nesta primeira etapa, essa informação fica salva para ser aplicada
          gradualmente nas telas e componentes.
        </p>

        {loadingTema ? (
          <p className="text-xs text-slate-400">Carregando tema atual...</p>
        ) : (
          <div className="flex items-center gap-3 text-xs">
            <div className="flex-1">
              <label className="block text-[11px] text-slate-300 mb-1">
                Tema atual
              </label>
              <select
                value={temaAtual}
                onChange={handleTemaChange}
                disabled={savingTema}
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-50"
              >
                <option value="VERDE">Verde (padrão)</option>
                <option value="AZUL">Azul</option>
                <option value="ROXO">Roxo</option>
		<option value="CLARO">Claro</option>
  		</select>
            </div>
            <div className="text-[11px] text-slate-500">
              Tema selecionado:{' '}
              <span className="font-semibold">
                {TEMA_LABEL[temaAtual]}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* LINHA 2: USUÁRIOS (FORM + LISTA) */}
      <div className="grid gap-4 lg:grid-cols-[360px,minmax(0,1fr)]">
        {/* FORMULÁRIO: NOVO USUÁRIO */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
          <h3 className="text-sm font-semibold text-slate-100 mb-3">
            Criar novo usuário
          </h3>

          <form onSubmit={handleCreateUser} className="space-y-3 text-xs">
            <div>
              <label className="block text-[11px] text-slate-300 mb-1">
                Nome completo *
              </label>
              <input
                type="text"
                value={novoUsuario.nome}
                onChange={(e) =>
                  setNovoUsuario((prev) => ({
                    ...prev,
                    nome: e.target.value,
                  }))
                }
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-50"
              />
            </div>

            <div>
              <label className="block text-[11px] text-slate-300 mb-1">
                E-mail *
              </label>
              <input
                type="email"
                value={novoUsuario.email}
                onChange={(e) =>
                  setNovoUsuario((prev) => ({
                    ...prev,
                    email: e.target.value,
                  }))
                }
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-50"
              />
            </div>

            <div>
              <label className="block text-[11px] text-slate-300 mb-1">
                Senha inicial *
              </label>
              <input
                type="password"
                value={novoUsuario.senha}
                onChange={(e) =>
                  setNovoUsuario((prev) => ({
                    ...prev,
                    senha: e.target.value,
                  }))
                }
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-50"
              />
              <p className="mt-1 text-[11px] text-slate-500">
                A senha será armazenada de forma segura (hash) pela API.
              </p>
            </div>

            <div>
              <label className="block text-[11px] text-slate-300 mb-1">
                Nível de acesso *
              </label>
              <select
                value={novoUsuario.nivelAcesso}
                onChange={(e) =>
                  setNovoUsuario((prev) => ({
                    ...prev,
                    nivelAcesso: e.target.value as NivelAcesso,
                  }))
                }
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-50"
              >
                <option value="COMUM">
                  Comum – acesso apenas à própria ficha
                </option>
                <option value="AVANCADO">
                  Avançado – pode cadastrar e consultar mais módulos
                </option>
                <option value="SUPERUSER">
                  Superusuário – acesso total ao ERP
                </option>
              </select>
            </div>

            <button
              type="submit"
              disabled={creating}
              className="w-full rounded-lg bg-emerald-500 text-emerald-950 font-semibold py-1.5 text-xs hover:brightness-110 disabled:opacity-60"
            >
              {creating ? 'Criando usuário...' : 'Criar usuário'}
            </button>
          </form>
        </div>

        {/* LISTA DE USUÁRIOS */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
          <h3 className="text-sm font-semibold text-slate-100 mb-3">
            Usuários cadastrados
          </h3>

          {loadingUsers ? (
            <p className="text-xs text-slate-400">Carregando usuários...</p>
          ) : users.length === 0 ? (
            <p className="text-xs text-slate-400">
              Nenhum usuário cadastrado ainda.
            </p>
          ) : (
            <div className="overflow-x-auto max-h-[480px] text-xs">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="text-left py-2 pr-3">Nome</th>
                    <th className="text-left py-2 pr-3">E-mail</th>
                    <th className="text-left py-2 pr-3">Nível</th>
                    <th className="text-left py-2 pr-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr
                      key={u.id}
                      className="border-b border-slate-800/60 last:border-0"
                    >
                      <td className="py-1.5 pr-3 text-slate-50">
                        {u.nome}
                      </td>
                      <td className="py-1.5 pr-3 text-slate-300">
                        {u.email}
                      </td>
                      <td className="py-1.5 pr-3 text-slate-300">
                        <select
                          value={u.nivelAcesso}
                          onChange={(e) =>
                            handleNivelChange(
                              u.id,
                              e.target.value as NivelAcesso,
                            )
                          }
                          className="rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-[11px] text-slate-50"
                          disabled={savingUserId === u.id}
                        >
                          <option value="COMUM">
                            Comum – só vê a própria ficha
                          </option>
                          <option value="AVANCADO">
                            Avançado – pode cadastrar/consultar mais módulos
                          </option>
                          <option value="SUPERUSER">
                            Superusuário – acesso total
                          </option>
                        </select>
                      </td>
                      <td className="py-1.5 pr-3 text-right">
                        {savingUserId === u.id && (
                          <span className="text-[11px] text-slate-400">
                            Salvando...
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="mt-4 text-[11px] text-slate-500 space-y-1">
            <p>
              <strong>COMUM</strong>: vê apenas a própria ficha, presenças,
              advertências/suspensões, mensalidades e disponibilidade de livros.
            </p>
            <p>
              <strong>AVANCADO</strong>: além do COMUM, pode cadastrar e
              consultar médiuns, voluntários, alunos, turmas, sessões e material
              didático; consulta finanças, disciplina e guias.
            </p>
            <p>
              <strong>SUPERUSER</strong>: poderes de administração total do ERP.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

