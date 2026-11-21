import QRCode from 'qrcode'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { PrintButton } from '@/components/print-button'
import { cardPrintData } from '@/lib/card-file'
import { requireStaffUser } from '@/lib/guard'
import { tx } from '@/lib/text'

export default async function CardPrintPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ key?: string }>
}) {
  await requireStaffUser()
  const { id } = await params
  const query = await searchParams
  const data = cardPrintData(id, query.key || '')
  if (!data) notFound()
  const qr = await QRCode.toDataURL(data.url, { errorCorrectionLevel: 'Q', margin: 1, width: 400 })
  return (
    <div>
      <style>{`
        .card-sheet { width: 90mm; min-height: 140mm; }
        .card-qr { width: 32mm; height: 32mm; }
        .card-photo { width: 28mm; height: 36mm; object-fit: cover; }
        @media print {
          header, .no-print { display: none !important; }
          .card-sheet { break-after: page; }
          body { background: white; }
        }
      `}</style>
      <p className="no-print mb-4">
        <Link href={`/admin/trees/${data.tree.code}`} className="text-yinyou-dark underline">
          {tx('admin.back')}
        </Link>
      </p>
      <PrintButton label={tx('admin.downloadCard')} />
      <article className="card-sheet mx-auto flex flex-col items-center justify-center gap-3 border border-yinyou bg-cream p-4 text-center">
        <p className="kai text-2xl text-yinyou-dark">The One · 永靖吟遊</p>
        {data.tree.cardPhotoUrl ? <img src={data.tree.cardPhotoUrl} alt="" className="card-photo" /> : null}
        <p className="text-xl">{data.tree.speciesZh || data.tree.species}</p>
        {data.tree.speciesLatin ? <p className="italic">{data.tree.speciesLatin}</p> : null}
        <p className="nowrap">{data.tree.code}</p>
        <img src={qr} alt="" className="card-qr" />
        <p>{data.adoption.adopterName}</p>
        <p className="nowrap">{data.adoption.adoptedAt}</p>
      </article>
      <p className="no-print mt-4">
        <a className="text-link" href={`/admin/cards/${encodeURIComponent(id)}/file?key=${encodeURIComponent(query.key || '')}`}>
          SVG
        </a>
      </p>
    </div>
  )
}
