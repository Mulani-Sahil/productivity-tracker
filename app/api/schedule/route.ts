import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const userId = (session.user as any).id
  const { searchParams } = new URL(req.url)
  const date = searchParams.get('date') || new Date().toISOString().slice(0, 10)
  const blocks = await prisma.scheduleDay.findMany({ where: { userId, date } })
  return NextResponse.json(blocks)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const userId = (session.user as any).id
  const { date, blockIndex, done } = await req.json()
  const block = await prisma.scheduleDay.upsert({
    where: { userId_date_blockIndex: { userId, date, blockIndex } },
    update: { done },
    create: { userId, date, blockIndex, done },
  })
  return NextResponse.json(block)
}
