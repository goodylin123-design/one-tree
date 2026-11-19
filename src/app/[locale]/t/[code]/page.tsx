import { getTranslations, setRequestLocale } from 'next-intl/server'
import { leaveTree } from '@/actions/guest'
import { AutoEnter } from '@/components/auto-enter'
import { GuestFrame } from '@/components/guest-frame'
import { StatusBadge } from '@/components/status-badge'
import { SubmitButton } from '@/components/submit-button'
import { Link } from '@/i18n/navigation'
import { formatDate, nextUpdateMonth, normalizeCode, planterNames } from '@/lib/format'
import { requireTree } from '@/lib/guard'
import { noticeBody } from '@/lib/notify'
import { latestUpdate } from '@/lib/queries'

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
          <AutoEnter code={normalized} token={query.k} opening={enter('opening')} button={enter('button')} />
        </div>
      </GuestFrame>
    )
  }

  const bundle = await requireTree(locale, normalized)
  const t = await getTranslations('tree')
  const nav = await getTranslations('nav')
  const common = await getTranslations('common')
  const names = planterNames(bundle.planters.map((planter) => planter.displayName))
  const latest = latestUpdate(bundle.updates)
  const full = latest?.photos.find((photo) => photo.kind === 'full') ?? latest?.photos[0]
  const detail = latest?.photos.find((photo) => photo.kind === 'detail')
  const status = bundle.tree.status
  const notice =
    status === 'growing'
      ? ''
      : noticeBody(status, {
        nextCheckMonth: bundle.tree.nextCheckMonth,
        plantedOn: bundle.tree.plantedOn,
        species: bundle.tree.species,
        reason: bundle.tree.statusReason,
        name: bundle.tree.replantedName || names,
        replantedOn: bundle.tree.replantedOn,
        replantedByGuest: bundle.tree.replantedByGuest,
      })

  return (
    <GuestFrame>
      <div className="space-y-5 px-5 py-6">
        <h1 className="text-3xl text-yinyou-dark">{t('titleOf', { name: names })}</h1>
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
        <StatusBadge status={bundle.tree.status} />
        {notice ? <p className="card border-terra">{notice}</p> : null}
        <dl className="card space-y-3">
          <div>
            <dt className="text-yinyou-dark">{t('planters')}</dt>
            <dd>{names}</dd>
          </div>
          <div>
            <dt className="text-yinyou-dark">{t('code')}</dt>
            <dd>{bundle.tree.code}</dd>
          </div>
          <div>
            <dt className="text-yinyou-dark">{t('species')}</dt>
            <dd>{bundle.tree.species}</dd>
          </div>
          <div>
            <dt className="text-yinyou-dark">{t('plantedOn')}</dt>
            <dd>{formatDate(bundle.tree.plantedOn)}</dd>
          </div>
          <div>
            <dt className="text-yinyou-dark">{t('location')}</dt>
            <dd>{bundle.tree.location}</dd>
          </div>
          {bundle.tree.heightCm ? (
            <div>
              <dt className="text-yinyou-dark">{t('height')}</dt>
              <dd>{t('heightCm', { cm: bundle.tree.heightCm })}</dd>
            </div>
          ) : null}
        </dl>
        <p>{t('updateNote', { month: nextUpdateMonth() })}</p>
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
          <Link href={`/t/${bundle.tree.code}/share`} className="btn-outline">
            {nav('share')}
          </Link>
          <Link href={`/g/${bundle.group.code}`} className="btn-outline">
            {t('groupLink')}
          </Link>
        </nav>
        <form action={leaveTree}>
          <input type="hidden" name="locale" value={locale} />
          <SubmitButton pendingLabel={common('pleaseWait')} variant="outline">
            {t('another')}
          </SubmitButton>
        </form>
      </div>
    </GuestFrame>
  )
}
