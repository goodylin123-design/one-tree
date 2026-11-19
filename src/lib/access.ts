import { updateDb } from './db'
import { verifySecret } from './crypto'

const LOCK_MS = 10 * 60 * 1000

export async function attemptPin(code: string, pin: string): Promise<'ok' | 'notfound' | 'locked'> {
  return updateDb((db) => {
    const tree = db.trees.find((item) => item.code === code)
    if (!tree) return 'notfound' as const
    if (tree.lockedUntil && Date.parse(tree.lockedUntil) > Date.now()) return 'locked' as const
    if (!/^\d{6}$/.test(pin) || !verifySecret(pin, tree.pinHash)) {
      tree.failedAttempts += 1
      if (tree.failedAttempts >= 5) {
        tree.failedAttempts = 0
        tree.lockedUntil = new Date(Date.now() + LOCK_MS).toISOString()
        return 'locked' as const
      }
      return 'notfound' as const
    }
    tree.failedAttempts = 0
    tree.lockedUntil = null
    return 'ok' as const
  })
}
