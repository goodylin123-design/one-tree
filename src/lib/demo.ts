export const demoGroup = {
  code: 'LELING26',
  name: '示例・樂齡團',
}

export const demoTrees = [
  {
    shortcut: '1',
    code: 'YJ-2027-0001',
    pin: '246810',
    token: 'demo-token-0001',
    label: '生長良好',
    tagCode: 'YJ-TAG-0001',
    cardKey: 'YJCARDDEMO000001',
    lat: 23.92415,
    lng: 120.54785,
  },
  {
    shortcut: '2',
    code: 'YJ-2027-0002',
    pin: '135790',
    token: 'demo-token-0002',
    label: '觀察中',
    tagCode: 'YJ-TAG-0002',
    cardKey: 'YJCARDDEMO000002',
    lat: 23.92402,
    lng: 120.5481,
  },
  {
    shortcut: '3',
    code: 'YJ-2027-0003',
    pin: '112233',
    token: 'demo-token-0003',
    label: '已補種',
    tagCode: 'YJ-TAG-0003',
    cardKey: 'YJCARDDEMO000003',
    lat: 23.92392,
    lng: 120.54795,
  },
  {
    shortcut: '4',
    code: 'YJ-2027-0004',
    pin: '445566',
    token: 'demo-token-0004',
    label: '需要補種',
    tagCode: 'YJ-TAG-0004',
    cardKey: 'YJCARDDEMO000004',
    lat: 23.92428,
    lng: 120.54822,
  },
] as const

export function treeCodeFromShortcut(input: string) {
  const key = input.trim()
  return demoTrees.find((tree) => tree.shortcut === key)?.code ?? null
}

export const demoStaff = {
  email: 'staff.demo@example.com',
  password: 'demo-staff',
  name: '吟遊員工',
}

export const demoNursery = {
  email: 'nursery.demo@example.com',
  password: 'demo-nursery',
  name: '苗圃夥伴',
}
