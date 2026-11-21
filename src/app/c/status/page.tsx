import { messagesFor } from '@/lib/messages'
import { isLocale } from '@/i18n/routing'

export const metadata = { robots: { index: false, follow: false } }

export default async function CardStatusPage({
  searchParams,
}: {
  searchParams: Promise<{ state?: string; lang?: string }>
}) {
  const query = await searchParams
  const locale = query.lang && isLocale(query.lang) ? query.lang : 'zh-TW'
  const copy = messagesFor(locale).adopt
  const revoked = query.state === 'revoked'
  return (
    <main className="mx-auto min-h-screen max-w-lg bg-paper px-5 py-10 text-ink">
      <h1 className="text-3xl text-yinyou-dark">{revoked ? copy.cardRevokedTitle : copy.cardMissingTitle}</h1>
      <p className="mt-4">{revoked ? copy.cardRevoked : copy.cardMissing}</p>
    </main>
  )
}
