import { readDb } from '@/lib/db'
import { formatDateTime } from '@/lib/format'
import { requireStaffUser } from '@/lib/guard'
import { tx } from '@/lib/text'

const typeKey = {
  watching: 'admin.typeWatching',
  replant_needed: 'admin.typeReplant',
  replanted: 'admin.typeReplanted',
} as const

const resultKey = {
  logged: 'admin.resultLogged',
  skipped: 'admin.resultSkipped',
  sent: 'admin.resultSent',
  failed: 'admin.resultFailed',
} as const

export default async function NotificationsPage() {
  await requireStaffUser()
  const db = readDb()
  const notes = [...db.notifications].sort((a, b) => b.sentAt.localeCompare(a.sentAt))
  return (
    <div className="space-y-4">
      <h1 className="text-3xl text-yinyou-dark">{tx('admin.notifications')}</h1>
      {notes.length === 0 ? <p>{tx('admin.emptyNotes')}</p> : null}
      {notes.map((note) => {
        const tree = db.trees.find((item) => item.id === note.treeId)
        const planter = db.planters.find((item) => item.id === note.planterId)
        return (
          <article key={note.id} className="card space-y-2">
            <p className="text-yinyou-dark">
              {formatDateTime(note.sentAt)} · {tx(typeKey[note.type])} · {tx(resultKey[note.result])}
            </p>
            <p>
              {tree?.code} {planter ? `· ${planter.displayName}` : ''}
            </p>
            <p>{note.detail}</p>
            <p>{note.body}</p>
          </article>
        )
      })}
    </div>
  )
}
