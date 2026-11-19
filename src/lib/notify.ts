import messages from '../../messages/zh-TW.json'
import type { NoticeType } from './types'
import { fill, formatDate, formatMonth } from './format'

export function noticeBody(
  type: NoticeType,
  input: {
    nextCheckMonth?: string
    plantedOn: string
    species: string
    reason: string
    name: string
    replantedOn?: string
    replantedByGuest: boolean
  },
) {
  if (type === 'watching') {
    return fill(messages.notify.watching, { nextMonth: formatMonth(input.nextCheckMonth || '') })
  }
  if (type === 'replant_needed') {
    return fill(messages.notify.replantNeeded, {
      plantedOn: formatDate(input.plantedOn),
      species: input.species,
      reason: input.reason || '苗圃現場確認',
    })
  }
  const template = input.replantedByGuest ? messages.notify.replanted : messages.notify.replantedByNursery
  return fill(template, {
    name: input.name || '種樹人',
    replantedOn: formatDate(input.replantedOn || ''),
    species: input.species,
  })
}
