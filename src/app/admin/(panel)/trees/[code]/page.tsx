import { notFound } from 'next/navigation'
import { savePlanters, saveUpdate } from '@/actions/admin'
import { StatusFields } from '@/components/status-fields'
import { SubmitButton } from '@/components/submit-button'
import { readDb } from '@/lib/db'
import { currentSeason, todayISO } from '@/lib/format'
import { requireUser } from '@/lib/guard'
import { adminProblem, tx } from '@/lib/text'
import type { TreeStatus } from '@/lib/types'

function seasonOptions(year: number) {
  const items = [{ value: 'planted', label: tx('admin.plantedDay') }]
  for (const y of [year - 1, year, year + 1]) {
    for (let quarter = 1; quarter <= 4; quarter += 1) {
      items.push({ value: `${y}-Q${quarter}`, label: `${y}年第${quarter}季` })
    }
  }
  return items
}

export default async function TreeAdminPage({
  params,
  searchParams,
}: {
  params: Promise<{ code: string }>
  searchParams: Promise<{ error?: string; ok?: string; notices?: string }>
}) {
  const staff = await requireUser()
  const { code } = await params
  const query = await searchParams
  const db = readDb()
  const tree = db.trees.find((item) => item.code === code.toUpperCase())
  if (!tree) notFound()
  const planters = db.planters.filter((item) => item.treeId === tree.id)
  const updates = db.updates.filter((item) => item.treeId === tree.id).sort((a, b) => b.takenOn.localeCompare(a.takenOn))
  const problem = adminProblem(query.error)
  const year = new Date().getFullYear()
  const statusLabels: Record<TreeStatus, string> = {
    growing: tx('tree.statusGrowing'),
    watching: tx('tree.statusWatching'),
    replant_needed: tx('tree.statusReplantNeeded'),
    replanted: tx('tree.statusReplanted'),
  }

  return (
    <div className="space-y-5">
      <h1 className="text-3xl text-yinyou-dark">{tree.code}</h1>
      <p>
        {tree.species} · {tree.location} · {statusLabels[tree.status]}
      </p>
      {query.ok ? (
        <p role="status">
          {tx('admin.saved')}
          {Number(query.notices) > 0 ? tx('admin.notices', { count: Number(query.notices) }) : ''}
        </p>
      ) : null}
      {problem ? (
        <p role="alert" className="text-terra">
          {problem}
        </p>
      ) : null}
      {staff.role === 'staff' ? (
        <form action={savePlanters} className="card space-y-4">
          <h2 className="text-2xl">{tx('admin.plantersTitle')}</h2>
          <input type="hidden" name="code" value={tree.code} />
          {planters.map((planter) => (
            <fieldset key={planter.id} className="space-y-2 border-t border-[#e3dcc4] pt-3">
              <label className="block">
                <span className="lbl">{tx('admin.planterLines')}</span>
                <input name={`name_${planter.id}`} defaultValue={planter.displayName} className="field" />
              </label>
              <label className="block">
                <span className="lbl">{tx('admin.contact')}</span>
                <input name={`contact_${planter.id}`} type="email" defaultValue={planter.contact} className="field" />
              </label>
              <label className="flex min-h-[52px] items-center gap-3">
                <input type="checkbox" name={`consent_${planter.id}`} defaultChecked={planter.notifyConsent} className="size-6" />
                <span>{tx('admin.consentOne')}</span>
              </label>
            </fieldset>
          ))}
          <h3 className="text-xl">{tx('admin.addPlanter')}</h3>
          <label className="block">
            <span className="lbl">{tx('admin.planterLines')}</span>
            <input name="addName" className="field" />
          </label>
          <label className="block">
            <span className="lbl">{tx('admin.contact')}</span>
            <input name="addContact" type="email" className="field" />
          </label>
          <label className="flex min-h-[52px] items-center gap-3">
            <input type="checkbox" name="addConsent" className="size-6" />
            <span>{tx('admin.consentOne')}</span>
          </label>
          <SubmitButton pendingLabel={tx('common.pleaseWait')}>{tx('admin.savePlanters')}</SubmitButton>
        </form>
      ) : (
        <p className="card">{tx('admin.nurseryHint')}</p>
      )}
      <form action={saveUpdate} encType="multipart/form-data" className="card space-y-4">
        <h2 className="text-2xl">{tx('admin.updateTitle')}</h2>
        <p className="text-[16px]">{tx('admin.photoHint')}</p>
        <input type="hidden" name="code" value={tree.code} />
        <label className="block">
          <span className="lbl">{tx('admin.season')}</span>
          <select name="season" defaultValue={currentSeason()} className="field">
            {seasonOptions(year).map((season) => (
              <option key={season.value} value={season.value}>
                {season.label}
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
          <input type="file" name="photoFull" accept="image/*" capture="environment" required className="field py-3" />
        </label>
        <label className="block">
          <span className="lbl">{tx('admin.photoDetail')}</span>
          <input type="file" name="photoDetail" accept="image/*" capture="environment" required className="field py-3" />
        </label>
        <label className="block">
          <span className="lbl">{tx('admin.height')}</span>
          <input type="number" name="heightCm" min={0} max={3000} inputMode="numeric" className="field" />
        </label>
        <label className="block">
          <span className="lbl">{tx('admin.note')}</span>
          <textarea name="note" className="field" />
        </label>
        <StatusFields
          current={tree.status}
          statusLabels={statusLabels}
          labels={{
            reason: tx('admin.reason'),
            reasonHint: tx('admin.reasonHint'),
            nextCheck: tx('admin.nextCheck'),
            replantedOn: tx('admin.replantedOn'),
            newSpecies: tx('admin.newSpecies'),
            replantedName: tx('admin.replantedName'),
            byGuest: tx('admin.byGuest'),
          }}
        />
        <SubmitButton pendingLabel={tx('common.pleaseWait')}>{tx('admin.saveUpdate')}</SubmitButton>
      </form>
      <section className="space-y-3">
        <h2 className="text-2xl">{tx('admin.history')}</h2>
        {updates.map((update) => (
          <article key={update.id} className="card space-y-2">
            <p className="kai text-xl">
              {update.season === 'planted' ? tx('admin.plantedDay') : update.season} · {update.takenOn}
            </p>
            <p>{statusLabels[update.status]}</p>
            {update.note ? <p>{update.note}</p> : null}
            <p className="text-[16px]">
              {tx('admin.uploader')}：{update.uploader}
            </p>
            <div className="grid grid-cols-2 gap-2">
              {update.photos.map((photo) => (
                <img key={photo.url + photo.kind} src={photo.url} alt="" className="photo aspect-[3/4]" />
              ))}
            </div>
          </article>
        ))}
      </section>
    </div>
  )
}
