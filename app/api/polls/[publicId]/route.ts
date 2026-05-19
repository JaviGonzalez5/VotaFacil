import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

type Params = { params: { publicId: string } }

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const poll = await prisma.poll.findUnique({
      where: { publicId: params.publicId },
      include: {
        options: { orderBy: { order: 'asc' } },
        participants: { orderBy: { createdAt: 'asc' } },
        votes: true,
      },
    })

    if (!poll) {
      return NextResponse.json({ error: 'Votación no encontrada' }, { status: 404 })
    }

    // Never expose adminToken in public endpoint
    const { adminToken: _, ...safePoll } = poll

    return NextResponse.json(safePoll)
  } catch (error) {
    console.error('[GET /api/polls/[publicId]]', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const authHeader = request.headers.get('Authorization')
    const token = authHeader?.replace('Bearer ', '')

    const poll = await prisma.poll.findUnique({ where: { publicId: params.publicId } })
    if (!poll) {
      return NextResponse.json({ error: 'Votación no encontrada' }, { status: 404 })
    }
    if (!token || token !== poll.adminToken) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }

    const body = await request.json()
    const { action } = body

    if (action !== 'close' && action !== 'reopen') {
      return NextResponse.json({ error: 'Acción inválida' }, { status: 400 })
    }

    const updated = await prisma.poll.update({
      where: { publicId: params.publicId },
      data: { isClosed: action === 'close' },
      select: { publicId: true, isClosed: true },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('[PATCH /api/polls/[publicId]]', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const authHeader = request.headers.get('Authorization')
    const token = authHeader?.replace('Bearer ', '')

    const poll = await prisma.poll.findUnique({ where: { publicId: params.publicId } })
    if (!poll) {
      return NextResponse.json({ error: 'Votación no encontrada' }, { status: 404 })
    }
    if (!token || token !== poll.adminToken) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }

    await prisma.poll.delete({ where: { publicId: params.publicId } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[DELETE /api/polls/[publicId]]', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
