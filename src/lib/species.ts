import type { Species, Tree } from './types'

export const SPECIES_INFO: Record<string, { latin: string; intro: string }> = {
  青剛櫟: { latin: 'Cyclobalanopsis glauca', intro: 'ringOak' },
  烏心石: { latin: 'Michelia compressa', intro: 'michelia' },
  台灣肖楠: { latin: 'Calocedrus formosana', intro: 'incense' },
  樟樹: { latin: 'Cinnamomum camphora', intro: 'camphor' },
  台灣欒樹: { latin: 'Koelreuteria henryi', intro: 'goldenrain' },
  黃連木: { latin: 'Pistacia chinensis', intro: 'pistache' },
  苦楝: { latin: 'Melia azedarach', intro: 'chinaberry' },
  楓香: { latin: 'Liquidambar formosana', intro: 'sweetgum' },
}

export function speciesInfo(name: string) {
  return SPECIES_INFO[name] ?? { latin: '', intro: 'unknown' }
}

export function speciesKey(name: string) {
  const info = speciesInfo(name)
  if (info.intro !== 'unknown') return `sp_${info.intro}`
  let hash = 0
  for (const char of name) hash = (hash * 33 + char.charCodeAt(0)) >>> 0
  return `sp_${hash.toString(16)}`
}

export function findSpecies(species: Species[], tree: Pick<Tree, 'speciesId' | 'speciesZh' | 'species'>) {
  return species.find((item) => item.id === tree.speciesId) ?? species.find((item) => item.speciesZh === (tree.speciesZh || tree.species)) ?? null
}
