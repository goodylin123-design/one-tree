'use server'

import { redirect } from 'next/navigation'
import { GROUP_TYPES } from '@/lib/catalog'
import { encryptSecret, hashSecret, nid, randomCode, randomPin, randomToken, verifySecret } from '@/lib/crypto'
import { updateDb } from '@/lib/db'
import { nextTreeCode, normalizeCode, planterNames } from '@/lib/format'
import { requireStaffUser, requireUser } from '@/lib/guard'
import { noticeBody } from '@/lib/notify'
import { savePhoto } from '@/lib/photos'
import { clearAdminSession, setAdminSession } from '@/lib/session'
import { field } from '@/lib/text'
import type { Database, GroupType, NoticeResult, TreeStatus } from '@/lib/types'

const LOCK_MS = 10 * 60 * 1000
const STATUSES: TreeStatus[] = ['growing', 'watching', 'replant_needed', 'replanted']

function nextCertificateNumber(db: Database) {
  const year = new Date().getFullYear()
  const prefix = `YJ-C-${year}-`
  let max = 0
  for (const cert of db.certificates) {
    if (!cert.number.startsWith(prefix)) continue
    max = Math.max(max, Number(cert.number.slice(prefix.length)) || 0)
  }
  return `${prefix}${String(max + 1).padStart(3, '0')}`
}

function optionalNumber(value: string) {
  if (!value) return null
  const n = Number(value)
  if (!Number.isFinite(n) || n < 0) return null
  return Math.round(n)
}

export async function loginAdmin(formData: FormData) {
  const email = field(formData, 'email').toLowerCase()
  const password = field(formData, 'password')
  const result = await updateDb((db) => {
    const staff = db.staff.find((item) => item.email === email)
    if (!staff) return 'bad' as const
    if (staff.lockedUntil && Date.parse(staff.lockedUntil) > Date.now()) return 'locked' as const
    if (!password || !verifySecret(password, staff.passwordHash)) {
      staff.failedAttempts += 1
      if (staff.failedAttempts >= 5) {
        staff.failedAttempts = 0
        staff.lockedUntil = new Date(Date.now() + LOCK_MS).toISOString()
        return 'locked' as const
      }
      return 'bad' as const
    }
    staff.failedAttempts = 0
    staff.lockedUntil = null
    return staff.id
  })
  if (result === 'bad') redirect('/admin/login?error=bad')
  if (result === 'locked') redirect('/admin/login?error=locked')
  await setAdminSession(result)
  redirect('/admin')
}

export async function logoutAdmin() {
  await clearAdminSession()
  redirect('/admin/login')
}

export async function createGroup(formData: FormData) {
  await requireStaffUser()
  const name = field(formData, 'name')
  const type = field(formData, 'type')
  const stayStart = field(formData, 'stayStart')
  const stayEnd = field(formData, 'stayEnd')
  const guestCount = Number(field(formData, 'guestCount'))
  const invalid =
    !name ||
    !GROUP_TYPES.includes(type as (typeof GROUP_TYPES)[number]) ||
    !/^\d{4}-\d{2}-\d{2}$/.test(stayStart) ||
    !/^\d{4}-\d{2}-\d{2}$/.test(stayEnd) ||
    stayEnd < stayStart ||
    !Number.isInteger(guestCount) ||
    guestCount < 1
  if (invalid) redirect('/admin/groups/new?error=group')
  const id = nid('grp')
  await updateDb((db) => {
    db.groups.push({
      id,
      code: randomCode(),
      name,
      type: type as GroupType,
      stayStart,
      stayEnd,
      guestCount,
      sample: false,
      createdAt: new Date().toISOString(),
    })
    db.certificates.push({
      id: nid('cert'),
      groupId: id,
      number: nextCertificateNumber(db),
      localSpend: null,
      nurseryVisitors: null,
      treesPlanted: null,
      sample: false,
    })
  })
  redirect(`/admin/groups/${id}`)
}

export async function updateGroup(formData: FormData) {
  await requireStaffUser()
  const id = field(formData, 'groupId')
  const name = field(formData, 'name')
  const type = field(formData, 'type')
  const stayStart = field(formData, 'stayStart')
  const stayEnd = field(formData, 'stayEnd')
  const guestCount = Number(field(formData, 'guestCount'))
  if (!name || !/^\d{4}-\d{2}-\d{2}$/.test(stayStart) || !/^\d{4}-\d{2}-\d{2}$/.test(stayEnd) || stayEnd < stayStart) {
    redirect(`/admin/groups/${id}?error=group`)
  }
  await updateDb((db) => {
    const group = db.groups.find((item) => item.id === id)
    if (!group) return
    group.name = name
    if (GROUP_TYPES.includes(type as (typeof GROUP_TYPES)[number])) group.type = type as GroupType
    group.stayStart = stayStart
    group.stayEnd = stayEnd
    if (Number.isInteger(guestCount) && guestCount > 0) group.guestCount = guestCount
  })
  redirect(`/admin/groups/${id}?ok=1`)
}

