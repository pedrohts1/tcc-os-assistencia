import db from '@/lib/db'

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: idStr } = await params
  const id = parseInt(idStr)
  const body = await request.json()

  const { nome, cpf, telefone, email, endereco } = body

  try {
    db.prepare(`
      UPDATE Clientes
      SET nome = ?, cpf = ?, telefone = ?, email = ?, endereco = ?
      WHERE id = ?
    `).run(nome, cpf || null, telefone || null, email || null, endereco || null, id)

    return Response.json({ id })
  } catch (erro: any) {
    if (erro.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return Response.json({ erro: 'CPF já cadastrado para outro cliente.' }, { status: 409 })
    }
    return Response.json({ erro: 'Erro ao atualizar cliente.' }, { status: 500 })
  }
}
