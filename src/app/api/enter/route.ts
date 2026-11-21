import { NextResponse } from 'next/server'
import { verifySecret } from '@/lib/crypto'
import { readDb } from '@/lib/db'
import { normalizeCode } from '@/lib/format'
import { asLocale } from '@/lib/messages'
import { cookieBase, sealTree, TREE_COOKIE } from '@/lib/session'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  const form = await request.formData()
  const code = normalizeCode(String(form.get('code') || ''))
  const token = String(form.get('k') || '')
  const locale = asLocale(String(form.get('locale') || 'zh-TW'))
  const db = readDb()
  const tree = db.trees.find((item) => item.code === code)
  const home = new URL(`/${locale}?error=notfound&code=${encodeURIComponent(code)}`, request.url)
  if (!tree || !token || !verifySecret(token, tree.tokenHash)) {
    return NextResponse.redirect(home, 303)
  }
  const response = NextResponse.redirect(new URL(`/${locale}/t/${code}`, request.url), 303)
  response.cookies.set(TREE_COOKIE, sealTree(code), cookieBase())
  return response
}
