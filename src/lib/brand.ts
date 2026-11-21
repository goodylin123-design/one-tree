import fs from 'fs'
import path from 'path'

const tokenPath = path.join(process.cwd(), 'One_Tree_開發包-v1', 'brand', 'tokens.css')

let cached: Record<string, string> | null = null

function tokens() {
  if (cached) return cached
  const css = fs.readFileSync(tokenPath, 'utf8')
  const found: Record<string, string> = {}
  for (const match of css.matchAll(/--(color-[\w-]+):\s*(#[0-9A-Fa-f]{6})/g)) {
    found[match[1]!] = match[2]!
  }
  cached = found
  return found
}

export function brandColor(name: 'yinyou-green' | 'yinyou-green-dark' | 'terracotta') {
  const value = tokens()[`color-${name}`]
  if (!value) throw new Error(`品牌色缺少 color-${name}`)
  return value
}
