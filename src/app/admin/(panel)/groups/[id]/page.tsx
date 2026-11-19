import Link from 'next/link'
import { notFound } from 'next/navigation'
import { batchTrees, saveCertificate, updateGroup } from '@/actions/admin'
import { SubmitButton } from '@/components/submit-button'
import { GROUP_TYPES, LOCATIONS, SPECIES } from '@/lib/catalog'
import { readDb } from '@/lib/db'
import { todayISO } from '@/lib/format'
import { requireStaffUser } from '@/lib/guard'
import { adminProblem, tx } from '@/lib/text'

const typeKey = {
  association: 'admin.association',
  company: 'admin.company',
  family: 'admin.family',
  individual: 'admin.individual',
} as const

export default async function GroupDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ error?: string; ok?: string }>
}) {
  await requireStaffUser()
  const { id } = await params
  const query = await searchParams
  const db = readDb()
  const group = db.groups.find((item) => item.id === id)
  if (!group) notFound()
  const certificate = db.certificates.find((item) => item.groupId === group.id)
  const trees = db.trees.filter((item) => item.groupId === group.id)
  const problem = adminProblem(query.error)
  const origin = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '')

  return (
    <div className="space-y-5">
      <h1 className="text-3xl text-yinyou-dark">{group.name}</h1>
      {query.ok ? <p role="status">{tx('admin.saved')}</p> : null}
      {problem ? (
        <p role="alert" className="text-terra">
          {problem}
        </p>
      ) : null}
      <p className="card">
        {tx('admin.groupLink')}
        <br />
        <a className="text-yinyou-dark underline" href={`${origin}/zh-TW/g/${group.code}`}>
          {origin}/zh-TW/g/{group.code}
        </a>
      </p>
      <form action={updateGroup} className="card space-y-3">
        <h2 className="text-2xl">{tx('admin.facts')}</h2>
        <input type="hidden" name="groupId" value={group.id} />
        <label className="block">
          <span className="lbl">{tx('admin.name')}</span>
          <input name="name" defaultValue={group.name} required className="field" />
        </label>
        <label className="block">
          <span className="lbl">{tx('admin.type')}</span>
          <select name="type" defaultValue={group.type} className="field">
            {GROUP_TYPES.map((type) => (
              <option key={type} value={type}>
                {tx(typeKey[type])}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="lbl">{tx('admin.stayStart')}</span>
          <input type="date" name="stayStart" defaultValue={group.stayStart} required className="field" />
        </label>
        <label className="block">
          <span className="lbl">{tx('admin.stayEnd')}</span>
          <input type="date" name="stayEnd" defaultValue={group.stayEnd} required className="field" />
        </label>
        <label className="block">
          <span className="lbl">{tx('admin.guestCount')}</span>
          <input type="number" name="guestCount" min={1} defaultValue={group.guestCount} required className="field" />
        </label>
        <SubmitButton pendingLabel={tx('common.pleaseWait')}>{tx('admin.save')}</SubmitButton>
      </form>
      <form action={saveCertificate} className="card space-y-3">
        <h2 className="text-2xl">{tx('admin.certTitle')}</h2>
        <input type="hidden" name="groupId" value={group.id} />
        <label className="block">
          <span className="lbl">{tx('certificate.number')}</span>
          <input name="number" defaultValue={certificate?.number || ''} className="field" />
        </label>
        <label className="block">
          <span className="lbl">{tx('admin.spend')}</span>
          <input type="number" min={0} name="localSpend" defaultValue={certificate?.localSpend ?? ''} className="field" />
        </label>
        <label className="block">
          <span className="lbl">{tx('admin.visitors')}</span>
          <input type="number" min={0} name="nurseryVisitors" defaultValue={certificate?.nurseryVisitors ?? ''} className="field" />
        </label>
        <label className="block">
          <span className="lbl">{tx('admin.treeCountField')}</span>
          <input type="number" min={0} name="treesPlanted" defaultValue={certificate?.treesPlanted ?? trees.length} className="field" />
        </label>
        <SubmitButton pendingLabel={tx('common.pleaseWait')}>{tx('admin.save')}</SubmitButton>
      </form>
      <form action={batchTrees} className="card space-y-3">
        <h2 className="text-2xl">{tx('admin.batchTitle')}</h2>
        <p>{tx('admin.batchHint')}</p>
        <p className="text-[16px]">{tx('admin.catalogHint')}</p>
        <input type="hidden" name="groupId" value={group.id} />
        <label className="block">
          <span className="lbl">{tx('admin.count')}</span>
          <input type="number" name="count" min={1} max={40} defaultValue={20} required className="field" />
        </label>
        <label className="block">
          <span className="lbl">{tx('admin.species')}</span>
          <input name="species" list="species-list" required className="field" />
          <datalist id="species-list">
            {SPECIES.map((species) => (
              <option key={species} value={species} />
            ))}
          </datalist>
        </label>
        <label className="block">
          <span className="lbl">{tx('admin.location')}</span>
          <input name="location" list="location-list" required className="field" />
          <datalist id="location-list">
            {LOCATIONS.map((location) => (
              <option key={location} value={location} />
            ))}
          </datalist>
        </label>
        <label className="block">
          <span className="lbl">{tx('admin.plantedOn')}</span>
          <input type="date" name="plantedOn" required defaultValue={todayISO()} className="field" />
        </label>
        <label className="block">
          <span className="lbl">{tx('admin.planterLines')}</span>
          <textarea name="planters" className="field" placeholder={tx('admin.planterLinesHint')} />
          <span className="mt-1 block text-[16px]">{tx('admin.planterLinesHint')}</span>
        </label>
        <label className="flex min-h-[52px] items-start gap-3">
          <input type="checkbox" name="consent" className="mt-1 size-6" />
          <span>{tx('admin.consent')}</span>
        </label>
        <label className="flex min-h-[52px] items-center gap-3">
          <input type="checkbox" name="isPublic" defaultChecked className="size-6" />
          <span>{tx('admin.publicTree')}</span>
        </label>
        <SubmitButton pendingLabel={tx('common.pleaseWait')}>{tx('admin.createTrees')}</SubmitButton>
      </form>
      <Link href={`/admin/qr/${group.id}`} className="btn-outline">
        {tx('admin.printQr')}
      </Link>
      <section className="space-y-3">
        <h2 className="text-2xl">{tx('admin.treeList')}</h2>
        {trees.length === 0 ? <p>{tx('admin.emptyTrees')}</p> : null}
        {trees.map((tree) => (
          <Link key={tree.id} href={`/admin/trees/${tree.code}`} className="card block">
            <p className="kai text-xl">{tree.code}</p>
            <p>
              {tree.species} · {tree.location}
            </p>
          </Link>
        ))}
      </section>
    </div>
  )
}
