import db from '@/lib/db'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const clienteId = searchParams.get('clienteId') ?? ''
  const busca     = searchParams.get('busca')     ?? ''
  const status    = searchParams.get('status')    ?? ''

  let query = `
    SELECT
      os.id,
      os.stat,
      os.tipo_os,
      os.tipo_atendimento,
      os.data_entrada,
      e.id as equip_id,
      e.tipo as equip_tipo,
      e.marca,
      e.modelo,
      e.numero_serie,
      e.codigos_patrimonio,
      os.defeito_relatado,
      os.acessorios,
      os.aparencia,
      os.observacoes,
      c.id as cliente_id,
      c.nome as cliente_nome,
      c.telefone as cliente_telefone
    FROM Ordens_Servico os
    JOIN Equipamentos e ON os.equipamento_id = e.id
    JOIN Clientes c ON e.client_id = c.id
    WHERE 1=1
  `
  const params: (string | number)[] = []

  if (clienteId) {
    query += ` AND c.id = ?`
    params.push(parseInt(clienteId))
  }
  if (status) {
    query += ` AND os.stat = ?`
    params.push(status)
  }
  if (busca) {
    query += ` AND (CAST(os.id AS TEXT) LIKE ? OR e.tipo LIKE ? OR e.marca LIKE ? OR e.modelo LIKE ? OR c.nome LIKE ?)`
    const like = `%${busca}%`
    params.push(like, like, like, like, like)
  }

  query += ` ORDER BY os.data_entrada DESC`

  try {
    const ordens = db.prepare(query).all(...params)
    return Response.json(ordens)
  } catch (erro: any) {
    return Response.json({ erro: erro.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const body = await request.json()

  const {
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
  } = body

  const inserirEquipamento = db.prepare(`
    INSERT INTO Equipamentos (client_id, tipo, marca, modelo, numero_serie, codigos_patrimonio)
    VALUES (?, ?, ?, ?, ?, ?)
  `)

  const inserirOrdem = db.prepare(`
    INSERT INTO Ordens_Servico (equipamento_id, stat, tipo_os, tipo_atendimento, defeito_relatado, acessorios, aparencia, observacoes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `)

  const transacao = db.transaction(() => {
    const equipamentoInserido = inserirEquipamento.run(
      clienteId,
      equipamento,
      marca,
      modelo,
      numeroSerie,
      JSON.stringify(codigosPatrimonio.filter((c: string) => c.trim() !== ''))
    )

    const ordemInserida = inserirOrdem.run(
      equipamentoInserido.lastInsertRowid,
      statusOS,
      tipoOS,
      tipoAtendimento,
      defeito,
      acessorios,
      aparencia,
      observacoes
    )

    return ordemInserida.lastInsertRowid
  })

  try {
    const idOrdem = transacao()
    return Response.json({ id: idOrdem }, { status: 201 })
  } catch (erro: any) {
    if (erro.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return Response.json({ erro: 'Número de série já cadastrado.' }, { status: 409 })
    }
    return Response.json({ erro: 'Erro ao criar ordem de serviço.' }, { status: 500 })
  }
}
