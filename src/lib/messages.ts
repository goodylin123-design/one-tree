import en from '../../messages/en.json'
import ja from '../../messages/ja.json'
import ko from '../../messages/ko.json'
import zhCN from '../../messages/zh-CN.json'
import zhTW from '../../messages/zh-TW.json'
import { isLocale, type AppLocale } from '@/i18n/routing'

const catalogs = {
  'zh-TW': zhTW,
  'zh-CN': zhCN,
  en,
  ja,
  ko,
} as const

export function messagesFor(locale: string) {
  if (isLocale(locale)) return catalogs[locale]
  return catalogs['zh-TW']
}

export function phrase(locale: string, text: string) {
  if (!text) return ''
  const lexicon = 'lexicon' in catalogs[isLocale(locale) ? locale : 'zh-TW']
    ? (catalogs[isLocale(locale) ? locale : 'zh-TW'] as { lexicon?: Record<string, string> }).lexicon
    : undefined
  return lexicon?.[text] ?? text
}

export function localizedNames(names: string[], locale: string, separator: string, empty: string) {
  const clean = names.map((name) => phrase(locale, name.trim())).filter(Boolean)
  return clean.length ? clean.join(separator) : empty
}

export function asLocale(value: string): AppLocale {
  return isLocale(value) ? value : 'zh-TW'
}
