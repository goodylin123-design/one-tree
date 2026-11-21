import fs from 'fs'
import path from 'path'
import { hashSecret } from './crypto'
import { demoTrees } from './demo'
import { seedDatabase } from './seed'
import { SPECIES_INFO, speciesInfo, speciesKey } from './species'
import type { Database, Tree } from './types'

const bundledPath = path.join(process.cwd(), 'data', 'db.json')
const runtimePath = process.env.VERCEL ? path.join('/tmp', 'onetree-db.json') : bundledPath

function parseDb(raw: string): Database {
  try {
    return JSON.parse(raw) as Database
  } catch {
    throw new Error('data/db.json 無法讀取')
  }
}

function ensureShape(db: Database) {
  let dirty = false
  if (!Array.isArray(db.adoptions)) {
    db.adoptions = []
    dirty = true
  }
  if (!Array.isArray(db.species)) {
    db.species = []
    dirty = true
  }
  dirty = ensureSpeciesRows(db) || dirty
  for (const tree of db.trees) {
    dirty = fillTree(tree) || dirty
    const demo = demoTrees.find((item) => item.code === tree.code)
    if (!demo) continue
    if (!tree.tagCode) {
      tree.tagCode = demo.tagCode
      tree.lat = demo.lat
      tree.lng = demo.lng
      dirty = true
    }
    if (!db.adoptions.some((item) => item.treeId === tree.id)) {
      const planter = db.planters.find((item) => item.treeId === tree.id)
      db.adoptions.push({
        id: `adp_demo_${demo.shortcut}`,
        treeId: tree.id,
        adopterName: planter?.displayName || '示例住客',
        adoptedAt: tree.plantedOn,
        cardKeyHash: hashSecret(demo.cardKey),
        cardStatus: 'active',
        locale: 'zh-TW',
      })
      dirty = true
    }
  }
  if (dirty) writeDb(db)
}

function fillTree(tree: Tree) {
  let dirty = false
  if (!tree.zone) {
    tree.zone = '原生植物園區'
    dirty = true
  }
  if (!tree.speciesZh) {
    tree.speciesZh = tree.species
    dirty = true
  }
  if (!tree.speciesLatin) {
    tree.speciesLatin = speciesInfo(tree.species).latin
    dirty = true
  }
  if (tree.lat === undefined) {
    tree.lat = null
    dirty = true
  }
  if (tree.lng === undefined) {
    tree.lng = null
    dirty = true
  }
  if (tree.tagCode === undefined) {
    tree.tagCode = ''
    dirty = true
  }
  if (tree.adoptable === undefined) {
    tree.adoptable = true
    dirty = true
  }
  if (tree.cardPhotoUrl === undefined) {
    tree.cardPhotoUrl = ''
    dirty = true
  }
  if (!tree.speciesId) {
    tree.speciesId = speciesKey(tree.speciesZh || tree.species)
    dirty = true
  }
  return dirty
}

function ensureSpeciesRows(db: Database) {
  let dirty = false
  const names = new Set<string>(Object.keys(SPECIES_INFO))
  for (const tree of db.trees) names.add(tree.speciesZh || tree.species)
  for (const name of names) {
    if (!name) continue
    const id = speciesKey(name)
    if (db.species.some((item) => item.id === id)) continue
    const info = speciesInfo(name)
    db.species.push({
      id,
      speciesZh: name,
      speciesLatin: info.latin,
      co2KgPerYearAvg: null,
      co2Basis: '',
      updatedAt: '',
    })
    dirty = true
  }
  return dirty
}

export function readDb(): Database {
  let db: Database
  if (fs.existsSync(runtimePath)) db = parseDb(fs.readFileSync(runtimePath, 'utf8'))
  else if (runtimePath !== bundledPath && fs.existsSync(bundledPath)) db = parseDb(fs.readFileSync(bundledPath, 'utf8'))
  else {
    db = seedDatabase()
    writeDb(db)
  }
  ensureShape(db)
  return db
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
