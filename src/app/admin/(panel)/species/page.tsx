import { saveSpecies } from '@/actions/admin'
import { SubmitButton } from '@/components/submit-button'
import { readDb } from '@/lib/db'
import { requireStaffUser } from '@/lib/guard'
import { adminProblem, tx } from '@/lib/text'

export default async function SpeciesAdminPage({ searchParams }: { searchParams: Promise<{ error?: string; ok?: string }> }) {
  await requireStaffUser()
  const query = await searchParams
  const db = readDb()
  const problem = adminProblem(query.error)
  return (
    <div className="space-y-4">
      <h1 className="text-3xl text-yinyou-dark">{tx('admin.speciesTitle')}</h1>
      <p>{tx('admin.co2Hint')}</p>
      {query.ok ? <p role="status">{tx('admin.saved')}</p> : null}
      {problem ? (
        <p role="alert" className="text-terra">
          {problem}
        </p>
      ) : null}
      {db.species.map((species) => (
        <form key={species.id} action={saveSpecies} className="card space-y-3">
          <h2 className="text-2xl">{species.speciesZh}</h2>
          <input type="hidden" name="id" value={species.id} />
          <label className="block">
            <span className="lbl">{tx('admin.latin')}</span>
            <input name="latin" defaultValue={species.speciesLatin} className="field" />
          </label>
          <label className="block">
            <span className="lbl">{tx('admin.co2')}</span>
            <input name="co2" inputMode="decimal" defaultValue={species.co2KgPerYearAvg ?? ''} className="field" />
          </label>
          <label className="block">
            <span className="lbl">{tx('admin.basis')}</span>
            <input name="basis" defaultValue={species.co2Basis} className="field" />
          </label>
          <SubmitButton pendingLabel={tx('common.pleaseWait')}>{tx('admin.saveSpecies')}</SubmitButton>
        </form>
      ))}
    </div>
  )
}