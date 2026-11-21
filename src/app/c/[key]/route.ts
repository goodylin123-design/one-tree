import { NextResponse } from 'next/server'
import { findAdoptionByKey } from '@/lib/adoptions'
import { isLocale } from '@/i18n/routing'
import { cookieBase, sealTree, TREE_COOKIE } from '@/lib/session'

export const runtime = 'nodejs'

export async function GET(request: Request, { params }: { params: Promise<{ key: string }> }) {
  const { key } = await params
  const found = findAdoptionByKey(decodeURIComponent(key))
  const origin = new URL(request.url).origin
  if (!found) return NextResponse.redirect(new URL('/c/status?state=missing', origin))
  if (found.adoption.cardStatus !== 'active') {
    const lang = isLocale(found.adoption.locale) ? found.adoption.locale : 'zh-TW'
    return NextResponse.redirect(new URL(`/c/status?state=revoked&lang=${lang}`, origin))
  }
  const locale = isLocale(found.adoption.locale) ? found.adoption.locale : 'zh-TW'
  const response = NextResponse.redirect(new URL(`/${locale}/t/${found.tree.code}`, origin))
  response.cookies.set(TREE_COOKIE, sealTree(found.tree.code, found.adoption.id), cookieBase())
  return response
}
