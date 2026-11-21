import QRCode from 'qrcode'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { CertificateSheet } from '@/components/certificate-sheet'
import { GuestFrame } from '@/components/guest-frame'
import { Link } from '@/i18n/navigation'
import { brandColor } from '@/lib/brand'
import { decryptSecret } from '@/lib/crypto'
import { siteOrigin, treeEntryUrl } from '@/lib/format'
import { adoptionForTree } from '@/lib/adoptions'
import { readDb } from '@/lib/db'
import { requireTree } from '@/lib/guard'
import { findSpecies } from '@/lib/species'
import { readAdoptionId } from '@/lib/session'

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
      color: { dark: brandColor('yinyou-green-dark'), light: '#FFFFFF' },
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
        <CertificateSheet
          group={bundle.group}
          certificate={bundle.certificate}
          qrDataUrl={qrDataUrl}
          pageUrl={`${siteOrigin()}/${locale}/t/${bundle.tree.code}/certificate`}
          carbon={{
            species: findSpecies(readDb().species, bundle.tree),
            status: bundle.tree.status,
            adoptedAt: adoptionForTree(bundle.tree.id, await readAdoptionId())?.adoptedAt || bundle.tree.plantedOn,
            replantedOn: bundle.tree.replantedOn,
            locale,
          }}
        />
      </div>
    </GuestFrame>
  )
}
