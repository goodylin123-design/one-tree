import fs from 'fs'
import path from 'path'
import { seedDatabase } from './seed'
import type { Database } from './types'

const bundledPath = path.join(process.cwd(), 'data', 'db.json')
const runtimePath = process.env.VERCEL ? path.join('/tmp', 'onetree-db.json') : bundledPath

function parseDb(raw: string): Database {
  try {
    return JSON.parse(raw) as Database
  } catch {
    throw new Error('data/db.json 無法讀取')
  }
}

export function readDb(): Database {
  if (fs.existsSync(runtimePath)) return parseDb(fs.readFileSync(runtimePath, 'utf8'))
  if (runtimePath !== bundledPath && fs.existsSync(bundledPath)) return parseDb(fs.readFileSync(bundledPath, 'utf8'))
  const seeded = seedDatabase()
  writeDb(seeded)
  return seeded
}

function writeDb(db: Database) {
  fs.mkdirSync(path.dirname(runtimePath), { recursive: true })
  const tmp = `${runtimePath}.${process.pid}.tmp`
  fs.writeFileSync(tmp, JSON.stringify(db, null, 2), 'utf8')
  fs.renameSync(tmp, runtimePath)
}

let queue: Promise<unknown> = Promise.resolve()

export function updateDb<T>(fn: (db: Database) => T): Promise<T> {
  const run = queue.then(() => {
    const db = readDb()
    const result = fn(db)
    writeDb(db)
    return result
  })
  queue = run.then(
    () => undefined,
    () => undefined,
  )
  return run
}
