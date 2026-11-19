import Link from 'next/link'
import { logoutAdmin } from '@/actions/admin'
import { tx } from '@/lib/text'
import type { Staff } from '@/lib/types'

export function AdminShell({ staff, children }: { staff: Staff; children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-paper text-ink">
      <header className="bg-yinyou text-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-4">
          <div>
            <Link href="/admin" className="kai text-2xl text-white no-underline">
              {tx('admin.title')}
            </Link>
            <p className="text-[16px] text-cream">
              {staff.name} · {staff.role === 'staff' ? tx('admin.roleStaff') : tx('admin.roleNursery')}
            </p>
          </div>
          <form action={logoutAdmin}>
            <button type="submit" className="min-h-[52px] rounded-xl border-2 border-cream px-4 font-bold text-white">
              {tx('admin.logout')}
            </button>
          </form>
        </div>
      </header>
      <div className="mx-auto max-w-3xl space-y-5 px-4 py-5">{children}</div>
    </div>
  )
}
