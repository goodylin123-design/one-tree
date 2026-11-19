import QRCode from 'qrcode'
import { notFound } from 'next/navigation'
import { PrintButton } from '@/components/print-button'
import { decryptSecret } from '@/lib/crypto'
import { readDb } from '@/lib/db'
import { siteOrigin, treeEntryUrl } from '@/lib/format'
import { requireStaffUser } from '@/lib/guard'
import { tx } from '@/lib/text'

export default async function QrPage({
  params,
  searchParams,
}: {
  params: Promise<{ groupId: string }>
  searchParams: Promise<{ new?: string }>
}) {
  await requireStaffUser()
  const { groupId } = await params
  const query = await searchParams
  const db = readDb()
  const group = db.groups.find((item) => item.id === groupId)
  if (!group) notFound()
  const trees = db.trees.filter((item) => item.groupId === group.id)
  const origin = siteOrigin()
  const labels = await Promise.all(
    trees.map(async (tree) => {
      let pin = '—'
      let token = ''
      try {
        pin = decryptSecret(tree.pinEnc)
        token = decryptSecret(tree.tokenEnc)
      } catch {
        pin = '—'
      }
      const qr = token
        ? await QRCode.toDataURL(treeEntryUrl(tree.code, token), {
            width: 320,
            margin: 1,
            color: { dark: '#0B6E4B', light: '#FFFFFF' },
          })
        : ''
      const names = db.planters
        .filter((planter) => planter.treeId === tree.id)
        .map((planter) => planter.displayName)
        .join('、')
      return { tree, pin, qr, names }
    }),
  )

  return (
    <div className="space-y-4">
      <h1 className="text-3xl text-yinyou-dark no-print">{group.name}</h1>
      <p className="no-print">{tx('admin.qrHint')}</p>
      {origin.includes('localhost') ? <p className="card no-print text-terra">{tx('admin.localhostWarn')}</p> : null}
      {query.new ? <p className="no-print">{tx('admin.saved')}</p> : null}
      <div className="no-print">
        <PrintButton label={tx('certificate.print')} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {labels.map((label) => (
          <article key={label.tree.id} className="label-card card space-y-2 text-center">
            <p className="text-[16px] text-yinyou-dark">The One · 永靖吟遊</p>
            {label.qr ? <img src={label.qr} alt="" className="mx-auto h-40 w-40" /> : null}
            <p className="kai text-2xl">{label.tree.code}</p>
            <p>
              {tx('admin.pin')}：{label.pin}
            </p>
            <p>{label.tree.species}</p>
            <p>{label.names}</p>
          </article>
        ))}
      </div>
    </div>
  )
}
