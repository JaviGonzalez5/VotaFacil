import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  const polls = await prisma.poll.findMany({
    where: { creatorEmail: session.user.email },
    include: {
      _count: { select: { participants: true, options: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(polls)
}
