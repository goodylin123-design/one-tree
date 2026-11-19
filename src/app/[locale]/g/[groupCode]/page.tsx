import { getTranslations, setRequestLocale } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { CertificateSheet } from '@/components/certificate-sheet'
import { GuestFrame } from '@/components/guest-frame'
import { StatusBadge } from '@/components/status-badge'
import { getGroupBundle, latestUpdate } from '@/lib/queries'
import { planterNames } from '@/lib/format'

export async function generateMetadata({ params }: { params: Promise<{ locale: string; groupCode: string }> }) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('group')
  return { title: t('forHr') }
}

export default async function GroupPage({ params }: { params: Promise<{ locale: string; groupCode: string }> }) {
  const { locale, groupCode } = await params
  setRequestLocale(locale)
  const bundle = getGroupBundle(decodeURIComponent(groupCode))
  if (!bundle) notFound()
  const t = await getTranslations('group')
  const common = await getTranslations('common')
  const treeText = await getTranslations('tree')

  return (
    <GuestFrame>
      <div className="space-y-5 px-5 py-6">
        <h1 className="text-3xl text-yinyou-dark">{t('title', { groupName: bundle.group.name, count: bundle.trees.length })}</h1>
        {bundle.group.sample ? <p className="rounded-xl bg-cream px-3 py-2 text-[16px]">{common('sampleGroup')}</p> : null}
        <p>{t('how')}</p>
        {bundle.trees.length === 0 ? <p>{t('empty')}</p> : null}
        <div className="space-y-4">
          {bundle.trees.map((item) => {
            const photo = latestUpdate(item.updates)?.photos[0]
            const names = planterNames(item.planters.map((planter) => planter.displayName))
            return (
              <article key={item.tree.id} className="card space-y-3">
                {photo ? <img src={photo.url} alt={item.tree.species} className="photo aspect-[3/4]" /> : null}
                <StatusBadge status={item.tree.status} />
                <h2 className="text-2xl">{item.tree.isPublic ? treeText('titleOf', { name: names }) : item.tree.species}</h2>
                <p>
                  {treeText('species')}：{item.tree.species}
                </p>
                <p>
                  {treeText('code')}：{item.tree.code}
                </p>
                {item.tree.isPublic ? (
                  item.messages.map((message) => (
                    <blockquote key={message.id} className="border-l-4 border-yinyou pl-3">
                      <p>{message.content}</p>
                      <footer className="text-[16px] text-yinyou-dark">
                        {t('publicMessage')} · {message.authorName}
                      </footer>
                    </blockquote>
                  ))
                ) : (
                  <p>{t('hidden')}</p>
                )}
              </article>
            )
          })}
        </div>
        <CertificateSheet group={bundle.group} certificate={bundle.certificate} />
      </div>
    </GuestFrame>
  )
}
