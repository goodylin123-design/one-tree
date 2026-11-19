import QRCode from 'qrcode'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { CertificateSheet } from '@/components/certificate-sheet'
import { GuestFrame } from '@/components/guest-frame'
import { Link } from '@/i18n/navigation'
import { decryptSecret } from '@/lib/crypto'
import { treeEntryUrl } from '@/lib/format'
import { requireTree } from '@/lib/guard'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('certificate')
  return { title: t('title') }
}

export default async function CertificatePage({ params }: { params: Promise<{ locale: string; code: string }> }) {
  const { locale, code } = await params
  setRequestLocale(locale)
  const bundle = await requireTree(locale, code)
  const nav = await getTranslations('nav')
  let qrDataUrl: string | null = null
  try {
    const token = decryptSecret(bundle.tree.tokenEnc)
    qrDataUrl = await QRCode.toDataURL(treeEntryUrl(bundle.tree.code, token), {
      width: 280,
      margin: 1,
      color: { dark: '#0B6E4B', light: '#FFFFFF' },
    })
  } catch {
    qrDataUrl = null
  }

  return (
    <GuestFrame>
      <div className="space-y-5 px-5 py-6">
        <Link href={`/t/${bundle.tree.code}`} className="text-yinyou-dark underline no-print">
          {nav('backToTree')}
        </Link>
        <CertificateSheet group={bundle.group} certificate={bundle.certificate} qrDataUrl={qrDataUrl} />
      </div>
    </GuestFrame>
  )
}
