import type { AppLocale } from '@/i18n/routing'
import { fill, formatDate, formatMonth } from './format'
import { messagesFor, phrase } from './messages'
import type { NoticeType } from './types'

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
  locale: AppLocale = 'zh-TW',
) {
  const messages = messagesFor(locale)
  const species = phrase(locale, input.species)
  const reason = input.reason ? phrase(locale, input.reason) : messages.notify.reasonFallback
  const name = phrase(locale, input.name) || messages.tree.unnamed
  if (type === 'watching') {
    return fill(messages.notify.watching, { nextMonth: formatMonth(input.nextCheckMonth || '', locale) })
  }
  if (type === 'replant_needed') {
    return fill(messages.notify.replantNeeded, {
      plantedOn: formatDate(input.plantedOn, locale),
      species,
      reason,
    })
  }
  const template = input.replantedByGuest ? messages.notify.replanted : messages.notify.replantedByNursery
  return fill(template, {
    name,
    replantedOn: formatDate(input.replantedOn || '', locale),
    species,
  })
}
