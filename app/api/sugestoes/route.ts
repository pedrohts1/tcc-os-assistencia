import db from '@/lib/db'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const campo = searchParams.get('campo') ?? ''
  const busca = searchParams.get('busca') ?? ''

  const camposPermitidos = ['tipo', 'marca', 'modelo']
  if (!camposPermitidos.includes(campo)) {
    return Response.json([])
  }

  const resultado = db.prepare(`
    SELECT DISTINCT ${campo} as valor
    FROM Equipamentos
    WHERE ${campo} LIKE ?
    AND ${campo} IS NOT NULL AND ${campo} != ''
    ORDER BY ${campo}
    LIMIT 8
  `).all(`%${busca}%`) as { valor: string }[]

  return Response.json(resultado.map(r => r.valor))
}
