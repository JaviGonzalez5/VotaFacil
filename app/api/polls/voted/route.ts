import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const participants = await prisma.participant.findMany({
      where: { email: session.user.email },
      include: {
        poll: {
          select: {
            id: true,
            publicId: true,
            title: true,
            description: true,
            type: true,
            isClosed: true,
            createdAt: true,
            creatorName: true,
            creatorEmail: true,
            _count: { select: { participants: true, options: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    // Filter out polls the user also created (those already appear in "mine")
    const voted = participants
      .map((p) => p.poll)
      .filter((poll) => poll.creatorEmail !== session.user!.email)

    return NextResponse.json(voted)
  } catch (error) {
    console.error('[GET /api/polls/voted]', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
