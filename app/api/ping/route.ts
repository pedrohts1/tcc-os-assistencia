import db from '@/lib/db'

export async function GET() {
  const result = db.prepare(`SELECT datetime('now') as agora`).get()
  return Response.json(result)
}