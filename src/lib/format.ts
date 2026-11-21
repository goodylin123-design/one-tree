import type { AppLocale } from '@/i18n/routing'

export function normalizeCode(input: string) {
  return input.trim().toUpperCase().replace(/\s+/g, '')
}

const englishMonth = new Intl.DateTimeFormat('en', { month: 'long', timeZone: 'UTC' })

export function formatDate(iso: string, locale: AppLocale = 'zh-TW') {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso)
  if (!match) return iso
  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  if (locale === 'en') {
    const name = englishMonth.format(new Date(Date.UTC(year, month - 1, day)))
    return `${name} ${day}, ${year}`
  }
  if (locale === 'ko') return `${year}년 ${month}월 ${day}일`
  return `${year}年${month}月${day}日`
}

export function formatMonth(iso: string, locale: AppLocale = 'zh-TW') {
  const match = /^(\d{4})-(\d{2})/.exec(iso)
  if (!match) return iso
  const year = Number(match[1])
  const month = Number(match[2])
  if (locale === 'en') {
    const name = englishMonth.format(new Date(Date.UTC(year, month - 1, 1)))
    return `${name} ${year}`
  }
  if (locale === 'ko') return `${year}년 ${month}월`
  return `${year}年${month}月`
}

export function formatAmount(amount: number, locale: AppLocale = 'zh-TW') {
  const tag = locale === 'zh-TW' ? 'zh-Hant' : locale === 'zh-CN' ? 'zh-Hans' : locale
  return new Intl.NumberFormat(tag).format(amount)
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

export function nextUpdateMonth(from = new Date(), plantedOn?: string, locale: AppLocale = 'zh-TW') {
  let base = from
  if (plantedOn) {
    const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(plantedOn)
    if (match) {
      const planted = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]), 12)
      if (planted > base) base = planted
    }
  }
  const month = base.getMonth() + 1
  const year = base.getFullYear()
  const points = [3, 6, 9, 12]
  const stamp = (y: number, m: number) => formatMonth(`${y}-${String(m).padStart(2, '0')}`, locale)
  if (points.includes(month)) return stamp(year, month)
  const upcoming = points.find((point) => point > month)
  if (upcoming) return stamp(year, upcoming)
  return stamp(year + 1, 3)
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
  const configured = process.env.PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_SITE_URL
  if (configured) return configured.replace(/\/$/, '')
  return 'http://localhost:3000'
}

export function cardUrl(key: string) {
  return `${siteOrigin()}/c/${encodeURIComponent(key)}`
}

export function tagUrl(tagCode: string) {
  return `${siteOrigin()}/tag/${encodeURIComponent(tagCode)}`
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

export function planterNames(names: string[], separator = '、') {
  return names.map((name) => name.trim()).filter(Boolean).join(separator)
}
