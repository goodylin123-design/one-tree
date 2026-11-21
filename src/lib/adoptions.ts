import { verifySecret } from './crypto'
import { readDb } from './db'
import type { Adoption, Tree } from './types'

export function findAdoptionByKey(key: string): { adoption: Adoption; tree: Tree } | null {
  const trimmed = key.trim()
  if (trimmed.length < 16) return null
  const db = readDb()
  const adoption = db.adoptions.find((item) => verifySecret(trimmed, item.cardKeyHash))
  if (!adoption) return null
  const tree = db.trees.find((item) => item.id === adoption.treeId)
  if (!tree) return null
  return { adoption, tree }
}

export function adoptionForTree(treeId: string, adoptionId = '') {
  const db = readDb()
  if (adoptionId) {
    const match = db.adoptions.find((item) => item.id === adoptionId && item.treeId === treeId && item.cardStatus === 'active')
    if (match) return match
  }
  return db.adoptions.find((item) => item.treeId === treeId && item.cardStatus === 'active') ?? null
}
