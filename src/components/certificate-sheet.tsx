import { getLocale, getTranslations } from 'next-intl/server'
import { CarbonNote } from '@/components/carbon-note'
import { PrintButton } from '@/components/print-button'
import { formatAmount, formatDate } from '@/lib/format'
import { asLocale } from '@/lib/messages'
import type { Certificate, Group, Species, TreeStatus } from '@/lib/types'

export async function CertificateSheet({
  group,
  certificate,
  qrDataUrl,
  pageUrl,
  carbon,
}: {
  group: Group
  certificate: Certificate | null
  qrDataUrl?: string | null
  pageUrl: string
  carbon?: { species: Species | null; status: TreeStatus; adoptedAt: string; replantedOn: string; locale: string }
}) {
  const t = await getTranslations('certificate')
  const brand = await getTranslations('brand')
  const locale = asLocale(await getLocale())
  const money = certificate?.localSpend
  const stayStart = formatDate(group.stayStart, locale)
  const stayEnd = formatDate(group.stayEnd, locale)
  const stay = !group.stayEnd || group.stayStart === group.stayEnd ? stayStart : t('stayRange', { start: stayStart, end: stayEnd })
  const visitors = certificate?.nurseryVisitors
  const trees = certificate?.treesPlanted
  return (
    <article className="certificate-sheet card space-y-4">
      <header className="space-y-2">
        <p className="text-[16px] text-yinyou-dark">{brand('name')}</p>
        <h2 className="kai text-3xl text-yinyou-dark">{t('title')}</h2>
        <p>{t('intro')}</p>
      </header>
      {certificate?.sample ? <p className="rounded-xl bg-cream px-3 py-2 text-[16px]">{t('sample')}</p> : null}
      <dl className="space-y-3">
        <div>
          <dt className="text-yinyou-dark">{t('number')}</dt>
          <dd>
            <span className="nowrap">{certificate?.number || '—'}</span>
          </dd>
        </div>
        <div>
          <dt className="text-yinyou-dark">{t('stay')}</dt>
          <dd>
            <span className="nowrap">{stay}</span>
          </dd>
        </div>
        <div>
          <dt className="text-yinyou-dark">{t('guests')}</dt>
          <dd>{t('people', { count: group.guestCount })}</dd>
        </div>
        <div>
          <dt className="text-yinyou-dark">{t('localSpend')}</dt>
          <dd>
            {money === null || money === undefined ? (
              '—'
            ) : (
              <span className="nowrap">{t('money', { amount: formatAmount(money, locale) })}</span>
            )}
          </dd>
        </div>
        <div>
          <dt className="text-yinyou-dark">{t('nurseryVisitors')}</dt>
          <dd>{visitors === null || visitors === undefined ? '—' : t('visits', { count: visitors })}</dd>
        </div>
        <div>
          <dt className="text-yinyou-dark">{t('treesPlanted')}</dt>
          <dd>{trees === null || trees === undefined ? '—' : t('trees', { count: trees })}</dd>
        </div>
      </dl>
      {carbon ? <CarbonNote {...carbon} /> : null}
      {qrDataUrl ? <img src={qrDataUrl} alt={t('qrAlt')} className="mx-auto h-52 w-52" /> : null}
      <PrintButton label={t('print')} />
      <p className="print-only">
        <span className="nowrap">{certificate?.number || '—'}</span>
        <br />
        {pageUrl}
      </p>
    </article>
  )
}
