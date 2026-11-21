export type GroupType = 'association' | 'company' | 'family' | 'individual'
export type TreeStatus = 'growing' | 'watching' | 'replant_needed' | 'replanted'
export type StaffRole = 'staff' | 'nursery'
export type NoticeType = 'watching' | 'replant_needed' | 'replanted'
export type NoticeResult = 'sent' | 'logged' | 'skipped' | 'failed'
export type PhotoKind = 'full' | 'detail'

export type Group = {
  id: string
  code: string
  name: string
  type: GroupType
  stayStart: string
  stayEnd: string
  guestCount: number
  sample: boolean
  createdAt: string
}

export type Tree = {
  id: string
  code: string
  pinHash: string
  pinEnc: string
  tokenHash: string
  tokenEnc: string
  groupId: string
  species: string
  location: string
  plantedOn: string
  status: TreeStatus
  isPublic: boolean
  heightCm: number | null
  statusReason: string
  nextCheckMonth: string
  replantedOn: string
  replantedName: string
  replantedByGuest: boolean
  sample: boolean
  failedAttempts: number
  lockedUntil: string | null
  zone: string
  speciesZh: string
  speciesLatin: string
  lat: number | null
  lng: number | null
  tagCode: string
  adoptable: boolean
  speciesId: string
  cardPhotoUrl: string
}

export type Species = {
  id: string
  speciesZh: string
  speciesLatin: string
  co2KgPerYearAvg: number | null
  co2Basis: string
  updatedAt: string
}

export type CardStatus = 'active' | 'revoked'

export type Adoption = {
  id: string
  treeId: string
  adopterName: string
  adoptedAt: string
  cardKeyHash: string
  cardStatus: CardStatus
  locale: string
}

export type Planter = {
  id: string
  treeId: string
  displayName: string
  contact: string
  notifyConsent: boolean
  locale: string
}

export type TreeUpdate = {
  id: string
  treeId: string
  season: string
  takenOn: string
  photos: { url: string; kind: PhotoKind }[]
  heightCm: number | null
  status: TreeStatus
  species: string
  note: string
  uploader: string
  sample: boolean
  createdAt: string
}

export type TreeMessage = {
  id: string
  treeId: string
  content: string
  isPublic: boolean
  authorName: string
  createdAt: string
  adoptionId?: string
}

export type Certificate = {
  id: string
  groupId: string
  number: string
  localSpend: number | null
  nurseryVisitors: number | null
  treesPlanted: number | null
  sample: boolean
}

export type Notification = {
  id: string
  planterId: string
  treeId: string
  type: NoticeType
  channel: 'email' | 'app'
  sentAt: string
  result: NoticeResult
  detail: string
  body: string
}

export type Staff = {
  id: string
  name: string
  email: string
  passwordHash: string
  role: StaffRole
  failedAttempts: number
  lockedUntil: string | null
}

export type Database = {
  version: 1
  groups: Group[]
  trees: Tree[]
  planters: Planter[]
  updates: TreeUpdate[]
  messages: TreeMessage[]
  certificates: Certificate[]
  notifications: Notification[]
  staff: Staff[]
  adoptions: Adoption[]
  species: Species[]
}
