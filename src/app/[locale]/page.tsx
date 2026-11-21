import { getTranslations, setRequestLocale } from 'next-intl/server'
import { enterTree } from '@/actions/guest'
import { GuestFrame } from '@/components/guest-frame'
import { NearbyTrees } from '@/components/nearby-trees'
import { SubmitButton } from '@/components/submit-button'
import { Link } from '@/i18n/navigation'
import { demoTrees } from '@/lib/demo'
import { readDb } from '@/lib/db'
import { phrase } from '@/lib/messages'

export default async function HomePage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ error?: string; code?: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const query = await searchParams
  const t = await getTranslations('home')
  const adopt = await getTranslations('adopt')
  const brand = await getTranslations('brand')
  const common = await getTranslations('common')
  const treeText = await getTranslations('tree')
  const demoLabel = {
    '1': 'statusGrowing',
    '2': 'statusWatching',
    '3': 'statusReplanted',
    '4': 'statusReplantNeeded',
  } as const
  const showDemo = process.env.NEXT_PUBLIC_SHOW_DEMO === 'true'
  const db = readDb()
  const nearby = db.trees
    .filter((tree) => tree.lat != null && tree.lng != null && tree.tagCode)
    .map((tree) => {
      const latest = db.updates
        .filter((item) => item.treeId === tree.id)
        .sort((a, b) => a.takenOn.localeCompare(b.takenOn))
        .at(-1)
      const photo = latest?.photos.find((item) => item.kind === 'full') ?? latest?.photos[0]
      return {
        tagCode: tree.tagCode,
        species: phrase(locale, tree.species),
        photo: photo?.url || '',
        lat: tree.lat as number,
        lng: tree.lng as number,
      }
    })
  const pillars = [
    { title: brand('onePerson.title'), body: brand('onePerson.body') },
    { title: brand('oneTree.title'), body: brand('oneTree.body') },
    { title: brand('oneStory.title'), body: brand('oneStory.body') },
  ]

  return (
    <GuestFrame home>
      <div className="px-5 pt-6">
        <img src="/assets/logo/logo-green-lowres.png" alt={brand('name')} className="mx-auto w-full max-w-[300px] rounded-[12px]" />
      </div>
      <img src="/assets/photos/villa-path.jpg" alt={t('heroAlt')} className="photo mt-5 aspect-[4/3] rounded-none" />
      <div className="space-y-6 px-5 py-6">
        <div>
          <h1 className="text-[2rem] text-yinyou-dark">
            <span className="block">{brand('taglineLead')}</span>
            <span className="block">{brand('taglineRest')}</span>
          </h1>
          <p className="mt-2">{brand('subline')}</p>
          <p className="text-yinyou-dark">{brand('en')}</p>
        </div>
        <form action={enterTree} className="card space-y-4">
          <input type="hidden" name="locale" value={locale} />
          <p>{t('inputHint')}</p>
          <label className="block">
            <span className="lbl">{t('codeLabel')}</span>
            <input
              name="code"
              required
              defaultValue={query.code || ''}
              placeholder={t('codePlaceholder')}
              autoComplete="off"
              className="field"
            />
          </label>
          <label className="block">
            <span className="lbl">{t('pinLabel')}</span>
            <input
              name="pin"
              inputMode="numeric"
              autoComplete="off"
              maxLength={6}
              placeholder={t('pinPlaceholder')}
              className="field"
            />
          </label>
          {query.error === 'notfound' ? (
            <p role="alert" className="text-terra">
              {t('errorNotFound')}
            </p>
          ) : null}
          {query.error === 'locked' ? (
            <p role="alert" className="text-terra">
              {t('errorLocked')}
            </p>
          ) : null}
          <SubmitButton pendingLabel={common('pleaseWait')}>{t('submit')}</SubmitButton>
        </form>
        <div className="space-y-3">
          {pillars.map((item) => (
            <section key={item.title} className="card">
              <h2 className="text-xl text-yinyou-dark">{item.title}</h2>
              <p>{item.body}</p>
            </section>
          ))}
        </div>
        <NearbyTrees
          trees={nearby}
          lang={locale}
          title={adopt('nearbyTitle')}
          hint={adopt('nearbyHint')}
          button={adopt('nearbyButton')}
          need={adopt('nearbyNeed')}
          empty={adopt('nearbyEmpty')}
          metersLabel={adopt.raw('nearbyMeters')}
        />
        <Link href="/about" className="btn-outline">
          {t('about')}
        </Link>
        {showDemo ? (
          <aside className="card space-y-2 bg-cream">
            <h2 className="text-xl">{t('demoTitle')}</h2>
            <p className="text-[16px]">{t('demoHint')}</p>
            <ul className="space-y-1 text-[16px]">
              {demoTrees.map((tree) => (
                <li key={tree.code}>
                  {treeText(demoLabel[tree.shortcut])}：<span className="nowrap">{tree.shortcut}</span>
                </li>
              ))}
            </ul>
          </aside>
        ) : null}
      </div>
    </GuestFrame>
  )
}
