import db from '@/lib/db'

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: idStr } = await params
  const id = parseInt(idStr)
  const body = await request.json()

  const {
    equipId,
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
  } = body

  const atualizarEquipamento = db.prepare(`
    UPDATE Equipamentos
    SET tipo = ?, marca = ?, modelo = ?, numero_serie = ?, codigos_patrimonio = ?
    WHERE id = ?
  `)

  const atualizarOrdem = db.prepare(`
    UPDATE Ordens_Servico
    SET stat = ?, tipo_os = ?, tipo_atendimento = ?, defeito_relatado = ?, acessorios = ?, aparencia = ?, observacoes = ?
    WHERE id = ?
  `)

  const transacao = db.transaction(() => {
    atualizarEquipamento.run(
      equipamento,
      marca,
      modelo,
      numeroSerie,
      JSON.stringify(codigosPatrimonio.filter((c: string) => c.trim() !== '')),
      equipId
    )
    atualizarOrdem.run(
      statusOS,
      tipoOS,
      tipoAtendimento,
      defeito,
      acessorios,
      aparencia,
      observacoes,
      id
    )
  })

  try {
    transacao()
    return Response.json({ id }, { status: 200 })
  } catch (erro: any) {
    if (erro.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return Response.json({ erro: 'Número de série já cadastrado.' }, { status: 409 })
    }
    return Response.json({ erro: 'Erro ao atualizar ordem de serviço.' }, { status: 500 })
  }
}
