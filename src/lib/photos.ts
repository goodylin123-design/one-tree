import fs from 'fs'
import path from 'path'
import sharp from 'sharp'
import { randomBytes } from 'crypto'

export function uploadDir() {
  return process.env.VERCEL ? path.join('/tmp', 'onetree-uploads') : path.join(process.cwd(), 'data', 'uploads')
}

const dir = uploadDir()

export async function savePhoto(file: File) {
  if (!file || file.size === 0) return null
  if (file.size > 15 * 1024 * 1024) throw new Error('size')
  if (file.type && !file.type.startsWith('image/')) throw new Error('type')
  const input = Buffer.from(await file.arrayBuffer())
  fs.mkdirSync(dir, { recursive: true })
  const filename = `${randomBytes(8).toString('hex')}.jpg`
  await sharp(input)
    .rotate()
    .resize({ width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: 82 })
    .toFile(path.join(dir, filename))
  return `/api/media/${filename}`
}