export async function saveCertificate(formData: FormData) {
  await requireStaffUser()
  const groupId = field(formData, 'groupId')
  const number = field(formData, 'number')
  await updateDb((db) => {
    let cert = db.certificates.find((item) => item.groupId === groupId)
    if (!cert) {
      cert = {
        id: nid('cert'),
        groupId,
        number: number || nextCertificateNumber(db),
        localSpend: null,
        nurseryVisitors: null,
        treesPlanted: null,
        sample: false,
      }
      db.certificates.push(cert)
    }
    if (number) cert.number = number
    cert.localSpend = optionalNumber(field(formData, 'localSpend'))
    cert.nurseryVisitors = optionalNumber(field(formData, 'nurseryVisitors'))
    cert.treesPlanted = optionalNumber(field(formData, 'treesPlanted'))
    cert.sample = false
  })
  redirect(`/admin/groups/${groupId}?ok=1`)
}

export async function batchTrees(formData: FormData) {
  await requireStaffUser()
  const groupId = field(formData, 'groupId')
  const count = Number(field(formData, 'count'))
  const species = field(formData, 'species')
  const location = field(formData, 'location')
  const plantedOn = field(formData, 'plantedOn')
  const lines = field(formData, 'planters')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
  const consent = formData.get('consent') === 'on'
  const isPublic = formData.get('isPublic') === 'on'
  if (!Number.isInteger(count) || count < 1 || count > 40 || !species || !location || !/^\d{4}-\d{2}-\d{2}$/.test(plantedOn)) {
    redirect(`/admin/groups/${groupId}?error=count`)
  }
  if (lines.length > count) redirect(`/admin/groups/${groupId}?error=lines`)
  const created = await updateDb((db) => {
    const group = db.groups.find((item) => item.id === groupId)
    if (!group) return false
    for (let i = 0; i < count; i += 1) {
      const code = nextTreeCode(
        db.trees.map((item) => item.code),
        plantedOn,
      )
      const pin = randomPin()
      const token = randomToken()
      const treeId = nid('tree')
      db.trees.push({
        id: treeId,
        code,
        pinHash: hashSecret(pin),
        pinEnc: encryptSecret(pin),
        tokenHash: hashSecret(token),
        tokenEnc: encryptSecret(token),
        groupId,
        species,
        location,
        plantedOn,
        status: 'growing',
        isPublic,
        heightCm: null,
        statusReason: '',
        nextCheckMonth: '',
        replantedOn: '',
        replantedName: '',
        replantedByGuest: false,
        sample: false,
        failedAttempts: 0,
        lockedUntil: null,
      })
      const [namePart, contactPart] = (lines[i] || '').split(/[,，]/).map((part) => part.trim())
      const contact = consent && contactPart?.includes('@') ? contactPart : ''
      db.planters.push({
        id: nid('pl'),
        treeId,
        displayName: namePart || '種樹人',
        contact,
        notifyConsent: Boolean(contact),
        locale: 'zh-TW',
      })
    }
    const cert = db.certificates.find((item) => item.groupId === groupId)
    if (cert) {
      cert.treesPlanted = db.trees.filter((item) => item.groupId === groupId).length
      cert.sample = false
    }
    return true
  })
  if (!created) redirect('/admin/groups')
  redirect(`/admin/qr/${groupId}?new=1`)
}

export async function savePlanters(formData: FormData) {
  await requireStaffUser()
  const code = normalizeCode(field(formData, 'code'))
  const addName = field(formData, 'addName')
  const addContact = field(formData, 'addContact')
  const addConsent = formData.get('addConsent') === 'on'
  await updateDb((db) => {
    const tree = db.trees.find((item) => item.code === code)
    if (!tree) return
    for (const planter of db.planters.filter((item) => item.treeId === tree.id)) {
      const name = field(formData, `name_${planter.id}`)
      const contact = field(formData, `contact_${planter.id}`)
      const consent = formData.get(`consent_${planter.id}`) === 'on'
      if (name) planter.displayName = name.slice(0, 30)
      planter.contact = consent && contact.includes('@') ? contact : ''
      planter.notifyConsent = Boolean(planter.contact)
    }
    if (addName) {
      const contact = addConsent && addContact.includes('@') ? addContact : ''
      db.planters.push({
        id: nid('pl'),
        treeId: tree.id,
        displayName: addName.slice(0, 30),
        contact,
        notifyConsent: Boolean(contact),
        locale: 'zh-TW',
      })
    }
  })
  redirect(`/admin/trees/${code}?ok=1&notices=0`)
}

