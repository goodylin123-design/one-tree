'use client'

import { useState } from 'react'
import type { TreeStatus } from '@/lib/types'

const OPTIONS: TreeStatus[] = ['growing', 'watching', 'replant_needed', 'replanted']

export function StatusFields({
  current,
  labels,
  statusLabels,
}: {
  current: TreeStatus
  labels: {
    reason: string
    reasonHint: string
    nextCheck: string
    replantedOn: string
    newSpecies: string
    replantedName: string
    byGuest: string
  }
  statusLabels: Record<TreeStatus, string>
}) {
  const [status, setStatus] = useState<TreeStatus>(current)
  return (
    <fieldset className="space-y-3">
      <div className="space-y-2">
        {OPTIONS.map((option) => (
          <label key={option} className="flex min-h-[52px] items-center gap-3 rounded-xl border border-[#e3dcc4] bg-white px-3">
            <input
              type="radio"
              name="status"
              value={option}
              className="size-6"
              checked={status === option}
              onChange={() => setStatus(option)}
            />
            <span>{statusLabels[option]}</span>
          </label>
        ))}
      </div>
      {status === 'watching' || status === 'replant_needed' ? (
        <label className="block">
          <span className="lbl">{labels.reason}</span>
          <textarea name="reason" required className="field" />
          <span className="mt-1 block text-[16px]">{labels.reasonHint}</span>
        </label>
      ) : null}
      {status === 'watching' ? (
        <label className="block">
          <span className="lbl">{labels.nextCheck}</span>
          <input type="month" name="nextCheck" required className="field" />
        </label>
      ) : null}
      {status === 'replanted' ? (
        <div className="space-y-3">
          <label className="block">
            <span className="lbl">{labels.replantedOn}</span>
            <input type="date" name="replantedOn" required className="field" />
          </label>
          <label className="block">
            <span className="lbl">{labels.newSpecies}</span>
            <input name="newSpecies" className="field" />
          </label>
          <label className="block">
            <span className="lbl">{labels.replantedName}</span>
            <input name="replantedName" className="field" />
          </label>
          <label className="flex min-h-[52px] items-center gap-3">
            <input type="checkbox" name="byGuest" defaultChecked className="size-6" />
            <span>{labels.byGuest}</span>
          </label>
        </div>
      ) : null}
    </fieldset>
  )
}
