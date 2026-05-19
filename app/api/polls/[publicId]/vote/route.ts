import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { submitVoteSchema } from '@/lib/validations'

type Params = { params: { publicId: string } }

export async function POST(request: NextRequest, { params }: Params) {
  try {
    const poll = await prisma.poll.findUnique({
      where: { publicId: params.publicId },
      include: { options: true },
    })

    if (!poll) {
      return NextResponse.json({ error: 'Votación no encontrada' }, { status: 404 })
    }
    if (poll.isClosed) {
      return NextResponse.json({ error: 'Esta votación está cerrada' }, { status: 403 })
    }

    const body = await request.json()
    const parsed = submitVoteSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message ?? 'Datos inválidos' },
        { status: 400 }
      )
    }

    const { name, votes } = parsed.data

    // Validate all optionIds belong to this poll
    const validOptionIds = new Set(poll.options.map((o) => o.id))
    const allValid = votes.every((v) => validOptionIds.has(v.optionId))
    if (!allValid) {
      return NextResponse.json({ error: 'Opción inválida' }, { status: 400 })
    }

    // Upsert participant
    const participant = await prisma.participant.upsert({
      where: {
        pollId_name: { pollId: poll.id, name },
      },
      create: { pollId: poll.id, name },
      update: {},
    })

    // Upsert votes
    await Promise.all(
      votes.map((v) =>
        prisma.vote.upsert({
          where: {
            optionId_participantId: {
              optionId: v.optionId,
              participantId: participant.id,
            },
          },
          create: {
            pollId: poll.id,
            optionId: v.optionId,
            participantId: participant.id,
            value: v.value,
          },
          update: { value: v.value },
        })
      )
    )

    return NextResponse.json({ success: true, participantId: participant.id }, { status: 200 })
  } catch (error) {
    console.error('[POST /api/polls/[publicId]/vote]', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
