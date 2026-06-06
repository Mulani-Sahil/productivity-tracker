import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const userId = (session.user as any).id
  const { searchParams } = new URL(req.url)
  const since = searchParams.get('since')
  const where: any = { userId }
  if (since) where.loggedAt = { gte: new Date(since) }
  const logs = await prisma.hourLog.findMany({ where, orderBy: { loggedAt: 'desc' } })
  return NextResponse.json(logs)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const userId = (session.user as any).id
  const { project, note, minutes } = await req.json()
  const log = await prisma.hourLog.create({ data: { project, note: note || 'Focus session', minutes: minutes || 30, userId } })
  return NextResponse.json(log, { status: 201 })
}
