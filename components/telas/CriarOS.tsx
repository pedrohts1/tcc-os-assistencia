'use client'
import { useState, useEffect } from 'react'
import { ClienteInfo, OSInfo } from '@/lib/types'

interface Props {
  onCancelar: () => void
  onSalvar: (idOrdem: number) => void
}

type Fase = 'cliente' | 'lista-os' | 'formulario'

export default function CriarOS({ onCancelar, onSalvar }: Props) {
  const [fase, setFase] = useState<Fase>('cliente')

  // --- Cliente ---
  const [buscaCliente, setBuscaCliente] = useState('')
  const [resultadosBusca, setResultadosBusca] = useState<ClienteInfo[]>([])
  const [clienteIdSelecionado, setClienteIdSelecionado] = useState<number | null>(null)
  const [clienteTravado, setClienteTravado] = useState(false)
  const [nomeCliente, setNomeCliente] = useState('')
  const [cpfCliente, setCpfCliente] = useState('')
  const [telefoneCliente, setTelefoneCliente] = useState('')
  const [emailCliente, setEmailCliente] = useState('')
  const [enderecoCliente, setEnderecoCliente] = useState('')

  // --- Lista de OS ---
  const [osExistentes, setOsExistentes] = useState<OSInfo[]>([])
  const [carregandoOS, setCarregandoOS] = useState(false)
  const [osEditando, setOsEditando] = useState<OSInfo | null>(null)

  // --- Formulário OS ---
  const [statusOS, setStatusOS] = useState('Aguardando Avaliação')
  const [tipoAtendimento, setTipoAtendimento] = useState('')
  const [tipoOS, setTipoOS] = useState('')
  const [equipamento, setEquipamento] = useState('')
  const [sugestoesEquipamento, setSugestoesEquipamento] = useState<string[]>([])
  const [marca, setMarca] = useState('')
  const [sugestoesMarca, setSugestoesMarca] = useState<string[]>([])
  const [modelo, setModelo] = useState('')
  const [sugestoesModelo, setSugestoesModelo] = useState<string[]>([])
  const [numeroSerie, setNumeroSerie] = useState('')
  const [codigosPatrimonio, setCodigosPatrimonio] = useState<string[]>([''])
  const [acessorios, setAcessorios] = useState('')
  const [aparencia, setAparencia] = useState('')
  const [defeito, setDefeito] = useState('')
  const [observacoes, setObservacoes] = useState('')
  const [erro, setErro] = useState('')

  // Busca automática de clientes
  useEffect(() => {
    if (clienteTravado) return
    if (buscaCliente.trim() === '') { setResultadosBusca([]); return }

    const timer = setTimeout(async () => {
      const res = await fetch(`/api/clientes?busca=${encodeURIComponent(buscaCliente)}`)
      const dados = await res.json()
      setResultadosBusca(dados)
    }, 300)

    return () => clearTimeout(timer)
  }, [buscaCliente, clienteTravado])

  // Sugestões para equipamento
  useEffect(() => {
    if (equipamento.trim() === '') { setSugestoesEquipamento([]); return }

    const timer = setTimeout(async () => {
      const res = await fetch(`/api/sugestoes?campo=tipo&busca=${encodeURIComponent(equipamento)}`)
      const dados = await res.json()
      setSugestoesEquipamento(dados)
    }, 300)

    return () => clearTimeout(timer)
  }, [equipamento])

  // Sugestões para marca
  useEffect(() => {
    if (marca.trim() === '') { setSugestoesMarca([]); return }

    const timer = setTimeout(async () => {
      const res = await fetch(`/api/sugestoes?campo=marca&busca=${encodeURIComponent(marca)}`)
      const dados = await res.json()
      setSugestoesMarca(dados)
    }, 300)

    return () => clearTimeout(timer)
  }, [marca])

  // Sugestões para modelo
  useEffect(() => {
    if (modelo.trim() === '') { setSugestoesModelo([]); return }

    const timer = setTimeout(async () => {
      const res = await fetch(`/api/sugestoes?campo=modelo&busca=${encodeURIComponent(modelo)}`)
      const dados = await res.json()
      setSugestoesModelo(dados)
    }, 300)

    return () => clearTimeout(timer)
  }, [modelo])

  function selecionarCliente(cliente: ClienteInfo) {
    setClienteIdSelecionado(cliente.id)
    setNomeCliente(cliente.nome)
    setCpfCliente(cliente.cpf ?? '')
    setTelefoneCliente(cliente.telefone ?? '')
    setEmailCliente(cliente.email ?? '')
    setEnderecoCliente(cliente.endereco ?? '')
    setBuscaCliente(cliente.nome)
    setResultadosBusca([])
    setClienteTravado(true)
  }

  function limparCliente() {
    setClienteIdSelecionado(null)
    setClienteTravado(false)
    setBuscaCliente('')
    setNomeCliente('')
    setCpfCliente('')
    setTelefoneCliente('')
    setEmailCliente('')
    setEnderecoCliente('')
    setResultadosBusca([])
  }

  async function handleContinuar() {
    if (!nomeCliente.trim()) return

    if (clienteIdSelecionado) {
      setCarregandoOS(true)
      const res = await fetch(`/api/ordens?clienteId=${clienteIdSelecionado}`)
      const dados = res.ok ? await res.json() : []
      setOsExistentes(Array.isArray(dados) ? dados : [])
      setCarregandoOS(false)
      setFase('lista-os')
    } else {
      limparFormulario()
      setFase('formulario')
    }
  }

  function limparFormulario() {
    setOsEditando(null)
    setStatusOS('Aguardando Avaliação')
    setTipoAtendimento('')
    setTipoOS('')
    setEquipamento('')
    setMarca('')
    setModelo('')
    setNumeroSerie('')
    setCodigosPatrimonio([''])
    setAcessorios('')
    setAparencia('')
    setDefeito('')
    setObservacoes('')
    setErro('')
  }

  function handleNovaOS() {
    limparFormulario()
    setFase('formulario')
  }

  function handleEditarOS(os: OSInfo) {
    setOsEditando(os)
    setStatusOS(os.stat || 'Aguardando Avaliação')
    setTipoAtendimento(os.tipo_atendimento || '')
    setTipoOS(os.tipo_os || '')
    setEquipamento(os.equip_tipo || '')
    setMarca(os.marca || '')
    setModelo(os.modelo || '')
    setNumeroSerie(os.numero_serie || '')
    setCodigosPatrimonio(
      os.codigos_patrimonio ? JSON.parse(os.codigos_patrimonio) : ['']
    )
    setAcessorios(os.acessorios || '')
    setAparencia(os.aparencia || '')
    setDefeito(os.defeito_relatado || '')
    setObservacoes(os.observacoes || '')
    setErro('')
    setFase('formulario')
  }

  function voltarDoFormulario() {
    if (clienteIdSelecionado) {
      setFase('lista-os')
    } else {
      setFase('cliente')
    }
  }

  function adicionarPatrimonio() {
    setCodigosPatrimonio(prev => [...prev, ''])
  }

  function atualizarPatrimonio(index: number, valor: string) {
    setCodigosPatrimonio(prev => prev.map((c, i) => i === index ? valor : c))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErro('')

    if (osEditando) {
      const res = await fetch(`/api/ordens/${osEditando.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          equipId: osEditando.equip_id,
          statusOS,
          tipoOS,
          tipoAtendimento,
          equipamento,
          marca,
          modelo,
          numeroSerie,
          codigosPatrimonio,
          acessorios,
          aparencia,
          defeito,
          observacoes,
        }),
      })
      const dados = await res.json()
      if (!res.ok) { setErro(dados.erro ?? 'Erro ao atualizar OS.'); return }
      onSalvar(dados.id)
      return
    }

    let clienteId = clienteIdSelecionado

    if (!clienteId) {
      const resCliente = await fetch('/api/clientes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: nomeCliente,
          cpf: cpfCliente,
          telefone: telefoneCliente,
          email: emailCliente,
          endereco: enderecoCliente,
        }),
      })
      const dadosCliente = await resCliente.json()
      if (!resCliente.ok) { setErro(dadosCliente.erro ?? 'Erro ao cadastrar cliente.'); return }
      clienteId = dadosCliente.id
    }

    const resOrdem = await fetch('/api/ordens', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clienteId,
        statusOS,
        tipoAtendimento,
        tipoOS,
        equipamento,
        marca,
        modelo,
        numeroSerie,
        codigosPatrimonio,
        acessorios,
        aparencia,
        defeito,
        observacoes,
      }),
    })
    const dadosOrdem = await resOrdem.json()
    if (!resOrdem.ok) { setErro(dadosOrdem.erro ?? 'Erro ao criar OS.'); return }

    onSalvar(dadosOrdem.id)
  }

  return (
    <div className="criar-os">

      {fase === 'cliente' && (
        <>
          <div className="criar-os__cliente">
            <h2 className="criar-os__cliente-titulo">Cliente</h2>

            <div className="criar-os__busca-wrapper">
              <input
                className="input"
                type="text"
                placeholder="Buscar por nome ou CPF..."
                value={buscaCliente}
                onChange={e => { if (!clienteTravado) setBuscaCliente(e.target.value) }}
                disabled={clienteTravado}
              />
              {clienteTravado && (
                <button className="btn-secundario" type="button" onClick={limparCliente}>
                  Alterar
                </button>
              )}
              {resultadosBusca.length > 0 && (
                <ul className="criar-os__busca-resultados">
                  {resultadosBusca.map(c => (
                    <li key={c.id} className="criar-os__busca-item" onClick={() => selecionarCliente(c)}>
                      {c.nome}{c.cpf ? ` — ${c.cpf}` : ''}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="criar-os__cliente-dados">
              <div className="criar-os__cliente-campo">
                <label className="label">Nome <span className="obrigatorio">*</span></label>
                <input className="input" type="text" value={nomeCliente} onChange={e => setNomeCliente(e.target.value)} disabled={clienteTravado} />
              </div>
              <div className="criar-os__cliente-campo">
                <label className="label">CPF <span className="obrigatorio">*</span></label>
                <input className="input" type="text" value={cpfCliente} onChange={e => setCpfCliente(e.target.value)} disabled={clienteTravado} required />
              </div>
              <div className="criar-os__cliente-campo">
                <label className="label">Telefone</label>
                <input className="input" type="text" value={telefoneCliente} onChange={e => setTelefoneCliente(e.target.value)} disabled={clienteTravado} />
              </div>
              <div className="criar-os__cliente-campo">
                <label className="label">E-mail</label>
                <input className="input" type="text" value={emailCliente} onChange={e => setEmailCliente(e.target.value)} disabled={clienteTravado} />
              </div>
              <div className="criar-os__cliente-campo">
                <label className="label">Endereço</label>
                <input className="input" type="text" value={enderecoCliente} onChange={e => setEnderecoCliente(e.target.value)} disabled={clienteTravado} />
              </div>
            </div>
          </div>

          <div className="criar-os__rodape">
            <button className="btn-secundario" type="button" onClick={onCancelar}>
              Cancelar
            </button>
            <button className="btn-primario" type="button" onClick={handleContinuar} disabled={!nomeCliente.trim() || !cpfCliente.trim()}>
              Continuar →
            </button>
          </div>
        </>
      )}

      {fase === 'lista-os' && (
        <>
          <h2 className="criar-os__secao-titulo">Ordens de Serviço</h2>
          
          <div className="criar-os__lista-os">
            <div className='card-header'>
              <h2 className='card-titulo'>Cliente<span className='info-icon'> ⓘ</span></h2>
              <div className='card-dados' >
                <label className="label-identificador">Nome</label>
                <p className="nome-valor">{nomeCliente}</p>
              </div>
            </div>

            {carregandoOS ? (
              <p>Carregando...</p>
            ) : osExistentes.length === 0 ? (
              <p>Nenhuma OS encontrada para este cliente.</p>
            ) : (
              <table className="criar-os__tabela">
                <thead>
                  <tr>
                    <th>Nº OS</th>
                    <th>Tipo de OS</th>
                    <th>Situação</th>
                    <th>Tipo de Atendimento</th>
                    <th>Entrada</th>
                    <th>Equipamento</th>
                    <th>Marca</th>
                    <th>Modelo</th>
                    <th>Nº de Série</th>
                  </tr>
                </thead>
                <tbody>
                  {osExistentes.map(os => (
                    <tr key={os.id} className="criar-os__tabela-linha" onClick={() => handleEditarOS(os)}>
                      <td>{os.id}</td>
                      <td>{os.tipo_os}</td>
                      <td data-status={os.stat}>{os.stat}</td>
                      <td>{os.tipo_atendimento}</td>
                      <td>{new Date(os.data_entrada).toLocaleDateString('pt-BR')}</td>
                      <td>{os.equip_tipo}</td>
                      <td>{os.marca}</td>
                      <td>{os.modelo}</td>
                      <td>{os.numero_serie}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="criar-os__rodape">
            <button className="btn-secundario" type="button" onClick={() => setFase('cliente')}>
              ← Voltar
            </button>
            <button className="btn-primario" type="button" onClick={handleNovaOS}>
              Nova OS
            </button>
          </div>
        </>
      )}

      {fase === 'formulario' && (
        <form className="criar-os__formulario" onSubmit={handleSubmit}>
          <h2 className="criar-os__secao-titulo">
            {osEditando ? `Editar OS #${osEditando.id}` : 'Nova Ordem de Serviço'} — {nomeCliente}
          </h2>

          <div className="criar-os__linha">
            <div className="campo">
              <label className="label">Status <span className="obrigatorio">*</span></label>
              <select className="select" value={statusOS} onChange={e => setStatusOS(e.target.value)} required>
                <option value="Aguardando avaliação">Aguardando avaliação</option>
                <option value="Aguardando, autorização orçamento">Aguardando, autorização orçamento</option>
                <option value="Autorizado, aguardando peça">Autorizado, aguardando peça</option>
                <option value="Autorizado, reparo em andamento">Autorizado, reparo em andamento</option>
                <option value="Pronto, cliente avisado">Pronto, cliente avisado</option>
                <option value="Garantia, aguardando peça">Garantia, aguardando peça Peça</option>
              </select>
            </div>
            <div className="campo">
              <label className="label">Tipo de Atendimento <span className="obrigatorio">*</span></label>
              <select className="select" value={tipoAtendimento} onChange={e => setTipoAtendimento(e.target.value)} required>
                <option value="">Selecione</option>
                <option value="Balcão">Balcão</option>
                <option value="Domicílio">Domicílio</option>
                <option value="Remoto">Remoto</option>
              </select>
            </div>
            <div className="campo">
              <label className="label">Tipo de OS <span className="obrigatorio">*</span></label>
              <select className="select" value={tipoOS} onChange={e => setTipoOS(e.target.value)} required>
                <option value="">Selecione</option>
                <option value="Orçamento">Orçamento</option>
                <option value="Garantia">Garantia</option>
              </select>
            </div>
          </div>

          <div className="criar-os__linha">
            <div className="campo criar-os__campo--largo">
              <label className="label">Equipamento / Aparelho <span className="obrigatorio">*</span></label>
              <div className="criar-os__sugestao-wrapper">
                <input
                  className="input"
                  type="text"
                  placeholder="Ex.: Celular, Notebook, TV..."
                  value={equipamento}
                  onChange={e => setEquipamento(e.target.value)}
                  required
                />
                {sugestoesEquipamento.length > 0 && (
                  <ul className="criar-os__busca-resultados">
                    {sugestoesEquipamento.map(s => (
                      <li key={s} className="criar-os__busca-item" onClick={() => { setEquipamento(s); setSugestoesEquipamento([]) }}>
                        {s}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
            <div className="campo">
              <label className="label">Marca <span className="obrigatorio">*</span></label>
              <div className="criar-os__sugestao-wrapper">
                <input
                  className="input"
                  type="text"
                  placeholder="Ex.: Samsung, Dell, HP..."
                  value={marca}
                  onChange={e => setMarca(e.target.value)}
                  required
                />
                {sugestoesMarca.length > 0 && (
                  <ul className="criar-os__busca-resultados">
                    {sugestoesMarca.map(s => (
                      <li key={s} className="criar-os__busca-item" onClick={() => { setMarca(s); setSugestoesMarca([]) }}>
                        {s}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
            <div className="campo">
              <label className="label">Modelo <span className="obrigatorio">*</span></label>
              <div className="criar-os__sugestao-wrapper">
                <input
                  className="input"
                  type="text"
                  placeholder="Ex.: Galaxy S23, Inspiron 15..."
                  value={modelo}
                  onChange={e => setModelo(e.target.value)}
                  required
                />
                {sugestoesModelo.length > 0 && (
                  <ul className="criar-os__busca-resultados">
                    {sugestoesModelo.map(s => (
                      <li key={s} className="criar-os__busca-item" onClick={() => { setModelo(s); setSugestoesModelo([]) }}>
                        {s}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>

          <div className="criar-os__linha">
            <div className="campo">
              <label className="label">Nº de Série <span className="obrigatorio">*</span></label>
              <input
                className="input"
                type="text"
                placeholder="Ex.: SN123456789"
                value={numeroSerie}
                onChange={e => setNumeroSerie(e.target.value)}
                required
              />
            </div>
            <div className="campo">
              <label className="label">Código / Patrimônio</label>
              <div className="criar-os__patrimonio-lista">
                {codigosPatrimonio.map((codigo, index) => (
                  <div key={index} className="criar-os__patrimonio-item">
                    <input
                      className="input"
                      type="text"
                      placeholder="Ex.: PAT-000123"
                      value={codigo}
                      onChange={e => atualizarPatrimonio(index, e.target.value)}
                    />
                    {index === codigosPatrimonio.length - 1 && (
                      <button className="criar-os__btn-adicionar-patrimonio" type="button" onClick={adicionarPatrimonio}>
                        +
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="condicoes">
              <div className="campo">
              <label className="label">Acessórios / Itens Inclusos</label>
              <textarea className="textarea" placeholder="Ex.: Carregador, Cabo USB..." value={acessorios} onChange={e => setAcessorios(e.target.value)} />
            </div>

            <div className="campo">
              <label className="label">Aparência do Aparelho <span className="obrigatorio">*</span></label>
              <textarea className="textarea" placeholder="Ex.: Boa, Ruim, Riscada, Trincada..." value={aparencia} onChange={e => setAparencia(e.target.value)} required />
            </div>

            <div className="campo">
              <label className="label">Defeito Relatado <span className="obrigatorio">*</span></label>
              <textarea className="textarea" placeholder="Descreva o defeito relatado pelo cliente..." value={defeito} onChange={e => setDefeito(e.target.value)} required />
            </div>

            <div className="campo">
              <label className="label">Observações</label>
              <textarea className="textarea" placeholder="Informações adicionais (opcional)..." value={observacoes} onChange={e => setObservacoes(e.target.value)} />
            </div>
          </div>

          {erro && <p className="criar-os__erro">{erro}</p>}

          <div className="criar-os__rodape">
            <button className="btn-secundario" type="button" onClick={voltarDoFormulario}>
              ← Voltar
            </button>
            <button className="btn-primario" type="submit">
              {osEditando ? 'Atualizar →' : 'Salvar →'}
            </button>
          </div>
        </form>
      )}

    </div>
  )
}
