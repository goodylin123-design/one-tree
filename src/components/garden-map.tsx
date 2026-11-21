import { gardenPoint } from '@/lib/garden'

export function GardenMap({
  lat,
  lng,
  label,
  title,
  hint,
}: {
  lat: number
  lng: number
  label: string
  title: string
  hint: string
}) {
  const point = gardenPoint(lat, lng)
  const x = 36 + point.x * 248
  const y = 28 + point.y * 168
  return (
    <figure>
      <figcaption className="mb-2 text-yinyou-dark">{title}</figcaption>
      <svg viewBox="0 0 320 220" role="img" aria-label={title} className="w-full rounded-[12px] bg-cream">
        <rect x="24" y="16" width="272" height="188" rx="16" fill="#faf8f1" stroke="#0B6E4B" strokeWidth="2" />
        <path d="M40 150 C 90 140, 120 90, 160 110 S 230 150, 280 70" fill="none" stroke="#8A4B35" strokeWidth="3" />
        <circle cx={x} cy={y} r="10" fill="#0E845A" />
        <text x={x + 14} y={y + 5} fill="#0B6E4B" fontSize="14">
          {label}
        </text>
      </svg>
      <p className="mt-2 text-[16px]">{hint}</p>
    </figure>
  )
}
