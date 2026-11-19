import { getTranslations } from 'next-intl/server'
import type { TreeStatus } from '@/lib/types'

const style: Record<TreeStatus, string> = {
  growing: 'bg-yinyou text-white',
  watching: 'bg-terra text-white',
  replant_needed: 'bg-ink text-white',
  replanted: 'bg-cream text-yinyou-dark',
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
