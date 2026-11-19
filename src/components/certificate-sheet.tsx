import { getTranslations } from 'next-intl/server'
import { PrintButton } from '@/components/print-button'
import { formatStay, formatTwd } from '@/lib/format'
import type { Certificate, Group } from '@/lib/types'

export async function CertificateSheet({
  group,
  certificate,
  qrDataUrl,
}: {
  group: Group
  certificate: Certificate | null
  qrDataUrl?: string | null
}) {
  const t = await getTranslations('certificate')
  const money = certificate?.localSpend
  const visitors = certificate?.nurseryVisitors
  const trees = certificate?.treesPlanted
  return (
    <article className="card space-y-4">
      <header className="space-y-2">
        <p className="text-[16px] text-yinyou-dark">The One · 永靖吟遊</p>
        <h2 className="kai text-3xl text-yinyou-dark">{t('title')}</h2>
        <p>{t('intro')}</p>
      </header>
      {certificate?.sample ? <p className="rounded-xl bg-cream px-3 py-2 text-[16px]">{t('sample')}</p> : null}
      <dl className="space-y-3">
        <div>
          <dt className="text-yinyou-dark">{t('number')}</dt>
          <dd>{certificate?.number || '—'}</dd>
        </div>
        <div>
          <dt className="text-yinyou-dark">{t('stay')}</dt>
          <dd>{formatStay(group.stayStart, group.stayEnd)}</dd>
        </div>
        <div>
          <dt className="text-yinyou-dark">{t('guests')}</dt>
          <dd>{t('people', { count: group.guestCount })}</dd>
        </div>
        <div>
          <dt className="text-yinyou-dark">{t('localSpend')}</dt>
          <dd>{money === null || money === undefined ? '—' : formatTwd(money)}</dd>
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
      {qrDataUrl ? <img src={qrDataUrl} alt={t('qrAlt')} className="mx-auto h-52 w-52" /> : null}
      <PrintButton label={t('print')} />
    </article>
  )
}
