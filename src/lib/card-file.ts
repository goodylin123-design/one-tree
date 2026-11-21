import QRCode from 'qrcode'
import { verifySecret } from './crypto'
import { demoTrees } from './demo'
import { readDb } from './db'
import { cardUrl, siteOrigin } from './format'

export function resolveCardKey(adoptionId: string, provided: string) {
  const typed = provided.trim()
  if (typed) return typed
  const match = /^adp_demo_(\d)$/.exec(adoptionId)
  if (!match) return ''
  return demoTrees.find((item) => item.shortcut === match[1])?.cardKey ?? ''
}

export function cardPrintData(adoptionId: string, provided: string) {
  const key = resolveCardKey(adoptionId, provided)
  if (key.length < 16) return null
  const db = readDb()
  const adoption = db.adoptions.find((item) => item.id === adoptionId)
  if (!adoption || !verifySecret(key, adoption.cardKeyHash)) return null
  const tree = db.trees.find((item) => item.id === adoption.treeId)
  if (!tree) return null
  return { key, adoption, tree, url: cardUrl(key) }
}

export async function cardSvg(adoptionId: string, provided: string) {
  const data = cardPrintData(adoptionId, provided)
  if (!data) return null
  const qr = await QRCode.toString(data.url, { type: 'svg', errorCorrectionLevel: 'Q', margin: 0 })
  const viewBox = /viewBox="([^"]+)"/.exec(qr)?.[1] ?? '0 0 100 100'
  const body = qr.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '')
  const photo = data.tree.cardPhotoUrl ? `${siteOrigin()}${data.tree.cardPhotoUrl}` : ''
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="90mm" height="140mm" viewBox="0 0 90 140">
  <rect width="90" height="140" fill="#faf8f1" stroke="#0B6E4B" stroke-width="0.6"/>
  <text x="45" y="12" text-anchor="middle" font-size="4.2" fill="#0B6E4B">The One · 永靖吟遊</text>
  ${photo ? `<image href="${escapeXml(photo)}" x="33" y="16" width="24" height="30" preserveAspectRatio="xMidYMid slice"/>` : ''}
  <text x="45" y="${photo ? 52 : 24}" text-anchor="middle" font-size="4" fill="#2b2416">${escapeXml(data.tree.speciesZh || data.tree.species)}</text>
  <text x="45" y="${photo ? 58 : 30}" text-anchor="middle" font-size="2.6" fill="#5c5346">${escapeXml(data.tree.speciesLatin)}</text>
  <text x="45" y="${photo ? 64 : 36}" text-anchor="middle" font-size="2.8" fill="#5c5346">${escapeXml(data.tree.code)}</text>
  <svg x="29" y="${photo ? 68 : 42}" width="32" height="32" viewBox="${viewBox}">${body}</svg>
  <text x="45" y="${photo ? 108 : 82}" text-anchor="middle" font-size="2.6" fill="#5c5346">${escapeXml(data.adoption.adopterName)}</text>
  <text x="45" y="${photo ? 114 : 88}" text-anchor="middle" font-size="2.4" fill="#5c5346">${escapeXml(data.adoption.adoptedAt)}</text>
</svg>`
  return { svg, code: data.tree.code }
}

function escapeXml(value: string) {
  return value.replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[char] || char)
}
