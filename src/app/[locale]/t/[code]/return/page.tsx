import { getTranslations, setRequestLocale } from 'next-intl/server'
import { GuestFrame } from '@/components/guest-frame'
import { Link } from '@/i18n/navigation'
import { requireTree } from '@/lib/guard'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('return')
  return { title: t('title') }
}

export default async function ReturnPage({ params }: { params: Promise<{ locale: string; code: string }> }) {
  const { locale, code } = await params
  setRequestLocale(locale)
  const bundle = await requireTree(locale, code)
  const t = await getTranslations('return')
  const footer = await getTranslations('footer')
  const nav = await getTranslations('nav')
  const phone = footer('phone').replace(/\s/g, '')
  const booking = process.env.NEXT_PUBLIC_BOOKING_URL
  const line = process.env.NEXT_PUBLIC_LINE_URL

  return (
    <GuestFrame>
      <div className="space-y-5 px-5 py-6">
        <Link href={`/t/${bundle.tree.code}`} className="text-yinyou-dark underline">
          {nav('backToTree')}
        </Link>
        <h1 className="text-3xl text-yinyou-dark">{t('title')}</h1>
        <img src="/assets/photos/wooden-cabin.jpg" alt={t('cabinAlt')} className="photo aspect-[4/3]" />
        <section className="card space-y-3">
          <h2 className="text-2xl text-yinyou-dark">{t('book')}</h2>
          <p>{t('bookBody')}</p>
          {booking ? (
            <a className="btn-primary" href={booking}>
              {t('bookLink')}
            </a>
          ) : (
            <a className="btn-primary" href={`tel:${phone}`}>
              {t('phone')}
            </a>
          )}
          {line ? (
            <a className="btn-outline" href={line}>
              {t('lineLink')}
            </a>
          ) : null}
          {booking ? (
            <a className="btn-outline" href={`tel:${phone}`}>
              {t('phone')}
            </a>
          ) : null}
          {!booking && !line ? <p className="text-[16px]">{t('bookPending')}</p> : null}
          <a className="btn-outline" href={`mailto:${footer('email')}`}>
            {t('email')}
          </a>
        </section>
        <section className="card space-y-3">
          <h2 className="text-2xl text-yinyou-dark">{t('replant')}</h2>
          <p>{t('replantBody')}</p>
          <p>{t('replantProxy')}</p>
        </section>
        <section className="card space-y-2">
          <h2 className="text-2xl text-yinyou-dark">{t('contact')}</h2>
          <p>
            {t('addressLabel')}：{footer('address')}
          </p>
          <p>{footer('phone')}</p>
          <p>{footer('email')}</p>
        </section>
      </div>
    </GuestFrame>
  )
}
