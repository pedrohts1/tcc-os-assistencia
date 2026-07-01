'use client'
import { useState, useEffect } from 'react'
import { formatarCPF, formatarTelefone, validarCPF } from '@/lib/mascaras'

interface Props {
  onCancelar: () => void
  onSalvar: (idOrdem: number) => void
}

interface ClienteResultado {
  id: number
  nome: string
  cpf: string
  telefone: string
  email: string
  endereco: string
}

interface OSLista {
  id: number
  stat: string
  equip_tipo: string
  marca: string
  modelo: string
  data_entrada: string
}

const STATUS_OPCOES = [
  'Aguardando avaliação',
  'Aguardando, autorização orçamento',
  'Autorizado, aguardando peça',
  'Autorizado, reparo em andamento',
  'Pronto, cliente avisado',
  'Finalizado',
]

export default function CriarOS({ onCancelar, onSalvar }: Props) {
  const [fase, setFase] = useState<'cliente' | 'lista-os' | 'formulario'>('cliente')

  const [buscaCliente, setBuscaCliente] = useState('')
  const [resultadosCliente, setResultadosCliente] = useState<ClienteResultado[]>([])
  const [clienteSelecionado, setClienteSelecionado] = useState<ClienteResultado | null>(null)
  const [modoNovoCliente, setModoNovoCliente] = useState(false)
  const [novoNome, setNovoNome] = useState('')
  const [novoCpf, setNovoCpf] = useState('')
  const [novoTelefone, setNovoTelefone] = useState('')
  const [novoEmail, setNovoEmail] = useState('')
  const [novoEndereco, setNovoEndereco] = useState('')
  const [erroCliente, setErroCliente] = useState('')
  const [salvandoCliente, setSalvandoCliente] = useState(false)

  const [ordensExistentes, setOrdensExistentes] = useState<OSLista[]>([])

  const [statusOS, setStatusOS] = useState('Aguardando avaliação')
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
  const [valorTotal, setValorTotal] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')

  useEffect(() => {
    if (buscaCliente.trim() === '' || clienteSelecionado) { setResultadosCliente([]); return }
    const timer = setTimeout(async () => {
      const res = await fetch(`/api/clientes?busca=${encodeURIComponent(buscaCliente)}`)
      setResultadosCliente(res.ok ? await res.json() : [])
    }, 300)
    return () => clearTimeout(timer)
  }, [buscaCliente, clienteSelecionado])

  useEffect(() => {
    if (equipamento.trim() === '') { setSugestoesEquipamento([]); return }
    const timer = setTimeout(async () => {
      const res = await fetch(`/api/sugestoes?campo=tipo&busca=${encodeURIComponent(equipamento)}`)
      setSugestoesEquipamento(res.ok ? await res.json() : [])
    }, 300)
    return () => clearTimeout(timer)
  }, [equipamento])

  useEffect(() => {
    if (marca.trim() === '') { setSugestoesMarca([]); return }
    const timer = setTimeout(async () => {
      const res = await fetch(`/api/sugestoes?campo=marca&busca=${encodeURIComponent(marca)}`)
      setSugestoesMarca(res.ok ? await res.json() : [])
    }, 300)
    return () => clearTimeout(timer)
  }, [marca])

  useEffect(() => {
    if (modelo.trim() === '') { setSugestoesModelo([]); return }
    const timer = setTimeout(async () => {
      const res = await fetch(`/api/sugestoes?campo=modelo&busca=${encodeURIComponent(modelo)}`)
      setSugestoesModelo(res.ok ? await res.json() : [])
    }, 300)
    return () => clearTimeout(timer)
  }, [modelo])

  function selecionarCliente(c: ClienteResultado) {
    setClienteSelecionado(c)
    setBuscaCliente(c.nome)
    setResultadosCliente([])
  }

  function limparCliente() {
    setClienteSelecionado(null)
    setBuscaCliente('')
    setModoNovoCliente(false)
    setErroCliente('')
  }

  async function handleContinuar() {
    if (!clienteSelecionado) return
    const res = await fetch(`/api/ordens?clienteId=${clienteSelecionado.id}`)
    const dados = res.ok ? await res.json() : []
    setOrdensExistentes(Array.isArray(dados) ? dados : [])
    setFase('lista-os')
  }

  async function handleSalvarNovoCliente(e: { preventDefault(): void }) {
    e.preventDefault()
    if (!validarCPF(novoCpf)) { setErroCliente('CPF inválido.'); return }
    setSalvandoCliente(true)
    setErroCliente('')
    const res = await fetch('/api/clientes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome: novoNome, cpf: novoCpf, telefone: novoTelefone, email: novoEmail, endereco: novoEndereco }),
    })
    const dados = await res.json()
    setSalvandoCliente(false)
    if (!res.ok) { setErroCliente(dados.erro ?? 'Erro ao criar cliente.'); return }
    selecionarCliente({ id: dados.id, nome: novoNome, cpf: novoCpf, telefone: novoTelefone, email: novoEmail, endereco: novoEndereco })
    setModoNovoCliente(false)
  }

  function atualizarPatrimonio(index: number, valor: string) {
    setCodigosPatrimonio(prev => prev.map((c, i) => i === index ? valor : c))
  }

  async function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault()
    if (!clienteSelecionado) return
    setSalvando(true)
    setErro('')
    try {
      const res = await fetch('/api/ordens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clienteId: clienteSelecionado.id,
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
          valorTotal,
        }),
      })
      const dados = await res.json()
      if (!res.ok) { setErro(dados.erro ?? 'Erro inesperado.'); return }
      onSalvar(dados.id)
    } catch {
      setErro('Não foi possível conectar ao servidor.')
    } finally {
      setSalvando(false)
    }
  }

  if (fase === 'cliente') {
    return (
      <div className="criar-os">
        <h2 className="criar-os__secao-titulo">Buscar ou Cadastrar Cliente</h2>

        {!modoNovoCliente ? (
          <>
            <div className="campo">
              <label className="label">Nome, CPF ou Telefone <span className="obrigatorio">*</span></label>
              <div className="criar-os__campo-sugestao">
                <input
                  className="input"
                  type="text"
                  placeholder="Digite para buscar..."
                  value={buscaCliente}
                  onChange={e => { setBuscaCliente(e.target.value); setClienteSelecionado(null) }}
                  disabled={!!clienteSelecionado}
                />
                {resultadosCliente.length > 0 && (
                  <ul className="criar-os__busca-resultados">
                    {resultadosCliente.map(c => (
                      <li key={c.id} className="criar-os__busca-item" onClick={() => selecionarCliente(c)}>
                        {c.nome} — {c.cpf} — {c.telefone}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {clienteSelecionado && (
              <div className="criar-os__cliente-dados">
                <div className="criar-os__cliente-campo">
                  <span className="label">Nome</span>
                  <span>{clienteSelecionado.nome}</span>
                </div>
                <div className="criar-os__cliente-campo">
                  <span className="label">CPF</span>
                  <span>{clienteSelecionado.cpf}</span>
                </div>
                <div className="criar-os__cliente-campo">
                  <span className="label">Telefone</span>
                  <span>{clienteSelecionado.telefone}</span>
                </div>
                <div className="criar-os__cliente-campo">
                  <span className="label">E-mail</span>
                  <span>{clienteSelecionado.email}</span>
                </div>
                <div className="criar-os__cliente-campo">
                  <span className="label">Endereço</span>
                  <span>{clienteSelecionado.endereco}</span>
                </div>
              </div>
            )}

            {erroCliente && <p className="criar-os__erro">{erroCliente}</p>}

            <div className="criar-os__rodape">
              <button className="btn-secundario" type="button" onClick={onCancelar}>Cancelar</button>
              {!clienteSelecionado && (
                <button className="btn-secundario" type="button" onClick={() => setModoNovoCliente(true)}>Novo Cliente</button>
              )}
              {clienteSelecionado && (
                <>
                  <button className="btn-terceiro" type="button" onClick={limparCliente}>Trocar Cliente</button>
                  <button className="btn-primario" type="button" onClick={handleContinuar}>Continuar →</button>
                </>
              )}
            </div>
          </>
        ) : (
          <form onSubmit={handleSalvarNovoCliente}>
            <div className="campo">
              <label className="label">Nome <span className="obrigatorio">*</span></label>
              <input className="input" type="text" value={novoNome} onChange={e => setNovoNome(e.target.value.toUpperCase())} required />
            </div>
            <div className="campo">
              <label className="label">CPF <span className="obrigatorio">*</span></label>
              <input className="input" type="text" placeholder="000.000.000-00" value={novoCpf} onChange={e => setNovoCpf(formatarCPF(e.target.value))} required />
            </div>
            <div className="campo">
              <label className="label">Telefone</label>
              <input className="input" type="text" placeholder="(00) 00000-0000" value={novoTelefone} onChange={e => setNovoTelefone(formatarTelefone(e.target.value))} />
            </div>
            <div className="campo">
              <label className="label">E-mail</label>
              <input className="input" type="text" value={novoEmail} onChange={e => setNovoEmail(e.target.value.toUpperCase())} />
            </div>
            <div className="campo">
              <label className="label">Endereço</label>
              <input className="input" type="text" value={novoEndereco} onChange={e => setNovoEndereco(e.target.value.toUpperCase())} />
            </div>
            {erroCliente && <p className="criar-os__erro">{erroCliente}</p>}
            <div className="criar-os__rodape">
              <button className="btn-secundario" type="button" onClick={() => setModoNovoCliente(false)}>Voltar</button>
              <button className="btn-primario" type="submit" disabled={salvandoCliente}>
                {salvandoCliente ? 'Salvando...' : 'Salvar Cliente'}
              </button>
            </div>
          </form>
        )}
      </div>
    )
  }

  if (fase === 'lista-os') {
    return (
      <div className="criar-os">
        <h2 className="criar-os__secao-titulo">OS de {clienteSelecionado?.nome}</h2>

        {ordensExistentes.length === 0 ? (
          <p>Nenhuma OS anterior para este cliente.</p>
        ) : (
          <table className="listar-os__tabela">
            <thead>
              <tr>
                <th>Nº OS</th>
                <th>Status</th>
                <th>Equipamento</th>
                <th>Data</th>
              </tr>
            </thead>
            <tbody>
              {ordensExistentes.map(os => (
                <tr key={os.id}>
                  <td>#{os.id}</td>
                  <td>{os.stat}</td>
                  <td>{os.equip_tipo} {os.marca} {os.modelo}</td>
                  <td>{new Date(os.data_entrada).toLocaleDateString('pt-BR')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <div className="criar-os__rodape">
          <button className="btn-secundario" type="button" onClick={() => setFase('cliente')}>Voltar</button>
          <button className="btn-primario" type="button" onClick={() => setFase('formulario')}>Nova OS →</button>
        </div>
      </div>
    )
  }

  return (
    <div className="criar-os">
      <div className="criar-os__cliente">
        <h2 className="criar-os__cliente-titulo">Cliente</h2>
        <div className="criar-os__cliente-dados">
          <div className="criar-os__cliente-campo">
            <span className="label">Nome</span>
            <span>{clienteSelecionado?.nome}</span>
          </div>
          <div className="criar-os__cliente-campo">
            <span className="label">Telefone</span>
            <span>{clienteSelecionado?.telefone}</span>
          </div>
          <div className="criar-os__cliente-campo">
            <span className="label">E-mail</span>
            <span>{clienteSelecionado?.email}</span>
          </div>
          <div className="criar-os__cliente-campo">
            <span className="label">Endereço</span>
            <span>{clienteSelecionado?.endereco}</span>
          </div>
        </div>
      </div>

      <form className="criar-os__formulario" onSubmit={handleSubmit}>
        <h2 className="criar-os__secao-titulo">Dados da OS</h2>

        <div className="criar-os__linha">
          <div className="campo">
            <label className="label">Status <span className="obrigatorio">*</span></label>
            <select className="select" value={statusOS} onChange={e => setStatusOS(e.target.value)} required>
              {STATUS_OPCOES.map(s => <option key={s} value={s}>{s}</option>)}
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
            <div className="criar-os__campo-sugestao">
              <input
                className="input"
                type="text"
                placeholder="Ex.: Celular, Notebook, TV..."
                value={equipamento}
                onChange={e => setEquipamento(e.target.value.toUpperCase())}
                required
              />
              {sugestoesEquipamento.length > 0 && (
                <ul className="criar-os__busca-resultados">
                  {sugestoesEquipamento.map(s => (
                    <li key={s} className="criar-os__busca-item" onClick={() => { setEquipamento(s); setSugestoesEquipamento([]) }}>{s}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
          <div className="campo">
            <label className="label">Marca <span className="obrigatorio">*</span></label>
            <div className="criar-os__campo-sugestao">
              <input
                className="input"
                type="text"
                placeholder="Ex.: Samsung, Dell..."
                value={marca}
                onChange={e => setMarca(e.target.value.toUpperCase())}
                required
              />
              {sugestoesMarca.length > 0 && (
                <ul className="criar-os__busca-resultados">
                  {sugestoesMarca.map(s => (
                    <li key={s} className="criar-os__busca-item" onClick={() => { setMarca(s); setSugestoesMarca([]) }}>{s}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
          <div className="campo">
            <label className="label">Modelo <span className="obrigatorio">*</span></label>
            <div className="criar-os__campo-sugestao">
              <input
                className="input"
                type="text"
                placeholder="Ex.: Galaxy S23..."
                value={modelo}
                onChange={e => setModelo(e.target.value.toUpperCase())}
                required
              />
              {sugestoesModelo.length > 0 && (
                <ul className="criar-os__busca-resultados">
                  {sugestoesModelo.map(s => (
                    <li key={s} className="criar-os__busca-item" onClick={() => { setModelo(s); setSugestoesModelo([]) }}>{s}</li>
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
              onChange={e => setNumeroSerie(e.target.value.toUpperCase())}
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
                    onChange={e => atualizarPatrimonio(index, e.target.value.toUpperCase())}
                  />
                  {index === codigosPatrimonio.length - 1 && (
                    <button
                      className="criar-os__btn-adicionar-patrimonio"
                      type="button"
                      onClick={() => setCodigosPatrimonio(prev => [...prev, ''])}
                    >+</button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="campo">
          <label className="label">Acessórios / Itens Inclusos</label>
          <textarea
            className="textarea"
            placeholder="Ex.: Carregador, Cabo USB, Con le..."
            value={acessorios}
            onChange={e => setAcessorios(e.target.value)}
          />
        </div>

        <div className="campo">
          <label className="label">Aparência do Aparelho <span className="obrigatorio">*</span></label>
          <textarea
            className="textarea"
            placeholder="Ex.: Boa, Ruim, Suja, Riscada, Trincada..."
            value={aparencia}
            onChange={e => setAparencia(e.target.value)}
            required
          />
        </div>

        <div className="campo">
          <label className="label">Defeito Relatado <span className="obrigatorio">*</span></label>
          <textarea
            className="textarea"
            placeholder="Descreva o defeito relatado pelo cliente..."
            value={defeito}
            onChange={e => setDefeito(e.target.value)}
            required
          />
        </div>

        <div className="campo">
          <label className="label">Observações</label>
          <textarea
            className="textarea"
            placeholder="Informações adicionais (opcional)..."
            value={observacoes}
            onChange={e => setObservacoes(e.target.value)}
          />
        </div>

        <div className="campo">
          <label className="label">Valor Total do Orçamento (R$)</label>
          <input
            className="input"
            type="number"
            min="0"
            step="0.01"
            placeholder="0,00"
            value={valorTotal}
            onChange={e => setValorTotal(e.target.value)}
          />
        </div>

        <div className="criar-os__rodape">
          {erro && <span className="criar-os__erro">{erro}</span>}
          <button className="btn-secundario" type="button" onClick={() => setFase('lista-os')}>Voltar</button>
          <button className="btn-primario" type="submit" disabled={salvando}>
            {salvando ? 'Salvando...' : 'Salvar OS →'}
          </button>
        </div>
      </form>
    </div>
  )
}
