export function normalizeCode(input: string) {
  return input.trim().toUpperCase().replace(/\s+/g, '')
}

export function formatDate(iso: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso)
  if (!match) return iso
  return `${match[1]}年${Number(match[2])}月${Number(match[3])}日`
}

export function formatMonth(iso: string) {
  const match = /^(\d{4})-(\d{2})/.exec(iso)
  if (!match) return iso
  return `${match[1]}年${Number(match[2])}月`
}

export function formatStay(start: string, end: string) {
  if (!end || start === end) return formatDate(start)
  return `${formatDate(start)}至${formatDate(end)}`
}

export function formatDateTime(iso: string) {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso
  return new Intl.DateTimeFormat('zh-TW', {
    timeZone: 'Asia/Taipei',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).format(date)
}

export function formatTwd(amount: number) {
  return `新臺幣 ${new Intl.NumberFormat('zh-TW').format(amount)} 元`
}

export function nextUpdateMonth(from = new Date()) {
  const month = from.getMonth() + 1
  const year = from.getFullYear()
  const points = [3, 6, 9, 12]
  if (points.includes(month)) return `${year}年${month}月`
  const upcoming = points.find((point) => point > month)
  if (upcoming) return `${year}年${upcoming}月`
  return `${year + 1}年3月`
}

export function currentSeason(from = new Date()) {
  const quarter = Math.floor(from.getMonth() / 3) + 1
  return `${from.getFullYear()}-Q${quarter}`
}

export function todayISO(from = new Date()) {
  const y = from.getFullYear()
  const m = String(from.getMonth() + 1).padStart(2, '0')
  const d = String(from.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function siteOrigin() {
  const configured = process.env.NEXT_PUBLIC_SITE_URL
  if (configured) return configured.replace(/\/$/, '')
  const vercelHost = process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL
  if (vercelHost) return `https://${vercelHost}`
  return 'http://localhost:3000'
}

export function treeEntryUrl(code: string, token: string) {
  return `${siteOrigin()}/zh-TW/t/${encodeURIComponent(code)}?k=${encodeURIComponent(token)}`
}

export function fill(template: string, vars: Record<string, string | number>) {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => String(vars[key] ?? ''))
}

export function nextTreeCode(codes: string[], plantedOn: string) {
  const year = /^\d{4}/.exec(plantedOn)?.[0] || String(new Date().getFullYear())
  const prefix = `YJ-${year}-`
  let max = 0
  for (const code of codes) {
    if (!code.startsWith(prefix)) continue
    const n = Number(code.slice(prefix.length))
    if (n > max) max = n
  }
  return `${prefix}${String(max + 1).padStart(4, '0')}`
}

export function planterNames(names: string[]) {
  const clean = names.map((name) => name.trim()).filter(Boolean)
  return clean.length ? clean.join('、') : '種樹人'
}