export async function saveUpdate(formData: FormData) {
  const staff = await requireUser()
  const code = normalizeCode(field(formData, 'code'))
  const back = `/admin/trees/${code}`
  const season = field(formData, 'season')
  const takenOn = field(formData, 'takenOn')
  const status = field(formData, 'status') as TreeStatus
  const note = field(formData, 'note')
  const reason = field(formData, 'reason')
  const nextCheck = field(formData, 'nextCheck')
  const replantedOn = field(formData, 'replantedOn')
  const newSpecies = field(formData, 'newSpecies')
  const replantedName = field(formData, 'replantedName')
  const byGuest = formData.get('byGuest') === 'on'
  const heightRaw = field(formData, 'heightCm')
  const height = heightRaw ? Number(heightRaw) : null

  if (!STATUSES.includes(status) || !season || !/^\d{4}-\d{2}-\d{2}$/.test(takenOn)) {
    redirect(`${back}?error=date`)
  }
  if ((status === 'watching' || status === 'replant_needed') && !reason) redirect(`${back}?error=reason`)
  if (status === 'watching' && !/^\d{4}-\d{2}$/.test(nextCheck)) redirect(`${back}?error=check`)
  if (status === 'replanted' && !/^\d{4}-\d{2}-\d{2}$/.test(replantedOn)) redirect(`${back}?error=date`)
  if (height !== null && (!Number.isFinite(height) || height < 0 || height > 3000)) redirect(`${back}?error=date`)

  const full = formData.get('photoFull')
  const detail = formData.get('photoDetail')
  if (!(full instanceof File) || !(detail instanceof File) || full.size === 0 || detail.size === 0) {
    redirect(`${back}?error=photo`)
  }
  let fullUrl = ''
  let detailUrl = ''
  try {
    fullUrl = (await savePhoto(full)) || ''
    detailUrl = (await savePhoto(detail)) || ''
  } catch {
    redirect(`${back}?error=photo`)
  }
  if (!fullUrl || !detailUrl) redirect(`${back}?error=photo`)

  const notices = await updateDb((db) => {
    const tree = db.trees.find((item) => item.code === code)
    if (!tree) return -1
    const species = status === 'replanted' && newSpecies ? newSpecies : tree.species
    tree.species = species
    tree.status = status
    tree.sample = false
    tree.heightCm = height
    tree.statusReason = reason || note
    if (status === 'watching') tree.nextCheckMonth = nextCheck
    if (status === 'replanted') {
      tree.replantedOn = replantedOn
      tree.replantedName = replantedName
      tree.replantedByGuest = byGuest
    }
    db.updates.push({
      id: nid('upd'),
      treeId: tree.id,
      season,
      takenOn,
      photos: [
        { url: fullUrl, kind: 'full' },
        { url: detailUrl, kind: 'detail' },
      ],
      heightCm: height,
      status,
      species,
      note: note || reason,
      uploader: staff.name,
      sample: false,
      createdAt: new Date().toISOString(),
    })
    if (status === 'growing') return 0
    const planters = db.planters.filter((item) => item.treeId === tree.id)
    const body = noticeBody(status, {
      nextCheckMonth: nextCheck,
      plantedOn: tree.plantedOn,
      species,
      reason,
      name: replantedName || planterNames(planters.map((item) => item.displayName)),
      replantedOn,
      replantedByGuest: byGuest,
    })
    const targets = planters.length ? planters : [null]
    for (const planter of targets) {
      let result: NoticeResult = 'logged'
      let detailText = 'Email 尚未設定，已記入通知紀錄，住客頁面已更新。'
      if (!planter || !planter.contact) {
        result = 'skipped'
        detailText = '沒有聯絡方式'
      } else if (!planter.notifyConsent) {
        result = 'skipped'
        detailText = '尚未同意通知'
      }
      db.notifications.push({
        id: nid('nt'),
        planterId: planter?.id || '',
        treeId: tree.id,
        type: status,
        channel: planter?.contact ? 'email' : 'app',
        sentAt: new Date().toISOString(),
        result,
        detail: detailText,
        body,
      })
    }
    return targets.length
  })
  if (notices < 0) redirect('/admin/trees')
  redirect(`${back}?ok=1&notices=${notices}`)
}
