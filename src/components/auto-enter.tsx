'use client'

import { useEffect, useRef } from 'react'

export function AutoEnter({
  code,
  token,
  locale,
  opening,
  button,
}: {
  code: string
  token: string
  locale: string
  opening: string
  button: string
}) {
  const ref = useRef<HTMLFormElement>(null)
  useEffect(() => {
    ref.current?.requestSubmit()
  }, [])
  return (
    <form ref={ref} action="/api/enter" method="post" className="card space-y-4">
      <input type="hidden" name="code" value={code} />
      <input type="hidden" name="k" value={token} />
      <input type="hidden" name="locale" value={locale} />
      <p>{opening}</p>
      <button type="submit" className="btn-primary">
        {button}
      </button>
    </form>
  )
}
