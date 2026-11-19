import { readDb } from './db'
import type { Certificate, Group, Planter, Tree, TreeMessage, TreeUpdate } from './types'

export type TreeBundle = {
  tree: Tree
  group: Group
  planters: Planter[]
  updates: TreeUpdate[]
  messages: TreeMessage[]
  certificate: Certificate | null
}

export function getTreeBundle(code: string): TreeBundle | null {
  const db = readDb()
  const tree = db.trees.find((item) => item.code === code)
  if (!tree) return null
  const group = db.groups.find((item) => item.id === tree.groupId)
  if (!group) return null
  return {
    tree,
    group,
    planters: db.planters.filter((item) => item.treeId === tree.id),
    updates: db.updates
      .filter((item) => item.treeId === tree.id)
      .sort((a, b) => a.takenOn.localeCompare(b.takenOn) || a.createdAt.localeCompare(b.createdAt)),
    messages: db.messages
      .filter((item) => item.treeId === tree.id)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
    certificate: db.certificates.find((item) => item.groupId === group.id) ?? null,
  }
}

export function latestUpdate(updates: TreeUpdate[]) {
  return updates.length ? updates[updates.length - 1] : null
}

export function getGroupBundle(code: string) {
  const db = readDb()
  const group = db.groups.find((item) => item.code === code)
  if (!group) return null
  const trees = db.trees.filter((item) => item.groupId === group.id)
  return {
    group,
    certificate: db.certificates.find((item) => item.groupId === group.id) ?? null,
    trees: trees.map((tree) => ({
      tree,
      planters: db.planters.filter((item) => item.treeId === tree.id),
      updates: db.updates
        .filter((item) => item.treeId === tree.id)
        .sort((a, b) => a.takenOn.localeCompare(b.takenOn)),
      messages: db.messages.filter((item) => item.treeId === tree.id && item.isPublic),
    })),
  }
}

export function findStaff(id: string) {
  return readDb().staff.find((item) => item.id === id) ?? null
}

export async function staffFromSession(id: string | null) {
  if (!id) return null
  return findStaff(id)
}
