import { getTranslations, setRequestLocale } from 'next-intl/server'
import { leaveTree } from '@/actions/guest'
import { AutoEnter } from '@/components/auto-enter'
import { CarbonNote } from '@/components/carbon-note'
import { GardenMap } from '@/components/garden-map'
import { GuestFrame } from '@/components/guest-frame'
import { StatusBadge } from '@/components/status-badge'
import { Link } from '@/i18n/navigation'
import { KeepTokens } from '@/components/keep-tokens'
import { formatDate, formatMonth, nextUpdateMonth, normalizeCode } from '@/lib/format'
import { adoptionForTree } from '@/lib/adoptions'
import { readDb } from '@/lib/db'
import { findSpecies } from '@/lib/species'
import { requireTree } from '@/lib/guard'
import { asLocale, localizedNames, phrase } from '@/lib/messages'
import { noticeBody } from '@/lib/notify'
import { latestUpdate } from '@/lib/queries'
import { readAdoptionId } from '@/lib/session'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('tree')
  return { title: t('pageTitle') }
}

export default async function TreePage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; code: string }>
  searchParams: Promise<{ k?: string }>
}) {
  const { locale, code } = await params
  setRequestLocale(locale)
  const query = await searchParams
  const normalized = normalizeCode(decodeURIComponent(code))
  if (query.k) {
    const enter = await getTranslations('enter')
    return (
      <GuestFrame>
        <div className="px-5 py-8">
          <AutoEnter code={normalized} token={query.k} locale={locale} opening={enter('opening')} button={enter('button')} />
        </div>
      </GuestFrame>
    )
  }

  const bundle = await requireTree(locale, normalized)
  const t = await getTranslations('tree')
  const adopt = await getTranslations('adopt')
  const nav = await getTranslations('nav')
  const common = await getTranslations('common')
  const localeKey = asLocale(locale)
  const names = localizedNames(
    bundle.planters.map((planter) => planter.displayName),
    locale,
    common('join'),
    t('unnamed'),
  )
  const latest = latestUpdate(bundle.updates)
  const adoption = adoptionForTree(bundle.tree.id, await readAdoptionId())
  const adoptedAt = adoption?.adoptedAt || bundle.tree.plantedOn
  const full = latest?.photos.find((photo) => photo.kind === 'full') ?? latest?.photos[0]
  const detail = latest?.photos.find((photo) => photo.kind === 'detail')
  const status = bundle.tree.status
  const notice =
    status === 'growing'
      ? ''
      : noticeBody(
          status,
          {
            nextCheckMonth: bundle.tree.nextCheckMonth,
            plantedOn: adoptedAt,
            species: bundle.tree.species,
            reason: bundle.tree.statusReason,
            name: bundle.tree.replantedName || names,
            replantedOn: bundle.tree.replantedOn,
            replantedByGuest: bundle.tree.replantedByGuest,
          },
          localeKey,
        )

  return (
    <GuestFrame>
      <div className="space-y-5 px-5 py-6">
        <h1 className="text-3xl text-yinyou-dark">{t('titleOf', { name: names })}</h1>
        <StatusBadge status={bundle.tree.status} />
        {notice ? (
          <p className="card border-terra">
            <KeepTokens text={notice} />
          </p>
        ) : null}
        {status === 'watching' || status === 'replant_needed' ? (
          <p>
            <span className="nowrap">
              {t('nextCheck', {
                month: formatMonth(bundle.tree.nextCheckMonth || `${bundle.tree.plantedOn.slice(0, 4)}-03`, localeKey),
              })}
            </span>
          </p>
        ) : null}
        {status === 'replant_needed' ? (
          <Link href={`/t/${bundle.tree.code}/return`} className="btn-primary">
            {t('replantCta')}
          </Link>
        ) : null}
        {bundle.tree.sample ? <p className="rounded-xl bg-cream px-3 py-2 text-[16px]">{common('sampleTree')}</p> : null}
        {full ? (
          <figure>
            <img src={full.url} alt={t('photoFull')} className="photo aspect-[3/4]" />
            <figcaption className="mt-2 text-[16px] text-yinyou-dark">{t('photoFull')}</figcaption>
          </figure>
        ) : null}
        {detail ? (
          <figure>
            <img src={detail.url} alt={t('photoDetail')} className="photo aspect-[3/4]" />
            <figcaption className="mt-2 text-[16px] text-yinyou-dark">{t('photoDetail')}</figcaption>
          </figure>
        ) : null}
        {bundle.tree.lat != null && bundle.tree.lng != null ? (
          <GardenMap lat={bundle.tree.lat} lng={bundle.tree.lng} label={bundle.tree.code} title={adopt('mapTitle')} hint={adopt('mapHint')} />
        ) : null}
        <CarbonNote
          species={findSpecies(readDb().species, bundle.tree)}
          status={bundle.tree.status}
          adoptedAt={adoptedAt}
          replantedOn={bundle.tree.replantedOn}
          locale={locale}
        />
        <dl className="card space-y-3">
          <div>
            <dt className="text-yinyou-dark">{t('planters')}</dt>
            <dd>{names}</dd>
          </div>
          <div>
            <dt className="text-yinyou-dark">{t('code')}</dt>
            <dd>
              <span className="nowrap">{bundle.tree.code}</span>
            </dd>
          </div>
          <div>
            <dt className="text-yinyou-dark">{t('species')}</dt>
            <dd>{phrase(locale, bundle.tree.species)}</dd>
          </div>
          <div>
            <dt className="text-yinyou-dark">{t('plantedOn')}</dt>
            <dd>
              <span className="nowrap">{formatDate(adoptedAt, localeKey)}</span>
            </dd>
          </div>
          <div>
            <dt className="text-yinyou-dark">{t('location')}</dt>
            <dd>{phrase(locale, bundle.tree.location)}</dd>
          </div>
          {bundle.tree.heightCm ? (
            <div>
              <dt className="text-yinyou-dark">{t('height')}</dt>
              <dd>{t('heightCm', { cm: bundle.tree.heightCm })}</dd>
            </div>
          ) : null}
        </dl>
        <p>
          {t('updateNote')}
          <span className="nowrap">{t('updateWhen', { month: nextUpdateMonth(new Date(), bundle.tree.plantedOn, localeKey) })}</span>
        </p>
        <nav className="space-y-3" aria-label={nav('timeline')}>
          <Link href={`/t/${bundle.tree.code}/timeline`} className="btn-primary">
            {nav('timeline')}
          </Link>
          <Link href={`/t/${bundle.tree.code}/message`} className="btn-outline">
            {nav('message')}
          </Link>
          <Link href={`/t/${bundle.tree.code}/certificate`} className="btn-outline">
            {nav('certificate')}
          </Link>
          <Link href={`/t/${bundle.tree.code}/return`} className="btn-outline">
            {nav('return')}
          </Link>
        </nav>
        <div className="flex flex-col">
          <Link href={`/t/${bundle.tree.code}/share`} className="text-link">
            {nav('share')}
          </Link>
          <Link href={`/g/${bundle.group.code}`} className="text-link">
            {t('groupLink')}
          </Link>
          <form action={leaveTree}>
            <input type="hidden" name="locale" value={locale} />
            <button type="submit" className="text-link">
              {t('another')}
            </button>
          </form>
        </div>
      </div>
    </GuestFrame>
  )
}
