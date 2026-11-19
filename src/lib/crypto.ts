import { createCipheriv, createDecipheriv, createHmac, randomBytes, scryptSync, timingSafeEqual } from 'crypto'

const SCRYPT = { N: 16384, r: 8, p: 1 } as const

export function appSecret() {
  return process.env.SESSION_SECRET || 'onetree-dev-secret-change-before-launch'
}

export function nid(prefix: string) {
  return `${prefix}_${randomBytes(6).toString('hex')}`
}

export function randomCode(length = 8) {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  const bytes = randomBytes(length)
  let out = ''
  for (let i = 0; i < length; i += 1) out += alphabet[bytes[i]! % alphabet.length]
  return out
}

export function randomPin() {
  return String(randomBytes(4).readUInt32BE(0) % 1_000_000).padStart(6, '0')
}

export function randomToken() {
  return randomBytes(18).toString('base64url')
}

export function hashSecret(value: string) {
  const salt = randomBytes(16).toString('hex')
  const hash = scryptSync(value, salt, 32, SCRYPT).toString('hex')
  return `${salt}:${hash}`
}

export function verifySecret(value: string, stored: string) {
  const [salt, hash] = stored.split(':')
  if (!salt || !hash) return false
  const next = scryptSync(value, salt, 32, SCRYPT)
  const prev = Buffer.from(hash, 'hex')
  if (next.length !== prev.length) return false
  return timingSafeEqual(next, prev)
}

export function encryptSecret(plain: string) {
  const key = scryptSync(appSecret(), 'onetree-pin', 32)
  const iv = randomBytes(12)
  const cipher = createCipheriv('aes-256-gcm', key, iv)
  const enc = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()
  return `${iv.toString('base64url')}.${tag.toString('base64url')}.${enc.toString('base64url')}`
}

export function decryptSecret(payload: string) {
  const [iv, tag, data] = payload.split('.')
  if (!iv || !tag || !data) throw new Error('bad secret payload')
  const key = scryptSync(appSecret(), 'onetree-pin', 32)
  const decipher = createDecipheriv('aes-256-gcm', key, Buffer.from(iv, 'base64url'))
  decipher.setAuthTag(Buffer.from(tag, 'base64url'))
  return Buffer.concat([decipher.update(Buffer.from(data, 'base64url')), decipher.final()]).toString('utf8')
}

export function signBody(body: string) {
  return createHmac('sha256', appSecret()).update(body).digest('base64url')
}

export function safeEqual(a: string, b: string) {
  const left = Buffer.from(a)
  const right = Buffer.from(b)
  if (left.length !== right.length) return false
  return timingSafeEqual(left, right)
}
