import messages from '../../messages/zh-TW.json'

export function tx(path: string, vars?: Record<string, string | number>) {
  const value = path.split('.').reduce<unknown>((acc, key) => {
    if (acc && typeof acc === 'object' && key in acc) {
      return (acc as Record<string, unknown>)[key]
    }
    return undefined
  }, messages)
  if (typeof value !== 'string') return path
  if (!vars) return value
  return value.replace(/\{(\w+)\}/g, (_, key: string) => String(vars[key] ?? ''))
}

export function field(formData: FormData, name: string) {
  return String(formData.get(name) ?? '').trim()
}

export function adminProblem(code?: string) {
  const key = {
    photo: 'admin.errorPhoto',
    reason: 'admin.errorReason',
    check: 'admin.errorCheck',
    count: 'admin.errorCount',
    lines: 'admin.errorLines',
    group: 'admin.errorGroup',
    date: 'admin.errorDate',
  }[code || '']
  return key ? tx(key) : ''
}
