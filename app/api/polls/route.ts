import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { generatePublicId, generateAdminToken } from '@/lib/utils'
import { createPollSchema } from '@/lib/validations'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = createPollSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message ?? 'Datos inválidos' },
        { status: 400 }
      )
    }

    const { title, description, type, creatorName, options } = parsed.data
    const publicId = generatePublicId()
    const adminToken = generateAdminToken()

    // Get logged-in user email if available
    const session = await getServerSession(authOptions)
    const creatorEmail = session?.user?.email ?? null

    const poll = await prisma.poll.create({
      data: {
        publicId,
        adminToken,
        title,
        description,
        type,
        creatorName,
        creatorEmail,
        options: {
          create: options.map((o, idx) => ({
            label: o.label,
            dateTime: o.dateTime ? new Date(o.dateTime) : null,
            order: idx,
          })),
        },
      },
      select: {
        publicId: true,
        adminToken: true,
        title: true,
      },
    })

    return NextResponse.json(
      { publicId: poll.publicId, adminToken: poll.adminToken, title: poll.title },
      { status: 201 }
    )
  } catch (error) {
    console.error('[POST /api/polls]', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
