'use client'

import { useState } from 'react'
import { distanceMeters } from '@/lib/garden'

type NearbyTree = {
  tagCode: string
  species: string
  photo: string
  lat: number
  lng: number
}

type Ranked = NearbyTree & { meters: number }

export function NearbyTrees({
  trees,
  lang,
  title,
  hint,
  button,
  need,
  empty,
  metersLabel,
}: {
  trees: NearbyTree[]
  lang: string
  title: string
  hint: string
  button: string
  need: string
  empty: string
  metersLabel: string
}) {
  const [items, setItems] = useState<Ranked[] | null>(null)
  const [error, setError] = useState('')

  function locate() {
    setError('')
    if (!navigator.geolocation) {
      setError(need)
      return
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const ranked = trees
          .map((tree) => ({
            ...tree,
            meters: Math.round(distanceMeters(position.coords.latitude, position.coords.longitude, tree.lat, tree.lng)),
          }))
          .sort((a, b) => a.meters - b.meters)
          .slice(0, 3)
        setItems(ranked)
      },
      () => setError(need),
      { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 },
    )
  }

  return (
    <section className="card space-y-3">
      <h2 className="text-xl text-yinyou-dark">{title}</h2>
      <p>{hint}</p>
      <button type="button" className="btn-primary" onClick={locate}>
        {button}
      </button>
      {error ? (
        <p role="alert" className="text-terra">
          {error}
        </p>
      ) : null}
      {items && items.length === 0 ? <p>{empty}</p> : null}
      {items && items.length > 0 ? (
        <ul className="space-y-3">
          {items.map((tree) => (
            <li key={tree.tagCode}>
              <a href={`/tag/${encodeURIComponent(tree.tagCode)}?lang=${encodeURIComponent(lang)}`} className="flex gap-3 text-ink no-underline">
                {tree.photo ? <img src={tree.photo} alt="" className="photo h-24 w-20 rounded-[12px] object-cover" /> : null}
                <span>
                  <span className="block text-xl text-yinyou-dark">{tree.species}</span>
                  <span className="nowrap text-[16px]">{metersLabel.replace('{meters}', String(tree.meters))}</span>
                </span>
              </a>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  )
}
