import { getTranslations, setRequestLocale } from 'next-intl/server'
import { GuestFrame } from '@/components/guest-frame'

const photos = [
  { src: '/assets/photos/lobby-cafe-courtyard.jpg', key: 'cheng' },
  { src: '/assets/photos/villa-courtyard-door.jpg', key: 'yuan' },
  { src: '/assets/photos/kitchen-counter.jpg', key: 'zaojiao' },
  { src: '/assets/photos/hall-skylight.jpg', key: 'hall' },
  { src: '/assets/photos/dining-interior.jpg', key: 'dining' },
  { src: '/assets/photos/plaque-hall.jpg', key: 'plaque' },
  { src: '/assets/photos/famous-tree-umbrella.jpg', key: 'famous' },
  { src: '/assets/photos/famous-pine-1.jpg', key: 'pine' },
  { src: '/assets/photos/nursery-flowers.jpg', key: 'nursery' },
] as const

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('about')
  return { title: t('title') }
}

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('about')
  const brand = await getTranslations('brand')
  const position = t.raw('position') as string[]
  const courtyard = t.raw('courtyard') as string[]
  const schedule = t.raw('schedule') as { season: string; shoot: string; online: string }[]
  const facts = t.raw('facts') as { label: string; value: string }[]

  return (
    <GuestFrame>
      <div className="space-y-8 px-5 py-6">
        <div>
          <h1 className="text-3xl text-yinyou-dark">{t('title')}</h1>
          <p className="mt-3 text-2xl text-yinyou-dark">{brand('tagline')}</p>
          <p>{brand('subline')}</p>
          <p className="text-yinyou-dark">{brand('en')}</p>
          <p>{brand('storyLine')}</p>
        </div>
        <img src="/assets/logo/logo-sign-photo.jpg" alt={t('signAlt')} className="photo aspect-[4/3]" />
        <section className="space-y-3">
          <h2 className="text-2xl text-yinyou-dark">{t('positionTitle')}</h2>
          {position.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </section>
        <section className="space-y-3">
          <h2 className="text-2xl text-yinyou-dark">{t('courtyardTitle')}</h2>
          {courtyard.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </section>
        <div className="space-y-4">
          {photos.map((photo) => (
            <figure key={photo.src}>
              <img src={photo.src} alt={t(photo.key)} className="photo aspect-[4/3]" />
              <figcaption className="mt-2 text-yinyou-dark">{t(photo.key)}</figcaption>
            </figure>
          ))}
        </div>
        <section className="space-y-3">
          <h2 className="text-2xl text-yinyou-dark">{t('updateTitle')}</h2>
          <p>{t('updateBody')}</p>
          <div className="card overflow-hidden p-0">
            <table className="w-full text-left text-[16px]">
              <thead className="bg-cream">
                <tr>
                  <th className="px-3 py-3 font-bold">{t('season')}</th>
                  <th className="px-3 py-3 font-bold">{t('shoot')}</th>
                  <th className="px-3 py-3 font-bold">{t('online')}</th>
                </tr>
              </thead>
              <tbody>
                {schedule.map((row) => (
                  <tr key={row.season} className="border-t border-[#e3dcc4]">
                    <td className="px-3 py-3">{row.season}</td>
                    <td className="px-3 py-3">{row.shoot}</td>
                    <td className="px-3 py-3">{row.online}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        <section className="space-y-3">
          <h2 className="text-2xl text-yinyou-dark">{t('factsTitle')}</h2>
          <dl className="space-y-3">
            {facts.map((fact) => (
              <div key={fact.label}>
                <dt className="text-yinyou-dark">{fact.label}</dt>
                <dd>{fact.value}</dd>
              </div>
            ))}
          </dl>
        </section>
        <figure>
          <img src="/assets/photos/aerial-rendering.jpg" alt={t('diagram')} className="photo aspect-[4/3]" />
          <figcaption className="mt-2">
            {t('diagram')}。{t('diagramNote')}
          </figcaption>
        </figure>
      </div>
    </GuestFrame>
  )
}
