import type { Metadata } from 'next'
import { AdminShell } from '@/components/admin-shell'
import { requireUser } from '@/lib/guard'

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: '員工後台',
}

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const staff = await requireUser()
  return <AdminShell staff={staff}>{children}</AdminShell>
}
