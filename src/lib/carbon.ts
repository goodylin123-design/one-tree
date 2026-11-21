import type { TreeStatus } from './types'

const YEAR_MS = 365.25 * 24 * 60 * 60 * 1000

export function wholeYears(fromIso: string, now = new Date()) {
  const start = Date.parse(`${fromIso}T00:00:00`)
  if (!Number.isFinite(start)) return 0
  return Math.max(0, Math.floor((now.getTime() - start) / YEAR_MS))
}

export function carbonSpan(status: TreeStatus, adoptedAt: string, replantedOn: string, now = new Date()) {
  if (status === 'replant_needed') return null
  const start = status === 'replanted' && replantedOn ? replantedOn : adoptedAt
  const years = wholeYears(start, now)
  if (years < 1) return null
  return { start, years }
}

export function formatKg(value: number) {
  return Number.isInteger(value) ? String(value) : String(Math.round(value * 10) / 10)
}
