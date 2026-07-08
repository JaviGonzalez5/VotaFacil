import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { submitVoteSchema, adminUpdateVoteSchema } from '@/lib/validations'

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

    // Get logged-in user email if available
    const session = await getServerSession(authOptions)
    const voterEmail = session?.user?.email ?? null

    // Upsert participant
    const participant = await prisma.participant.upsert({
      where: {
        pollId_name: { pollId: poll.id, name },
      },
      create: { pollId: poll.id, name, email: voterEmail },
      update: { email: voterEmail ?? undefined },
    })

    // Replace this participant's votes with exactly the submitted set
    // (a participant votes for one option, not yes/no/maybe on every option)
    const submittedOptionIds = votes.map((v) => v.optionId)
    await prisma.vote.deleteMany({
      where: {
        participantId: participant.id,
        optionId: { notIn: submittedOptionIds },
      },
    })
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

function getAdminToken(request: NextRequest): string | undefined {
  return request.headers.get('Authorization')?.replace('Bearer ', '')
}

// Admin: override or clear a single participant's vote on one option
export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const poll = await prisma.poll.findUnique({ where: { publicId: params.publicId } })
    if (!poll) {
      return NextResponse.json({ error: 'Votación no encontrada' }, { status: 404 })
    }
    const token = getAdminToken(request)
    if (!token || token !== poll.adminToken) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }

    const body = await request.json()
    const parsed = adminUpdateVoteSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message ?? 'Datos inválidos' },
        { status: 400 }
      )
    }
    const { participantId, optionId, value } = parsed.data

    const [option, participant] = await Promise.all([
      prisma.pollOption.findUnique({ where: { id: optionId } }),
      prisma.participant.findUnique({ where: { id: participantId } }),
    ])
    if (!option || option.pollId !== poll.id || !participant || participant.pollId !== poll.id) {
      return NextResponse.json({ error: 'Opción o participante inválido' }, { status: 400 })
    }

    if (value === null) {
      await prisma.vote.deleteMany({ where: { optionId, participantId } })
      return NextResponse.json({ success: true })
    }

    // A participant only votes for one option — clear any other selection
    await prisma.vote.deleteMany({
      where: { participantId, optionId: { not: optionId } },
    })
    const vote = await prisma.vote.upsert({
      where: { optionId_participantId: { optionId, participantId } },
      create: { pollId: poll.id, optionId, participantId, value },
      update: { value },
    })

    return NextResponse.json(vote)
  } catch (error) {
    console.error('[PATCH /api/polls/[publicId]/vote]', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
