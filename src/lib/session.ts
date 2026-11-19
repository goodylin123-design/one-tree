import { cookies } from 'next/headers'
import { safeEqual, signBody } from './crypto'

export const TREE_COOKIE = 'onetree_tree'
export const ADMIN_COOKIE = 'onetree_admin'
const MAX_AGE = 60 * 60 * 24 * 120

export function cookieBase() {
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: MAX_AGE,
  }
}

export function seal(payload: Record<string, string | number>) {
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url')
  return `${body}.${signBody(body)}`
}

export function unseal(raw: string | undefined): Record<string, unknown> | null {
  if (!raw) return null
  const dot = raw.lastIndexOf('.')
  if (dot <= 0) return null
  const body = raw.slice(0, dot)
  const sig = raw.slice(dot + 1)
  if (!safeEqual(sig, signBody(body))) return null
  try {
    const data = JSON.parse(Buffer.from(body, 'base64url').toString('utf8')) as Record<string, unknown>
    if (typeof data.exp !== 'number' || data.exp < Date.now()) return null
    return data
  } catch {
    return null
  }
}

export function sealTree(code: string) {
  return seal({ kind: 'tree', code, exp: Date.now() + MAX_AGE * 1000 })
}

export function sealAdmin(id: string) {
  return seal({ kind: 'admin', id, exp: Date.now() + 60 * 60 * 12 * 1000 })
}

export async function readTreeCode() {
  const jar = await cookies()
  const data = unseal(jar.get(TREE_COOKIE)?.value)
  if (!data || data.kind !== 'tree' || typeof data.code !== 'string') return null
  return data.code
}

export async function readAdminId() {
  const jar = await cookies()
  const data = unseal(jar.get(ADMIN_COOKIE)?.value)
  if (!data || data.kind !== 'admin' || typeof data.id !== 'string') return null
  return data.id
}

export async function setTreeSession(code: string) {
  const jar = await cookies()
  jar.set(TREE_COOKIE, sealTree(code), cookieBase())
}

export async function clearTreeSession() {
  const jar = await cookies()
  jar.delete(TREE_COOKIE)
}

export async function setAdminSession(id: string) {
  const jar = await cookies()
  jar.set(ADMIN_COOKIE, sealAdmin(id), { ...cookieBase(), maxAge: 60 * 60 * 12 })
}

export async function clearAdminSession() {
  const jar = await cookies()
  jar.delete(ADMIN_COOKIE)
}
