import Link from 'next/link'
import { readDb } from '@/lib/db'
import { requireUser } from '@/lib/guard'
import { tx } from '@/lib/text'

export default async function AdminHome() {
  const staff = await requireUser()
  const db = readDb()
  const watching = db.trees.filter((tree) => tree.status === 'watching').length
  const replant = db.trees.filter((tree) => tree.status === 'replant_needed').length
  return (
    <div className="space-y-4">
      {staff.role === 'nursery' ? <p className="card">{tx('admin.nurseryHint')}</p> : null}
      <div className="grid gap-3 sm:grid-cols-2">
        <p className="card">
          {tx('admin.trees')}：{db.trees.length}
        </p>
        <p className="card">
          {tx('admin.typeWatching')}：{watching}
        </p>
        <p className="card">
          {tx('admin.typeReplant')}：{replant}
        </p>
        {staff.role === 'staff' ? (
          <p className="card">
            {tx('admin.groups')}：{db.groups.length}
          </p>
        ) : null}
      </div>
      <nav className="grid gap-3">
        <Link href="/admin/trees" className="btn-primary">
          {tx('admin.trees')}
        </Link>
        <Link href="/admin/photos" className="btn-outline">
          {tx('admin.photoBatch')}
        </Link>
        {staff.role === 'staff' ? (
          <>
            <Link href="/admin/groups" className="btn-outline">
              {tx('admin.groups')}
            </Link>
            <Link href="/admin/notifications" className="btn-outline">
              {tx('admin.notifications')}
            </Link>
            <Link href="/admin/species" className="btn-outline">
              {tx('admin.speciesTitle')}
            </Link>
          </>
        ) : null}
      </nav>
    </div>
  )
}
