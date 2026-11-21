'use client'

export function PrintButton({ label }: { label: string }) {
  return (
    <button type="button" className="btn-primary no-print mb-4" onClick={() => window.print()}>
      {label}
    </button>
  )
}
