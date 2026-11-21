import { batchSeasonPhotos } from '@/actions/admin'
import { SubmitButton } from '@/components/submit-button'
import { currentSeason, todayISO } from '@/lib/format'
import { requireUser } from '@/lib/guard'
import { adminProblem, tx } from '@/lib/text'

export default async function PhotoBatchPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; ok?: string }>
}) {
  await requireUser()
  const query = await searchParams
  const problem = adminProblem(query.error)
  const year = new Date().getFullYear()
  const seasons = ['planted']
  for (const y of [year - 1, year, year + 1]) {
    for (let quarter = 1; quarter <= 4; quarter += 1) seasons.push(`${y}-Q${quarter}`)
  }
  return (
    <form action={batchSeasonPhotos} encType="multipart/form-data" className="card space-y-4">
      <h1 className="text-3xl text-yinyou-dark">{tx('admin.photoBatch')}</h1>
      <p>{tx('admin.photoBatchHint')}</p>
      {query.ok ? <p role="status">{tx('admin.saved')}</p> : null}
      {problem ? (
        <p role="alert" className="text-terra">
          {problem}
        </p>
      ) : null}
      <label className="block">
        <span className="lbl">{tx('admin.season')}</span>
        <select name="season" defaultValue={currentSeason()} className="field">
          {seasons.map((season) => (
            <option key={season} value={season}>
              {season === 'planted' ? tx('admin.plantedDay') : season}
            </option>
          ))}
        </select>
      </label>
      <label className="block">
        <span className="lbl">{tx('admin.takenOn')}</span>
        <input type="date" name="takenOn" required defaultValue={todayISO()} className="field" />
      </label>
      <label className="block">
        <span className="lbl">{tx('admin.photoFull')}</span>
        <input type="file" name="photos" accept="image/*" multiple required className="field py-3" />
      </label>
      <SubmitButton pendingLabel={tx('common.pleaseWait')}>{tx('admin.photoBatchUpload')}</SubmitButton>
    </form>
  )
}
