import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { addOptionSchema } from '@/lib/validations'

type Params = { params: { publicId: string } }

export async function POST(request: NextRequest, { params }: Params) {
  try {
    const authHeader = request.headers.get('Authorization')
    const token = authHeader?.replace('Bearer ', '')

    const poll = await prisma.poll.findUnique({
      where: { publicId: params.publicId },
      include: { options: { orderBy: { order: 'desc' }, take: 1 } },
    })

    if (!poll) {
      return NextResponse.json({ error: 'Votación no encontrada' }, { status: 404 })
    }
    if (!token || token !== poll.adminToken) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }
    if (poll.isClosed) {
      return NextResponse.json({ error: 'La votación está cerrada' }, { status: 403 })
    }

    const body = await request.json()
    const parsed = addOptionSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message ?? 'Datos inválidos' },
        { status: 400 }
      )
    }

    const { label, dateTime } = parsed.data
    const nextOrder = (poll.options[0]?.order ?? -1) + 1

    const option = await prisma.pollOption.create({
      data: {
        pollId: poll.id,
        label,
        dateTime: dateTime ? new Date(dateTime) : null,
        order: nextOrder,
      },
    })

    return NextResponse.json(option, { status: 201 })
  } catch (error) {
    console.error('[POST /api/polls/[publicId]/options]', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
