'use server'

import { redirect } from 'next/navigation'
import { attemptPin } from '@/lib/access'
import { updateDb } from '@/lib/db'
import { treeCodeFromShortcut } from '@/lib/demo'
import { normalizeCode } from '@/lib/format'
import { asLocale, messagesFor } from '@/lib/messages'
import { nid } from '@/lib/crypto'
import { clearTreeSession, readAdoptionId, readTreeCode, setTreeSession } from '@/lib/session'
import { field } from '@/lib/text'

export async function enterTree(formData: FormData) {
  const locale = asLocale(field(formData, 'locale') || 'zh-TW')
  const rawCode = field(formData, 'code')
  const code = treeCodeFromShortcut(rawCode) ?? normalizeCode(rawCode)
  if (!treeCodeFromShortcut(rawCode)) {
    const pin = field(formData, 'pin')
    const result = await attemptPin(code, pin)
    if (result !== 'ok') {
      redirect(`/${locale}?error=${result}&code=${encodeURIComponent(code)}`)
    }
  }
  await setTreeSession(code)
  redirect(`/${locale}/t/${code}`)
}

export async function leaveTree(formData: FormData) {
  const locale = asLocale(field(formData, 'locale') || 'zh-TW')
  await clearTreeSession()
  redirect(`/${locale}`)
}

export async function addMessage(formData: FormData) {
  const locale = asLocale(field(formData, 'locale') || 'zh-TW')
  const code = normalizeCode(field(formData, 'code'))
  const session = await readTreeCode()
  if (session !== code) redirect(`/${locale}?code=${encodeURIComponent(code)}`)
  const content = field(formData, 'content')
  const author = field(formData, 'author').slice(0, 20) || messagesFor(locale).message.defaultAuthor
  const isPublic = formData.get('isPublic') === 'on'
  const adoptionId = await readAdoptionId()
  if (!content || content.length > 80) {
    redirect(`/${locale}/t/${code}/message?error=length`)
  }
  await updateDb((db) => {
    const tree = db.trees.find((item) => item.code === code)
    if (!tree) return
    db.messages.push({
      id: nid('msg'),
      treeId: tree.id,
      content,
      isPublic,
      authorName: author,
      createdAt: new Date().toISOString(),
      adoptionId,
    })
  })
  redirect(`/${locale}/t/${code}/message?saved=1`)
}
