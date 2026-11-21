'use client'

import { useLocale } from 'next-intl'
import { Link, usePathname } from '@/i18n/navigation'
import { routing, type AppLocale } from '@/i18n/routing'

const labels: Record<AppLocale, string> = {
  'zh-TW': '繁中',
  'zh-CN': '简中',
  en: 'EN',
  ja: '日本語',
  ko: '한국어',
}

export function LanguageSwitch({ label }: { label: string }) {
  const pathname = usePathname()
  const current = useLocale()
  return (
    <nav aria-label={label} className="no-print flex flex-wrap gap-x-4 gap-y-1 px-5 pt-4 text-[16px]">
      {routing.locales.map((code) => (
        <Link
          key={code}
          href={pathname}
          locale={code}
          hrefLang={code}
          aria-current={code === current ? 'page' : undefined}
          className={code === current ? 'font-bold text-yinyou-dark underline' : 'text-yinyou-dark underline'}
        >
          {labels[code]}
        </Link>
      ))}
    </nav>
  )
}
