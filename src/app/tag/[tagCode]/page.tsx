import { routing, isLocale } from '@/i18n/routing'
import { readDb } from '@/lib/db'
import { formatDate } from '@/lib/format'
import { messagesFor, phrase } from '@/lib/messages'
import { speciesInfo } from '@/lib/species'

export const metadata = { robots: { index: true, follow: true } }

const statusKey = {
  growing: 'statusGrowing',
  watching: 'statusWatching',
  replant_needed: 'statusReplantNeeded',
  replanted: 'statusReplanted',
} as const

export default async function TagPage({
  params,
  searchParams,
}: {
  params: Promise<{ tagCode: string }>
  searchParams: Promise<{ lang?: string }>
}) {
  const { tagCode } = await params
  const query = await searchParams
  const locale = query.lang && isLocale(query.lang) ? query.lang : 'zh-TW'
  const copy = messagesFor(locale)
  const db = readDb()
  const tree = db.trees.find((item) => item.tagCode === decodeURIComponent(tagCode))
  if (!tree) {
    return (
      <main className="mx-auto min-h-screen max-w-lg bg-paper px-5 py-10 text-ink">
        <h1 className="text-3xl text-yinyou-dark">{copy.adopt.cardMissingTitle}</h1>
      </main>
    )
  }
  const adopted = db.adoptions.some((item) => item.treeId === tree.id && item.cardStatus === 'active')
  const latest = db.updates
    .filter((item) => item.treeId === tree.id)
    .sort((a, b) => a.takenOn.localeCompare(b.takenOn))
    .at(-1)
  const photo = latest?.photos.find((item) => item.kind === 'full') ?? latest?.photos[0]
  const introKey = speciesInfo(tree.speciesZh || tree.species).intro
  const intro = copy.species[introKey as keyof typeof copy.species] || copy.species.unknown

  return (
    <main className="mx-auto min-h-screen max-w-lg bg-paper px-5 py-8 text-ink">
      <nav className="mb-4 flex flex-wrap gap-3 text-[16px]">
        {routing.locales.map((item) => (
          <a key={item} href={`/tag/${encodeURIComponent(tree.tagCode)}?lang=${item}`} className={item === locale ? 'font-bold text-yinyou-dark' : 'text-yinyou-dark'}>
            {item === 'zh-TW' ? '繁中' : item === 'zh-CN' ? '简中' : item === 'en' ? 'EN' : item === 'ja' ? '日本語' : '한국어'}
          </a>
        ))}
      </nav>
      <p className="text-yinyou-dark">{copy.tree.status}</p>
      <h1 className="text-3xl text-yinyou-dark">{phrase(locale, tree.speciesZh || tree.species)}</h1>
      {tree.speciesLatin ? <p className="italic">{tree.speciesLatin}</p> : null}
      <p className="mt-2">{copy.tree[statusKey[tree.status]]}</p>
      <p>{adopted ? copy.adopt.tagAdopted : copy.adopt.tagOpen}</p>
      {photo ? <img src={photo.url} alt={copy.tree.photoFull} className="photo mt-4 aspect-[3/4]" /> : null}
      <section className="card mt-4 space-y-2">
        <h2 className="text-xl text-yinyou-dark">{copy.adopt.tagSpecies}</h2>
        <p>{intro}</p>
        <p>
          {copy.tree.plantedOn} <span className="nowrap">{formatDate(tree.plantedOn, locale)}</span>
        </p>
        <p>{phrase(locale, tree.zone || tree.location)}</p>
      </section>
    </main>
  )
}
