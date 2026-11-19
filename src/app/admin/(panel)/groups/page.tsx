import Link from 'next/link'
import { requireStaffUser } from '@/lib/guard'
import { readDb } from '@/lib/db'
import { tx } from '@/lib/text'

const typeKey = {
  association: 'admin.association',
  company: 'admin.company',
  family: 'admin.family',
  individual: 'admin.individual',
} as const

export default async function GroupsPage() {
  await requireStaffUser()
  const groups = readDb().groups
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-3xl text-yinyou-dark">{tx('admin.groups')}</h1>
      </div>
      <Link href="/admin/groups/new" className="btn-primary">
        {tx('admin.newGroup')}
      </Link>
      <div className="space-y-3">
        {groups.map((group) => (
          <Link key={group.id} href={`/admin/groups/${group.id}`} className="card block">
            <p className="kai text-2xl">{group.name}</p>
            <p>
              {tx(typeKey[group.type])} · {group.stayStart}
            </p>
          </Link>
        ))}
      </div>
    </div>
  )
}
