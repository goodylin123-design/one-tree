import { NextResponse } from 'next/server'
import { cardSvg } from '@/lib/card-file'
import { readAdminId } from '@/lib/session'
import { findStaff } from '@/lib/queries'

export const runtime = 'nodejs'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const staffId = await readAdminId()
  const staff = findStaff(staffId || '')
  if (!staff || staff.role !== 'staff') return new NextResponse('需要員工登入', { status: 401 })
  const { id } = await params
  const key = new URL(request.url).searchParams.get('key') || ''
  const file = await cardSvg(id, key)
  if (!file) return new NextResponse('找不到可印的樹卡', { status: 404 })
  return new NextResponse(file.svg, {
    headers: {
      'Content-Type': 'image/svg+xml; charset=utf-8',
      'Content-Disposition': `attachment; filename="${file.code}.svg"`,
    },
  })
}
