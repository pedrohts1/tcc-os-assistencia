import db from '@/lib/db'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const busca = searchParams.get('busca') ?? ''

  const buscarClientes = db.prepare(`
    SELECT id, nome, cpf, telefone, email, endereco
    FROM Clientes
    WHERE nome LIKE ? OR cpf LIKE ? OR telefone LIKE ?
    ORDER BY nome
    LIMIT 10
  `)

  const clientes = buscarClientes.all(`%${busca}%`, `%${busca}%`, `%${busca}%`)
  return Response.json(clientes)
}

export async function POST(request: Request) {
  const body = await request.json()

  const { nome, cpf, telefone, email, endereco } = body

  const inserirCliente = db.prepare(`
    INSERT INTO Clientes (nome, cpf, telefone, email, endereco)
    VALUES (?, ?, ?, ?, ?)
  `)

  try {
    const resultado = inserirCliente.run(nome, cpf || null, telefone || null, email || null, endereco || null)
    return Response.json({ id: resultado.lastInsertRowid }, { status: 201 })
  } catch (erro: any) {
    if (erro.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return Response.json({ erro: 'CPF já cadastrado.' }, { status: 409 })
    }
    return Response.json({ erro: 'Erro ao cadastrar cliente.' }, { status: 500 })
  }
}
