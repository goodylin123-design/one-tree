import { getTranslations } from 'next-intl/server'
import { carbonSpan, formatKg } from '@/lib/carbon'
import { formatDate } from '@/lib/format'
import { asLocale } from '@/lib/messages'
import type { Species, TreeStatus } from '@/lib/types'

export async function CarbonNote({
  species,
  status,
  adoptedAt,
  replantedOn,
  locale,
}: {
  species: Species | null
  status: TreeStatus
  adoptedAt: string
  replantedOn: string
  locale: string
}) {
  const kgValue = species?.co2KgPerYearAvg
  if (kgValue === null || kgValue === undefined || !Number.isFinite(kgValue)) return null
  const t = await getTranslations('carbon')
  const localeKey = asLocale(locale)
  const kg = formatKg(kgValue)
  const span = carbonSpan(status, adoptedAt, replantedOn)
  const total = span ? formatKg(kgValue * span.years) : ''
  return (
    <section className="card space-y-2">
      <p>
        {t('yearlyLead')}
        <span className="nowrap">{kg}</span>
        {t('yearlyTail')}
      </p>
      {species?.co2Basis ? <p className="text-[16px]">{t('source', { basis: species.co2Basis })}</p> : null}
      {span ? (
        <p>
          {t('sinceLead', { start: formatDate(span.start, localeKey), years: span.years })}
          <span className="nowrap">{total}</span>
          {t('sinceTail')}
        </p>
      ) : null}
      <details>
        <summary className="cursor-pointer text-yinyou-dark">{t('more')}</summary>
        <p className="mt-2">{t('explain')}</p>
      </details>
    </section>
  )
}
