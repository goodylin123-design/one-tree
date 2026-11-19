import { createGroup } from '@/actions/admin'
import { SubmitButton } from '@/components/submit-button'
import { GROUP_TYPES } from '@/lib/catalog'
import { requireStaffUser } from '@/lib/guard'
import { adminProblem, tx } from '@/lib/text'

const typeKey = {
  association: 'admin.association',
  company: 'admin.company',
  family: 'admin.family',
  individual: 'admin.individual',
} as const

export default async function NewGroupPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  await requireStaffUser()
  const query = await searchParams
  const problem = adminProblem(query.error)
  return (
    <form action={createGroup} className="card space-y-4">
      <h1 className="text-3xl text-yinyou-dark">{tx('admin.newGroup')}</h1>
      {problem ? (
        <p role="alert" className="text-terra">
          {problem}
        </p>
      ) : null}
      <label className="block">
        <span className="lbl">{tx('admin.name')}</span>
        <input name="name" required className="field" />
      </label>
      <label className="block">
        <span className="lbl">{tx('admin.type')}</span>
        <select name="type" className="field">
          {GROUP_TYPES.map((type) => (
            <option key={type} value={type}>
              {tx(typeKey[type])}
            </option>
          ))}
        </select>
      </label>
      <label className="block">
        <span className="lbl">{tx('admin.stayStart')}</span>
        <input type="date" name="stayStart" required className="field" />
      </label>
      <label className="block">
        <span className="lbl">{tx('admin.stayEnd')}</span>
        <input type="date" name="stayEnd" required className="field" />
      </label>
      <label className="block">
        <span className="lbl">{tx('admin.guestCount')}</span>
        <input type="number" name="guestCount" min={1} required className="field" />
      </label>
      <SubmitButton pendingLabel={tx('common.pleaseWait')}>{tx('admin.create')}</SubmitButton>
    </form>
  )
}
