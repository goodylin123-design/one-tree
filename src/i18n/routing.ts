import { defineRouting } from 'next-intl/routing'

export const routing = defineRouting({
  locales: ['zh-TW', 'zh-CN', 'en', 'ja', 'ko'],
  defaultLocale: 'zh-TW',
  localePrefix: 'always',
})

export type AppLocale = (typeof routing.locales)[number]

export function isLocale(value: string): value is AppLocale {
  return (routing.locales as readonly string[]).includes(value)
}
