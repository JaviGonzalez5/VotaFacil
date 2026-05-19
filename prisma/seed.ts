import { PrismaClient } from '@prisma/client'
import { randomBytes } from 'crypto'

const prisma = new PrismaClient()

function generatePublicId() {
  return randomBytes(4).toString('hex')
}

function generateAdminToken() {
  return randomBytes(16).toString('hex')
}

async function main() {
  console.log('🌱 Seeding database...')

  // Clean up
  await prisma.vote.deleteMany()
  await prisma.participant.deleteMany()
  await prisma.pollOption.deleteMany()
  await prisma.poll.deleteMany()

  // Create example poll - simple options
  const simplePoll = await prisma.poll.create({
    data: {
      publicId: generatePublicId(),
      adminToken: generateAdminToken(),
      title: '¿Cuándo jugamos al pádel? 🎾',
      description: 'Elige los días que mejor te vengan para organizar el partido de pádel del grupo.',
      type: 'DATES',
      creatorName: 'Carlos',
      options: {
        create: [
          { label: 'Lunes 26 mayo — 19:00', order: 0 },
          { label: 'Miércoles 28 mayo — 18:30', order: 1 },
          { label: 'Viernes 30 mayo — 20:00', order: 2 },
          { label: 'Sábado 31 mayo — 10:00', order: 3 },
        ],
      },
    },
    include: { options: true },
  })

  // Add some participants and votes
  const participantNames = ['Ana', 'Luis', 'Marta']
  const votePatterns = [
    ['YES', 'NO', 'MAYBE', 'YES'],
    ['YES', 'YES', 'NO', 'MAYBE'],
    ['MAYBE', 'YES', 'YES', 'NO'],
  ]

  for (let i = 0; i < participantNames.length; i++) {
    const participant = await prisma.participant.create({
      data: {
        pollId: simplePoll.id,
        name: participantNames[i],
      },
    })

    for (let j = 0; j < simplePoll.options.length; j++) {
      await prisma.vote.create({
        data: {
          pollId: simplePoll.id,
          optionId: simplePoll.options[j].id,
          participantId: participant.id,
          value: votePatterns[i][j],
        },
      })
    }
  }

  // Create a ranking poll
  const rankingPoll = await prisma.poll.create({
    data: {
      publicId: generatePublicId(),
      adminToken: generateAdminToken(),
      title: '¿Cuál es tu restaurante favorito del grupo?',
      description: 'Votad para decidir dónde celebramos la cena de fin de temporada.',
      type: 'SIMPLE',
      creatorName: 'María',
      options: {
        create: [
          { label: 'La Parrilla Asturiana', order: 0 },
          { label: 'Sushi Zen', order: 1 },
          { label: 'El Rincón Mediterráneo', order: 2 },
        ],
      },
    },
  })

  console.log('✅ Seed completed!')
  console.log('')
  console.log('📊 Example polls created:')
  console.log(`   Pádel poll → http://localhost:3000/p/${simplePoll.publicId}`)
  console.log(`   Ranking poll → http://localhost:3000/p/${rankingPoll.publicId}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
