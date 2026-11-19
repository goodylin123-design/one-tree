import { readFile } from 'fs/promises'
import path from 'path'
import { NextResponse } from 'next/server'
import { uploadDir } from '@/lib/photos'

export const runtime = 'nodejs'

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params
  if (!/^[a-f0-9]{16}\.jpg$/.test(id)) {
    return new NextResponse('找不到照片', { status: 404 })
  }
  try {
    const data = await readFile(path.join(uploadDir(), id))
    return new NextResponse(data, {
      headers: {
        'Content-Type': 'image/jpeg',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch {
    return new NextResponse('找不到照片', { status: 404 })
  }
}
