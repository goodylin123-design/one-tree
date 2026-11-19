import { getTranslations, setRequestLocale } from 'next-intl/server'
import { GuestFrame } from '@/components/guest-frame'
import { StatusBadge } from '@/components/status-badge'
import { Link } from '@/i18n/navigation'
import { formatDate } from '@/lib/format'
import { requireTree } from '@/lib/guard'

function seasonLabel(season: string, planted: string, quarter: (values: { year: string; q: string }) => string) {
  if (season === 'planted') return planted
  const match = /^(\d{4})-Q([1-4])$/.exec(season)
  if (!match) return season
  return quarter({ year: match[1]!, q: match[2]! })
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('timeline')
  return { title: t('title') }
}

export default async function TimelinePage({ params }: { params: Promise<{ locale: string; code: string }> }) {
  const { locale, code } = await params
  setRequestLocale(locale)
  const bundle = await requireTree(locale, code)
  const t = await getTranslations('timeline')
  const treeText = await getTranslations('tree')
  const nav = await getTranslations('nav')

  return (
    <GuestFrame>
      <div className="space-y-5 px-5 py-6">
        <Link href={`/t/${bundle.tree.code}`} className="text-yinyou-dark underline">
          {nav('backToTree')}
        </Link>
        <h1 className="text-3xl text-yinyou-dark">{t('title')}</h1>
        {bundle.updates.length === 0 ? (
          <figure>
            <img src="/assets/photos/courtyard-pine.jpg" alt={t('emptyAlt')} className="photo aspect-[3/4]" />
            <figcaption className="mt-2">{t('empty')}</figcaption>
          </figure>
        ) : (
          <ol className="space-y-5">
            {bundle.updates.map((update) => (
              <li key={update.id} className="card space-y-3">
                <p className="kai text-2xl text-yinyou-dark">
                  {seasonLabel(update.season, t('plantedDay'), (values) => t('quarter', values))}
                </p>
                <p>{formatDate(update.takenOn)}</p>
                <StatusBadge status={update.status} />
                {update.photos.map((photo) => (
                  <figure key={photo.url + photo.kind}>
                    <img src={photo.url} alt={photo.kind === 'detail' ? treeText('photoDetail') : treeText('photoFull')} className="photo aspect-[3/4]" />
                    {update.sample ? <figcaption className="mt-2 text-[16px]">{t('sample')}</figcaption> : null}
                  </figure>
                ))}
                {update.species ? (
                  <p>
                    {treeText('species')}：{update.species}
                  </p>
                ) : null}
                {update.heightCm ? <p>{t('height', { cm: update.heightCm })}</p> : null}
                {update.note ? <p>{update.note}</p> : null}
              </li>
            ))}
          </ol>
        )}
      </div>
    </GuestFrame>
  )
}
