import Database from 'better-sqlite3'
import path from 'path'
import fs from 'fs'

const db = new Database(path.join(process.cwd(), 'database.db'))

const schema = fs.readFileSync(path.join(process.cwd(), '/lib/schema.sql'), 'utf-8')
db.exec(schema)

export default db