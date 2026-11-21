import { getTranslations, setRequestLocale } from 'next-intl/server'
import { GuestFrame } from '@/components/guest-frame'
import { SharePanel } from '@/components/share-panel'
import { Link } from '@/i18n/navigation'
import { formatDate } from '@/lib/format'
import { requireTree } from '@/lib/guard'
import { asLocale, localizedNames, phrase } from '@/lib/messages'
import { latestUpdate } from '@/lib/queries'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('share')
  return { title: t('title') }
}

export default async function SharePage({ params }: { params: Promise<{ locale: string; code: string }> }) {
  const { locale, code } = await params
  setRequestLocale(locale)
  const bundle = await requireTree(locale, code)
  const t = await getTranslations('share')
  const treeText = await getTranslations('tree')
  const brand = await getTranslations('brand')
  const nav = await getTranslations('nav')
  const common = await getTranslations('common')
  const localeKey = asLocale(locale)
  const names = localizedNames(
    bundle.planters.map((planter) => planter.displayName),
    locale,
    common('join'),
    treeText('unnamed'),
  )
  const species = phrase(locale, bundle.tree.species)
  const planted = formatDate(bundle.tree.plantedOn, localeKey)
  const photo = latestUpdate(bundle.updates)?.photos[0]?.url || ''
  const nameLine = treeText('titleOf', { name: names })

  return (
    <GuestFrame>
      <div className="space-y-5 px-5 py-6">
        <Link href={`/t/${bundle.tree.code}`} className="text-yinyou-dark underline">
          {nav('backToTree')}
        </Link>
        <h1 className="text-3xl text-yinyou-dark">{t('title')}</h1>
        <p>{t('hint')}</p>
        <article className="overflow-hidden rounded-[12px] border border-[#e3dcc4] bg-white">
          <div className="bg-yinyou px-5 py-6 text-cream">
            <p className="kai text-3xl">{brand('tagline')}</p>
          </div>
          {photo ? <img src={photo} alt={t('alt')} className="photo aspect-[3/4] rounded-none" /> : null}
          <div className="space-y-1 px-5 py-4">
            <p className="kai text-2xl text-yinyou-dark">{nameLine}</p>
            <p>
              {species}　<span className="nowrap">{planted}</span>
            </p>
            <p className="text-[16px] text-yinyou-dark">{brand('name')}</p>
          </div>
        </article>
        <SharePanel
          nameLine={nameLine}
          speciesLine={`${species}　${planted}`}
          brand={brand('name')}
          photo={photo}
          taglineLead={brand('taglineLead')}
          taglineRest={brand('taglineRest')}
          labels={{
            save: t('save'),
            making: t('making'),
            saved: t('saved'),
            shared: t('shared'),
            fail: t('fail'),
          }}
        />
      </div>
    </GuestFrame>
  )
}
