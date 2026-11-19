import { getTranslations, setRequestLocale } from 'next-intl/server'
import { addMessage } from '@/actions/guest'
import { GuestFrame } from '@/components/guest-frame'
import { SubmitButton } from '@/components/submit-button'
import { Link } from '@/i18n/navigation'
import { requireTree } from '@/lib/guard'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('message')
  return { title: t('title') }
}

export default async function MessagePage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; code: string }>
  searchParams: Promise<{ saved?: string; error?: string }>
}) {
  const { locale, code } = await params
  setRequestLocale(locale)
  const query = await searchParams
  const bundle = await requireTree(locale, code)
  const t = await getTranslations('message')
  const nav = await getTranslations('nav')
  const common = await getTranslations('common')

  return (
    <GuestFrame>
      <div className="space-y-5 px-5 py-6">
        <Link href={`/t/${bundle.tree.code}`} className="text-yinyou-dark underline">
          {nav('backToTree')}
        </Link>
        <h1 className="text-3xl text-yinyou-dark">{t('title')}</h1>
        <img src="/assets/photos/guest-paintings.jpg" alt={t('paintingAlt')} className="photo aspect-[4/3]" />
        <p>{t('hint')}</p>
        {query.saved ? (
          <p role="status" className="rounded-xl bg-cream px-3 py-2">
            {t('saved')}
          </p>
        ) : null}
        {bundle.messages.length === 0 ? <p>{t('empty')}</p> : null}
        <div className="space-y-3">
          {bundle.messages.map((message) => (
            <article key={message.id} className="card">
              <p className="kai text-2xl">{message.content}</p>
              <p className="mt-2 text-[16px] text-yinyou-dark">
                {message.authorName} · {message.isPublic ? t('publicBadge') : t('privateBadge')}
              </p>
            </article>
          ))}
        </div>
        <form action={addMessage} className="card space-y-4">
          <input type="hidden" name="locale" value={locale} />
          <input type="hidden" name="code" value={bundle.tree.code} />
          <label className="block">
            <span className="lbl">{t('author')}</span>
            <input name="author" maxLength={20} placeholder={t('authorHint')} className="field" />
          </label>
          <label className="block">
            <span className="lbl">{t('limit')}</span>
            <textarea name="content" required maxLength={80} placeholder={t('placeholder')} className="field" />
          </label>
          <label className="flex min-h-[52px] items-center gap-3">
            <input type="checkbox" name="isPublic" className="size-6" />
            <span>{t('public')}</span>
          </label>
          {query.error === 'length' ? (
            <p role="alert" className="text-terra">
              {t('errorLength')}
            </p>
          ) : null}
          <SubmitButton pendingLabel={common('pleaseWait')}>{t('save')}</SubmitButton>
        </form>
      </div>
    </GuestFrame>
  )
}
