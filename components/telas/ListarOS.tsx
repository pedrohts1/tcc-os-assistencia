'use client'
import { useState, useEffect } from 'react'

interface Props {
  clienteFiltro?: { id: number, nome: string } | null
  onLimparFiltro?: () => void
}

interface OSLista {
  id: number
  stat: string
  tipo_os: string
  tipo_atendimento: string
  data_entrada: string
  equip_id: number
  equip_tipo: string
  marca: string
  modelo: string
  numero_serie: string
  codigos_patrimonio: string
  defeito_relatado: string
  acessorios: string
  aparencia: string
  observacoes: string
  valor_total: number | null
  cliente_id: number
  cliente_nome: string
  cliente_telefone: string
}

const STATUS_OPCOES = [
  'Aguardando avaliação',
  'Aguardando, autorização orçamento',
  'Autorizado, aguardando peça',
  'Autorizado, reparo em andamento',
  'Pronto, cliente avisado',
  'Finalizado',
]

export default function ListarOS({ clienteFiltro, onLimparFiltro }: Props) {
  const [ordens, setOrdens] = useState<OSLista[]>([])
  const [busca, setBusca] = useState('')
  const [filtroStatus, setFiltroStatus] = useState('')
  const [carregando, setCarregando] = useState(true)

  const [osEditando, setOsEditando] = useState<OSLista | null>(null)
  const [statusEd, setStatusEd] = useState('')
  const [tipoAtendimentoEd, setTipoAtendimentoEd] = useState('')
  const [tipoOSEd, setTipoOSEd] = useState('')
  const [equipamentoEd, setEquipamentoEd] = useState('')
  const [sugestoesEquipamento, setSugestoesEquipamento] = useState<string[]>([])
  const [marcaEd, setMarcaEd] = useState('')
  const [sugestoesMarca, setSugestoesMarca] = useState<string[]>([])
  const [modeloEd, setModeloEd] = useState('')
  const [sugestoesModelo, setSugestoesModelo] = useState<string[]>([])
  const [numeroSerieEd, setNumeroSerieEd] = useState('')
  const [codigosPatrimonioEd, setCodigosPatrimonioEd] = useState<string[]>([''])
  const [acessoriosEd, setAcessoriosEd] = useState('')
  const [aparenciaEd, setAparenciaEd] = useState('')
  const [defeitoEd, setDefeitoEd] = useState('')
  const [observacoesEd, setObservacoesEd] = useState('')
  const [valorTotalEd, setValorTotalEd] = useState('')
  const [erroJanela, setErroJanela] = useState('')
  const [digitandoEquipamento, setDigitandoEquipamento] = useState(false)
  const [digitandoMarca, setDigitandoMarca] = useState(false)
  const [digitandoModelo, setDigitandoModelo] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => { buscarOrdens() }, 300)
    return () => clearTimeout(timer)
  }, [busca, filtroStatus, clienteFiltro])

  useEffect(() => {
    if (equipamentoEd.trim() === '') { setSugestoesEquipamento([]); return }
    const timer = setTimeout(async () => {
      const res = await fetch(`/api/sugestoes?campo=tipo&busca=${encodeURIComponent(equipamentoEd)}`)
      setSugestoesEquipamento(res.ok ? await res.json() : [])
    }, 300)
    return () => clearTimeout(timer)
  }, [equipamentoEd])

  useEffect(() => {
    if (marcaEd.trim() === '') { setSugestoesMarca([]); return }
    const timer = setTimeout(async () => {
      const res = await fetch(`/api/sugestoes?campo=marca&busca=${encodeURIComponent(marcaEd)}`)
      setSugestoesMarca(res.ok ? await res.json() : [])
    }, 300)
    return () => clearTimeout(timer)
  }, [marcaEd])

  useEffect(() => {
    if (modeloEd.trim() === '') { setSugestoesModelo([]); return }
    const timer = setTimeout(async () => {
      const res = await fetch(`/api/sugestoes?campo=modelo&busca=${encodeURIComponent(modeloEd)}`)
      setSugestoesModelo(res.ok ? await res.json() : [])
    }, 300)
    return () => clearTimeout(timer)
  }, [modeloEd])

  async function buscarOrdens() {
    setCarregando(true)
    const params = new URLSearchParams()
    if (clienteFiltro) params.set('clienteId', String(clienteFiltro.id))
    if (busca) params.set('busca', busca)
    if (filtroStatus) params.set('status', filtroStatus)
    const res = await fetch(`/api/ordens?${params.toString()}`)
    const dados = res.ok ? await res.json() : []
    setOrdens(Array.isArray(dados) ? dados : [])
    setCarregando(false)
  }

  function abrirEdicao(os: OSLista) {
    setOsEditando(os)
    setStatusEd(os.stat || 'Aguardando avaliação')
    setTipoAtendimentoEd(os.tipo_atendimento || '')
    setTipoOSEd(os.tipo_os || '')
    setEquipamentoEd(os.equip_tipo || '')
    setMarcaEd(os.marca || '')
    setModeloEd(os.modelo || '')
    setNumeroSerieEd(os.numero_serie || '')
    const parsed = os.codigos_patrimonio ? JSON.parse(os.codigos_patrimonio) : []
    setCodigosPatrimonioEd(parsed.length > 0 ? parsed : [''])
    setAcessoriosEd(os.acessorios || '')
    setAparenciaEd(os.aparencia || '')
    setDefeitoEd(os.defeito_relatado || '')
    setObservacoesEd(os.observacoes || '')
    setValorTotalEd(os.valor_total != null ? String(os.valor_total) : '')
    setErroJanela('')
    setDigitandoEquipamento(false)
    setDigitandoMarca(false)
    setDigitandoModelo(false)
  }

  function fecharJanela() {
    setOsEditando(null)
    setErroJanela('')
    setSugestoesEquipamento([])
    setSugestoesMarca([])
    setSugestoesModelo([])
    setDigitandoEquipamento(false)
    setDigitandoMarca(false)
    setDigitandoModelo(false)
  }

  function atualizarPatrimonio(index: number, valor: string) {
    setCodigosPatrimonioEd(prev => prev.map((c, i) => i === index ? valor : c))
  }

  async function handleSalvar(e: { preventDefault(): void }) {
    e.preventDefault()
    if (!osEditando) return
    setErroJanela('')

    const res = await fetch(`/api/ordens/${osEditando.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        equipId: osEditando.equip_id,
        statusOS: statusEd,
        tipoOS: tipoOSEd,
        tipoAtendimento: tipoAtendimentoEd,
        equipamento: equipamentoEd,
        marca: marcaEd,
        modelo: modeloEd,
        numeroSerie: numeroSerieEd,
        codigosPatrimonio: codigosPatrimonioEd,
        acessorios: acessoriosEd,
        aparencia: aparenciaEd,
        defeito: defeitoEd,
        observacoes: observacoesEd,
        valorTotal: valorTotalEd,
      }),
    })
    const dados = await res.json()
    if (!res.ok) { setErroJanela(dados.erro ?? 'Erro ao salvar.'); return }
    fecharJanela()
    buscarOrdens()
  }

  async function handleExcluir() {
    if (!osEditando) return
    if (!confirm(`Excluir OS #${osEditando.id}? Esta ação não pode ser desfeita.`)) return

    const res = await fetch(`/api/ordens/${osEditando.id}`, { method: 'DELETE' })
    if (!res.ok) { setErroJanela('Erro ao excluir OS.'); return }
    fecharJanela()
    buscarOrdens()
  }

  function handleImprimir(os: OSLista) {
    const janelaImpressao = window.open('', '_blank')
    if (!janelaImpressao) return

    const dataFormatada = new Date(os.data_entrada).toLocaleDateString('pt-BR')
    const valorFormatado = os.valor_total != null
      ? `R$ ${Number(os.valor_total).toFixed(2).replace('.', ',')}`
      : '—'

    janelaImpressao.document.write(`
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <title>OS #${os.id} — TecAssist</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; color: #222; }
          h1 { font-size: 22px; margin-bottom: 4px; }
          h2 { font-size: 15px; margin-top: 24px; margin-bottom: 6px; border-bottom: 1px solid #ccc; padding-bottom: 4px; }
          h3 { font-size: 25px; margin-bottom: 4px; text-align: center; }
          p { margin: 4px 0; font-size: 14px; }
          .assinatura { margin-top: 56px; text-align: right; }
        </style>
      </head>
      <body>
        <h3>TecAssist</h3>
        <h1>Ordem de Serviço: ${os.id}</h1>
        <p>Data de entrada: ${dataFormatada}</p>
        <p>Tipo de Atendimento: ${os.tipo_atendimento}</p>
        <p>Tipo de Serviço: ${os.tipo_os}</p>

        <h2>Cliente</h2>
        <p><strong>Nome:</strong> ${os.cliente_nome}</p>
        <p><strong>Telefone:</strong> ${os.cliente_telefone || '—'}</p>

        <h2>Equipamento</h2>
        <p><strong>Aparelho:</strong> ${os.equip_tipo}</p>
        <p><strong>Marca:</strong> ${os.marca}</p>
        <p><strong>Modelo:</strong> ${os.modelo}</p>
        <p><strong>Nº de Série:</strong> ${os.numero_serie}</p>

        <h2>Dados da OS</h2>
        <p><strong>Defeito relatado:</strong> ${os.defeito_relatado || '—'}</p>
        <p><strong>Acessórios:</strong> ${os.acessorios || '—'}</p>
        <p><strong>Aparência:</strong> ${os.aparencia || '—'}</p>
        <p><strong>Observações:</strong> ${os.observacoes || '—'}</p>
        <p><strong>Valor total:</strong> ${valorFormatado}</p>

        <div class="assinatura">
          <p>_______________________________</p>
          <p>Assinatura do cliente</p>
        </div>
      </body>
      </html>
    `)
    janelaImpressao.document.close()
    janelaImpressao.print()
  }

  return (
    <div className="listar-os">
      <div className="listar-os__cabecalho">
        <h2 className="listar-os__titulo">
          {clienteFiltro ? `OS de ${clienteFiltro.nome}` : 'Ordens de Serviço'}
        </h2>
        {clienteFiltro && onLimparFiltro && (
          <button className="btn-secundario" type="button" onClick={onLimparFiltro}>
            Ver todas as OS
          </button>
        )}
      </div>

      <div className="listar-os__filtros">
        <input
          className="input"
          type="text"
          placeholder="Buscar por nº OS, equipamento ou cliente..."
          value={busca}
          onChange={e => setBusca(e.target.value)}
        />
        <select
          className="select"
          value={filtroStatus}
          onChange={e => setFiltroStatus(e.target.value)}
        >
          <option value="">Todos os status</option>
          {STATUS_OPCOES.map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {carregando ? (
        <p>Carregando...</p>
      ) : ordens.length === 0 ? (
        <p>Nenhuma OS encontrada.</p>
      ) : (
        <table className="listar-os__tabela">
          <thead>
            <tr>
              <th>Nº OS</th>
              <th>Cliente</th>
              <th>Situação</th>
              <th>Tipo de OS</th>
              <th>Valor</th>
              <th>Entrada</th>
              <th>Equipamento</th>
              <th>Marca</th>
              <th>Modelo</th>
              <th>Nº Série</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {ordens.map(os => (
              <tr key={os.id} onClick={() => abrirEdicao(os)}>
                <td>{os.id}</td>
                <td>{os.cliente_nome}</td>
                <td data-status={os.stat}>{os.stat} </td>
                <td>{os.tipo_os}</td>
                <td>R${os.valor_total || '0'},00</td>
                <td>{new Date(os.data_entrada).toLocaleDateString('pt-BR')}</td>
                <td>{os.equip_tipo}</td>
                <td>{os.marca}</td>
                <td>{os.modelo}</td>
                <td>{os.numero_serie}</td>
                <td className='rewa'>
                  <button className="btn-primario" type="button" onClick={e => { e.stopPropagation(); abrirEdicao(os) }}>Editar</button>
                  <button className="btn-secundario" type="button" onClick={e => { e.stopPropagation(); handleImprimir(os) }}>Imprimir</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {osEditando && (
        <div className="janela-overlay">
          <div className="janela">
            <h2 className="janela__titulo">Editar OS #{osEditando.id}</h2>
            <form onSubmit={handleSalvar}>

              <div className="criar-os__linha">
                <div className="campo">
                  <label className="label">Status <span className="obrigatorio">*</span></label>
                  <select className="select" value={statusEd} onChange={e => setStatusEd(e.target.value)} required>
                    {STATUS_OPCOES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="campo">
                  <label className="label">Tipo de Atendimento <span className="obrigatorio">*</span></label>
                  <select className="select" value={tipoAtendimentoEd} onChange={e => setTipoAtendimentoEd(e.target.value)} required>
                    <option value="">Selecione</option>
                    <option value="Balcão">Balcão</option>
                    <option value="Domicílio">Domicílio</option>
                    <option value="Remoto">Remoto</option>
                  </select>
                </div>
                <div className="campo">
                  <label className="label">Tipo de OS <span className="obrigatorio">*</span></label>
                  <select className="select" value={tipoOSEd} onChange={e => setTipoOSEd(e.target.value)} required>
                    <option value="">Selecione</option>
                    <option value="Orçamento">Orçamento</option>
                    <option value="Garantia">Garantia</option>
                  </select>
                </div>
              </div>

              <div className="criar-os__linha">
                <div className="campo criar-os__campo--largo">
                  <label className="label">Equipamento <span className="obrigatorio">*</span></label>
                  <div className="criar-os__campo-sugestao">
                    <input className="input" type="text" value={equipamentoEd} onChange={e => { setEquipamentoEd(e.target.value.toUpperCase()); setDigitandoEquipamento(true) }} required />
                    {digitandoEquipamento && sugestoesEquipamento.length > 0 && (
                      <ul className="criar-os__busca-resultados">
                        {sugestoesEquipamento.map(s => (
                          <li key={s} className="criar-os__busca-item" onClick={() => { setEquipamentoEd(s); setSugestoesEquipamento([]); setDigitandoEquipamento(false) }}>{s}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
                <div className="campo">
                  <label className="label">Marca <span className="obrigatorio">*</span></label>
                  <div className="criar-os__campo-sugestao">
                    <input className="input" type="text" value={marcaEd} onChange={e => { setMarcaEd(e.target.value.toUpperCase()); setDigitandoMarca(true) }} required />
                    {digitandoMarca && sugestoesMarca.length > 0 && (
                      <ul className="criar-os__busca-resultados">
                        {sugestoesMarca.map(s => (
                          <li key={s} className="criar-os__busca-item" onClick={() => { setMarcaEd(s); setSugestoesMarca([]); setDigitandoMarca(false) }}>{s}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
                <div className="campo">
                  <label className="label">Modelo <span className="obrigatorio">*</span></label>
                  <div className="criar-os__campo-sugestao">
                    <input className="input" type="text" value={modeloEd} onChange={e => { setModeloEd(e.target.value.toUpperCase()); setDigitandoModelo(true) }} required />
                    {digitandoModelo && sugestoesModelo.length > 0 && (
                      <ul className="criar-os__busca-resultados">
                        {sugestoesModelo.map(s => (
                          <li key={s} className="criar-os__busca-item" onClick={() => { setModeloEd(s); setSugestoesModelo([]); setDigitandoModelo(false) }}>{s}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>

              <div className="criar-os__linha">
                <div className="campo">
                  <label className="label">Nº de Série <span className="obrigatorio">*</span></label>
                  <input className="input" type="text" value={numeroSerieEd} onChange={e => setNumeroSerieEd(e.target.value.toUpperCase())} required />
                </div>
                <div className="campo">
                  <label className="label">Código / Patrimônio</label>
                  <div className="criar-os__patrimonio-lista">
                    {codigosPatrimonioEd.map((codigo, index) => (
                      <div key={index} className="criar-os__patrimonio-item">
                        <input className="input" type="text" placeholder="Ex.: PAT-000123" value={codigo} onChange={e => atualizarPatrimonio(index, e.target.value.toUpperCase())} />
                        {index === codigosPatrimonioEd.length - 1 && (
                          <button className="criar-os__btn-adicionar-patrimonio" type="button" onClick={() => setCodigosPatrimonioEd(prev => [...prev, ''])}>+</button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="campo">
                <label className="label">Acessórios / Itens Inclusos</label>
                <textarea className="textarea" value={acessoriosEd} onChange={e => setAcessoriosEd(e.target.value)} />
              </div>

              <div className="campo">
                <label className="label">Aparência do Aparelho <span className="obrigatorio">*</span></label>
                <textarea className="textarea" value={aparenciaEd} onChange={e => setAparenciaEd(e.target.value)} required />
              </div>

              <div className="campo">
                <label className="label">Defeito Relatado <span className="obrigatorio">*</span></label>
                <textarea className="textarea" value={defeitoEd} onChange={e => setDefeitoEd(e.target.value)} required />
              </div>

              <div className="campo">
                <label className="label">Observações</label>
                <textarea className="textarea" value={observacoesEd} onChange={e => setObservacoesEd(e.target.value)} />
              </div>

              <div className="campo">
                <label className="label">Valor Total do Orçamento (R$)</label>
                <input className="input" type="number" min="0" step="0.01" placeholder="0,00" value={valorTotalEd} onChange={e => setValorTotalEd(e.target.value)} />
              </div>

              {erroJanela && <p className="criar-os__erro">{erroJanela}</p>}

              <div className="janela__rodape">
                <button className="btn-secundario" type="button" onClick={handleExcluir}>Excluir</button>
                <button className="btn-secundario" type="button" onClick={fecharJanela}>Cancelar</button>
                <button className="btn-primario" type="submit">Salvar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
