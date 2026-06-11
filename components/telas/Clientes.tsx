'use client'
import { useState, useEffect } from 'react'
import { ClienteInfo } from '@/lib/types'

interface Props {
  onVerOS: (id: number, nome: string) => void
}

export default function Clientes({ onVerOS }: Props) {
  const [clientes, setClientes] = useState<ClienteInfo[]>([])
  const [busca, setBusca] = useState('')
  const [carregando, setCarregando] = useState(true)

  const [clienteEditando, setClienteEditando] = useState<ClienteInfo | null>(null)
  const [nomeEd, setNomeEd] = useState('')
  const [cpfEd, setCpfEd] = useState('')
  const [telefoneEd, setTelefoneEd] = useState('')
  const [emailEd, setEmailEd] = useState('')
  const [enderecoEd, setEnderecoEd] = useState('')
  const [erroModal, setErroModal] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => {
      buscarClientes()
    }, 300)
    return () => clearTimeout(timer)
  }, [busca])

  async function buscarClientes() {
    setCarregando(true)
    const params = new URLSearchParams()
    if (busca) params.set('busca', busca)
    const res = await fetch(`/api/clientes?${params.toString()}`)
    const dados = res.ok ? await res.json() : []
    setClientes(Array.isArray(dados) ? dados : [])
    setCarregando(false)
  }

  function abrirEdicao(cliente: ClienteInfo) {
    setClienteEditando(cliente)
    setNomeEd(cliente.nome)
    setCpfEd(cliente.cpf ?? '')
    setTelefoneEd(cliente.telefone ?? '')
    setEmailEd(cliente.email ?? '')
    setEnderecoEd(cliente.endereco ?? '')
    setErroModal('')
  }

  function fecharModal() {
    setClienteEditando(null)
    setErroModal('')
  }

  async function handleSalvarCliente(e: { preventDefault(): void }) {
    e.preventDefault()
    if (!clienteEditando) return
    setErroModal('')

    const res = await fetch(`/api/clientes/${clienteEditando.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nome: nomeEd,
        cpf: cpfEd,
        telefone: telefoneEd,
        email: emailEd,
        endereco: enderecoEd,
      }),
    })
    const dados = await res.json()
    if (!res.ok) { setErroModal(dados.erro ?? 'Erro ao salvar.'); return }

    fecharModal()
    buscarClientes()
  }

  return (
    <div className="clientes">
      <h2 className="clientes__titulo">Clientes</h2>

      <div className="clientes__filtros">
        <input
          className="input"
          type="text"
          placeholder="Buscar por nome, CPF ou telefone..."
          value={busca}
          onChange={e => setBusca(e.target.value)}
        />
      </div>

      {carregando ? (
        <p>Carregando...</p>
      ) : clientes.length === 0 ? (
        <p>Nenhum cliente encontrado.</p>
      ) : (
        <table className="clientes__tabela">
          <thead>
            <tr>
              <th>Nome</th>
              <th>CPF</th>
              <th>Telefone</th>
              <th>E-mail</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {clientes.map(c => (
              <tr key={c.id} className="clientes__tabela-linha" onClick={() => onVerOS(c.id, c.nome)}>
                <td>{c.nome}</td>
                <td>{c.cpf}</td>
                <td>{c.telefone}</td>
                <td>{c.email}</td>
                <td>
                  <button
                    className="btn-icone"
                    type="button"
                    title="Editar cliente"
                    onClick={e => { e.stopPropagation(); abrirEdicao(c) }}
                  >
                    ✏
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {clienteEditando && (
        <div className="modal-overlay">
          <div className="modal">
            <h2 className="modal__titulo">Editar Cliente</h2>
            <form onSubmit={handleSalvarCliente}>
              <div className="campo">
                <label className="label">Nome <span className="obrigatorio">*</span></label>
                <input className="input" type="text" value={nomeEd} onChange={e => setNomeEd(e.target.value)} required />
              </div>
              <div className="campo">
                <label className="label">CPF <span className="obrigatorio">*</span></label>
                <input className="input" type="text" value={cpfEd} onChange={e => setCpfEd(e.target.value)} required />
              </div>
              <div className="campo">
                <label className="label">Telefone</label>
                <input className="input" type="text" value={telefoneEd} onChange={e => setTelefoneEd(e.target.value)} />
              </div>
              <div className="campo">
                <label className="label">E-mail</label>
                <input className="input" type="text" value={emailEd} onChange={e => setEmailEd(e.target.value)} />
              </div>
              <div className="campo">
                <label className="label">Endereço</label>
                <input className="input" type="text" value={enderecoEd} onChange={e => setEnderecoEd(e.target.value)} />
              </div>

              {erroModal && <p className="criar-os__erro">{erroModal}</p>}

              <div className="modal__rodape">
                <button className="btn-secundario" type="button" onClick={fecharModal}>Cancelar</button>
                <button className="btn-primario" type="submit">Salvar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
