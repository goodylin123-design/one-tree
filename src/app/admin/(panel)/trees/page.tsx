import Link from 'next/link'
import { readDb } from '@/lib/db'
import { requireUser } from '@/lib/guard'
import { tx } from '@/lib/text'
import type { TreeStatus } from '@/lib/types'

const filters: { key: 'all' | TreeStatus; label: string }[] = [
  { key: 'all', label: 'admin.all' },
  { key: 'growing', label: 'tree.statusGrowing' },
  { key: 'watching', label: 'tree.statusWatching' },
  { key: 'replant_needed', label: 'tree.statusReplantNeeded' },
  { key: 'replanted', label: 'tree.statusReplanted' },
]

export default async function TreesPage({ searchParams }: { searchParams: Promise<{ status?: string; q?: string }> }) {
  const staff = await requireUser()
  const query = await searchParams
  const db = readDb()
  const q = (query.q || '').trim().toUpperCase()
  const status = query.status
  const trees = db.trees.filter((tree) => {
    if (status && status !== 'all' && tree.status !== status) return false
    if (q && !tree.code.includes(q)) return false
    return true
  })
  return (
    <div className="space-y-4">
      <h1 className="text-3xl text-yinyou-dark">{tx('admin.trees')}</h1>
      <form className="flex gap-2" action="/admin/trees">
        <input name="q" defaultValue={query.q || ''} placeholder={tx('admin.search')} className="field" />
        {status ? <input type="hidden" name="status" value={status} /> : null}
        <button className="btn-outline w-auto px-4" type="submit">
          {tx('admin.search')}
        </button>
      </form>
      <div className="flex flex-wrap gap-2">
        {filters.map((filter) => (
          <Link
            key={filter.key}
            href={filter.key === 'all' ? '/admin/trees' : `/admin/trees?status=${filter.key}`}
            className="inline-flex min-h-[44px] items-center rounded-full border border-yinyou-dark px-3 text-yinyou-dark"
          >
            {tx(filter.label)}
          </Link>
        ))}
      </div>
      {trees.length === 0 ? <p>{tx('admin.none')}</p> : null}
      <div className="space-y-3">
        {trees.map((tree) => {
          const names = db.planters.filter((planter) => planter.treeId === tree.id).map((planter) => planter.displayName)
          return (
            <Link key={tree.id} href={`/admin/trees/${tree.code}`} className="card block">
              <p className="kai text-xl">{tree.code}</p>
              <p>
                {tree.species} · {tx(filters.find((filter) => filter.key === tree.status)?.label || 'tree.statusGrowing')}
              </p>
              {staff.role === 'staff' ? <p>{names.join('、')}</p> : <p>{tree.location}</p>}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
