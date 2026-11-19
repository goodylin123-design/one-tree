import { redirect } from 'next/navigation'
import { findStaff, getTreeBundle } from './queries'
import { readAdminId, readTreeCode } from './session'
import { normalizeCode } from './format'

export async function requireTree(locale: string, code: string) {
  const normalized = normalizeCode(decodeURIComponent(code))
  const session = await readTreeCode()
  if (session !== normalized) redirect(`/${locale}?code=${encodeURIComponent(normalized)}`)
  const bundle = getTreeBundle(normalized)
  if (!bundle) redirect(`/${locale}?error=notfound&code=${encodeURIComponent(normalized)}`)
  return bundle
}

export async function requireUser() {
  const id = await readAdminId()
  const staff = id ? findStaff(id) : null
  if (!staff) redirect('/admin/login')
  return staff
}

export async function requireStaffUser() {
  const staff = await requireUser()
  if (staff.role !== 'staff') redirect('/admin')
  return staff
}
