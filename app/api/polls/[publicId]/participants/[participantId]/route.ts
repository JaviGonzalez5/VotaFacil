import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

type Params = { params: { publicId: string; participantId: string } }

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

    const participant = await prisma.participant.findUnique({ where: { id: params.participantId } })
    if (!participant || participant.pollId !== poll.id) {
      return NextResponse.json({ error: 'Participante no encontrado' }, { status: 404 })
    }

    await prisma.participant.delete({ where: { id: params.participantId } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[DELETE /api/polls/[publicId]/participants/[participantId]]', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
