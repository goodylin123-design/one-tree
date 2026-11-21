import { getTranslations } from 'next-intl/server'
import type { TreeStatus } from '@/lib/types'

const style: Record<TreeStatus, string> = {
  growing: 'bg-[var(--color-yinyou-green)] text-white',
  watching: 'bg-[var(--color-terracotta)] text-white',
  replant_needed: 'bg-[var(--color-terracotta)] text-white',
  replanted: 'bg-[var(--color-cream)] text-[var(--color-yinyou-green-dark)]',
}

export async function StatusBadge({ status }: { status: TreeStatus }) {
  const t = await getTranslations('tree')
  const label = {
    growing: t('statusGrowing'),
    watching: t('statusWatching'),
    replant_needed: t('statusReplantNeeded'),
    replanted: t('statusReplanted'),
  }[status]
  return <span className={`inline-flex min-h-10 items-center rounded-full px-4 text-[16px] font-bold ${style[status]}`}>{label}</span>
}
