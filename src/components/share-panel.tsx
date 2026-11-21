'use client'

import { useState } from 'react'

type Labels = {
  save: string
  making: string
  saved: string
  shared: string
  fail: string
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

function canvasFamily() {
  return document.documentElement.lang === 'zh-Hant'
    ? '"LXGW WenKai TC", serif'
    : '"Noto Sans SC", "Noto Sans JP", "Noto Sans KR", "Noto Sans TC", sans-serif'
}

function fitText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number) {
  let size = 54
  ctx.font = `700 ${size}px ${canvasFamily()}`
  while (size > 28 && ctx.measureText(text).width > maxWidth) {
    size -= 2
    ctx.font = `700 ${size}px ${canvasFamily()}`
  }
}

export function SharePanel({
  nameLine,
  speciesLine,
  brand,
  photo,
  taglineLead,
  taglineRest,
  labels,
}: {
  nameLine: string
  speciesLine: string
  brand: string
  photo: string
  taglineLead: string
  taglineRest: string
  labels: Labels
}) {
  const [message, setMessage] = useState('')

  async function save() {
    setMessage(labels.making)
    try {
      const family = canvasFamily()
      await document.fonts.load(`700 64px ${family}`)
      await document.fonts.load(`400 32px ${family}`)
      const canvas = document.createElement('canvas')
      canvas.width = 1080
      canvas.height = 1350
      const ctx = canvas.getContext('2d')
      if (!ctx) throw new Error('canvas')
      const colors = getComputedStyle(document.documentElement)
      const green = colors.getPropertyValue('--color-yinyou-green').trim()
      const greenDark = colors.getPropertyValue('--color-yinyou-green-dark').trim()
      const paper = colors.getPropertyValue('--color-paper').trim()
      const cream = colors.getPropertyValue('--color-cream').trim()
      const ink = colors.getPropertyValue('--color-ink').trim()
      ctx.fillStyle = paper
      ctx.fillRect(0, 0, 1080, 1350)
      ctx.fillStyle = green
      ctx.fillRect(0, 0, 1080, 280)
      ctx.fillStyle = cream
      ctx.font = `700 64px ${family}`
      ctx.fillText(taglineLead, 72, 120)
      ctx.fillText(taglineRest, 72, 210)

      const dx = 72
      const dy = 340
      const dw = 936
      const dh = 680
      ctx.save()
      roundRect(ctx, dx, dy, dw, dh, 24)
      ctx.clip()
      ctx.fillStyle = cream
      ctx.fillRect(dx, dy, dw, dh)
      if (photo) {
        const img = new Image()
        img.src = photo
        await img.decode()
        const scale = Math.max(dw / img.width, dh / img.height)
        const sw = dw / scale
        const sh = dh / scale
        ctx.drawImage(img, (img.width - sw) / 2, (img.height - sh) / 2, sw, sh, dx, dy, dw, dh)
      }
      ctx.restore()

      ctx.fillStyle = greenDark
      fitText(ctx, nameLine, 936)
      ctx.fillText(nameLine, 72, 1105)
      ctx.fillStyle = ink
      ctx.font = `400 32px ${family}`
      ctx.fillText(speciesLine, 72, 1175)
      ctx.fillStyle = greenDark
      ctx.font = `400 28px ${family}`
      ctx.fillText(brand, 72, 1260)

      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'))
      if (!blob) throw new Error('blob')
      const file = new File([blob], 'yongjing-tree.png', { type: 'image/png' })
      if (navigator.canShare?.({ files: [file] })) {
        try {
          await navigator.share({ files: [file], title: `${taglineLead}${taglineRest}`, text: nameLine })
          setMessage(labels.shared)
          return
        } catch (error) {
          if (error instanceof DOMException && error.name === 'AbortError') {
            setMessage('')
            return
          }
        }
      }
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = 'yongjing-tree.png'
      link.click()
      setMessage(labels.saved)
    } catch {
      setMessage(labels.fail)
    }
  }

  return (
    <div className="space-y-3">
      <button type="button" className="btn-primary" onClick={save}>
        {labels.save}
      </button>
      {message ? <p role="status">{message}</p> : null}
    </div>
  )
}
